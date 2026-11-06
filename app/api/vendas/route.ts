// app/api/vendas/route.ts
// Vendas e Comissões: listagem com RBAC e registro de venda com split determinístico,
// lançamentos no Fluxo de Caixa e auditoria.

import { NextRequest, NextResponse } from "next/server";
import {
  Prisma,
  PaymentStatus,
  CashFlowType,
  CommissionBeneficiaryType,
  LeadSource,
  LeadTemperature,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession, canManageSaleValues } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { normalizeBrPhone } from "@/lib/utils/phone";
import {
  calculateSaleValues,
  ROLE_TO_BENEFICIARY,
  ParticipantRole,
} from "@/components/crm/vendas/saleSplitHelper";
import { saleInclude, serializeSale, splitCashFlowDescription } from "./serialize";
import { syncLeadSaleCompletion } from "./leadSync";
import { CreateSaleSchema, HttpError, nextSaleCode } from "./saleSchemas";
import { fireSaleMetaCapi } from "./saleCapi";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  if (
    session.role === Role.ADMINISTRADOR_ALUGUEL ||
    session.role === Role.FINANCEIRO_ALUGUEL ||
    session.role === Role.CORRETOR_ALUGUEL
  ) {
    return NextResponse.json({ error: "Acesso restrito ao departamento de Vendas. Aluguel não pode vender." }, { status: 403 });
  }

  const isSaleManager = canManageSaleValues(session.role);

  try {
    const sales = await prisma.sale.findMany({
      where: {
        organizationId: session.organizationId,
        // Financeiro de Vendas e Admin veem todas; Corretor vê apenas vendas em que participa
        ...(isSaleManager
          ? {}
          : {
              OR: [
                { corretorId: session.userId },
                { commissionSplits: { some: { userId: session.userId } } },
              ],
            }),
      },
      include: saleInclude,
      orderBy: { dataVenda: "desc" },
    });

    return NextResponse.json({ sales: sales.map(serializeSale) }, { status: 200 });
  } catch (err: any) {
    console.error("[VENDAS] Erro ao listar vendas:", err?.message);
    return NextResponse.json({ error: "Erro ao listar vendas." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;
  const orgId = session.organizationId;

  if (!canManageSaleValues(session.role)) {
    return NextResponse.json(
      {
        error:
          "Apenas o setor Financeiro e Administradores possuem autorização para formalizar e precificar vendas. Corretores devem solicitar o fechamento comercial no lead.",
      },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateSaleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados da venda inválidos." },
      { status: 400 }
    );
  }
  const input = parsed.data;

  try {
    const titular = input.participants.find((p) => p.role === "CORRETOR_1")!;

    // Participantes precisam ser usuários ativos da organização
    const userIds = Array.from(new Set(input.participants.map((p) => p.userId)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, organizationId: orgId, isActive: true },
      select: { id: true, nome: true, role: true },
    });
    if (users.length !== userIds.length) {
      throw new HttpError(400, "Um ou mais participantes não pertencem à organização.");
    }
    const invalidParticipant = users.find(
      (u) =>
        u.role === Role.CORRETOR_ALUGUEL ||
        u.role === Role.FINANCEIRO_ALUGUEL ||
        u.role === Role.ADMINISTRADOR_ALUGUEL
    );
    if (invalidParticipant) {
      throw new HttpError(400, `O profissional ${invalidParticipant.nome} pertence à modalidade de Aluguel e não pode participar de vendas.`);
    }
    const nameById = new Map(users.map((u) => [u.id, u.nome]));

    const property = await prisma.property.findFirst({
      where: { id: input.propertyId, organizationId: orgId },
      include: { units: { select: { id: true, numeroUnidade: true } } },
    });
    if (!property) throw new HttpError(404, "Empreendimento não encontrado.");

    // Cálculo determinístico
    const calc = calculateSaleValues({
      vgvValue: input.vgv,
      percentualComissao: input.percentualComissao,
      impostoPercentual: input.impostoPercentual,
      isRepasse: input.isRepasse,
      valorRepasse: input.valorRepasse,
      saldoDevedor: input.saldoDevedor,
      baseCalculoComissao: input.baseCalculoComissao,
      participants: input.participants.map((p) => ({
        role: p.role as ParticipantRole,
        userId: p.userId,
        nome: nameById.get(p.userId) || "",
        percentual: p.percentual,
        desconto: p.desconto,
        bonus: p.bonus,
      })),
    });
    if (calc.isOverAllocated) {
      throw new HttpError(
        400,
        `A soma dos participantes excede a comissão líquida em R$ ${calc.excedente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`
      );
    }

    const dataVenda = new Date(`${input.dataVenda}T00:00:00Z`);
    const dataPrevista = input.dataPrevistaPagamento
      ? new Date(`${input.dataPrevistaPagamento}T00:00:00Z`)
      : new Date(dataVenda.getTime() + 30 * 86400000);
    const unit = input.unidadeNumero
      ? property.units.find((u) => u.numeroUnidade.toLowerCase() === input.unidadeNumero!.toLowerCase())
      : undefined;

    const sale = await prisma.$transaction(async (tx) => {
      // 1. Comprador: lead existente ou novo
      let leadId = input.leadId;
      if (leadId) {
        const lead = await tx.lead.findFirst({
          where: { id: leadId, organizationId: orgId },
          select: { id: true, corretorId: true },
        });
        if (!lead) throw new HttpError(404, "Cliente/lead não encontrado.");
      } else {
        const comprador = input.novoComprador!;
        const telefone = normalizeBrPhone(comprador.telefone);
        if (telefone.length < 10) throw new HttpError(400, "Telefone do comprador inválido.");

        const existing = await tx.lead.findFirst({
          where: { organizationId: orgId, telefone },
          select: { id: true, corretorId: true },
        });
        if (existing) {
          leadId = existing.id;
        } else {
          const funnel = await tx.funnel.findFirst({
            where: { organizationId: orgId, isActive: true },
            include: { stages: { orderBy: { posicao: "asc" } } },
            orderBy: { isDefault: "desc" },
          });
          if (!funnel || funnel.stages.length === 0) {
            throw new HttpError(400, "Nenhum funil ativo configurado para cadastrar o comprador.");
          }
          const createdLead = await tx.lead.create({
            data: {
              organizationId: orgId,
              funnelId: funnel.id,
              stageId: (
                funnel.stages.find((st) => /vend|fechad|ganh/i.test(st.nome)) || funnel.stages[0]
              ).id,
              corretorId: titular.userId,
              nome: comprador.nome,
              telefone,
              email: comprador.email || null,
              source: LeadSource.MANUAL_CORRETOR,
              temperatura: LeadTemperature.QUENTE,
            },
          });
          leadId = createdLead.id;
        }
      }

      // 2. Venda
      const codigoVenda = await nextSaleCode(tx, dataVenda.getUTCFullYear());
      const created = await tx.sale.create({
        data: {
          organizationId: orgId,
          codigoVenda,
          leadId: leadId!,
          propertyId: property.id,
          unitId: unit?.id || null,
          corretorId: titular.userId,
          valorVendaVGV: input.vgv,
          valorAvaliacao: input.valorAvaliacao ?? null,
          valorComissaoTotal: calc.comissaoTotalBruta,
          percentualComissao: input.percentualComissao,
          isRepasse: Boolean(input.isRepasse),
          valorRepasse: input.isRepasse ? input.valorRepasse : null,
          entradaRepasse: input.isRepasse ? input.entradaRepasse : null,
          parcelasRepasse: input.isRepasse ? input.parcelasRepasse : null,
          valorParcelaRepasse: input.isRepasse ? input.valorParcelaRepasse : null,
          saldoDevedor: input.isRepasse ? input.saldoDevedor : null,
          titularOriginario: input.isRepasse ? input.titularOriginario : null,
          baseCalculoComissao: input.isRepasse ? input.baseCalculoComissao || "REPASSE" : null,
          meioPagamento: input.meioPagamento,
          status: "ativa",
          statusComissao: "pendente",
          dataVenda,
        },
      });

      // 3. Splits e lançamentos de repasse
      const pixByRole = new Map(input.participants.map((p) => [p.role, p.documentoPix]));
      const payouts = calc.participants.filter((p) => p.valor > 0);
      for (const p of payouts) {
        const tipo = ROLE_TO_BENEFICIARY[p.role] as CommissionBeneficiaryType;
        await tx.commissionSplit.create({
          data: {
            saleId: created.id,
            beneficiarioTipo: tipo,
            userId: p.userId || null,
            nomeBeneficiario: p.nome,
            documentoPix: pixByRole.get(p.role) || null,
            valor: p.valor,
            percentual: p.percentual,
            dataVencimento: dataPrevista,
          },
        });
        await tx.cashFlow.create({
          data: {
            organizationId: orgId,
            tipo: CashFlowType.DESPESA,
            categoria: "Split Comissão",
            descricao: splitCashFlowDescription(tipo, p.nome, codigoVenda),
            valor: p.valor,
            dataVencimento: dataPrevista,
            status: PaymentStatus.PENDENTE,
            modalidade: "VENDA",
            saleId: created.id,
          },
        });
      }

      if (calc.receitaImobiliaria > 0) {
        const org = await tx.organization.findUnique({ where: { id: orgId }, select: { nome: true } });
        await tx.commissionSplit.create({
          data: {
            saleId: created.id,
            beneficiarioTipo: CommissionBeneficiaryType.IMOBILIARIA,
            nomeBeneficiario: org?.nome || "Imobiliária",
            valor: calc.receitaImobiliaria,
            percentual: calc.percentualImobiliaria,
            dataVencimento: dataPrevista,
          },
        });
      }

      // 4. Receita da comissão bruta a receber
      await tx.cashFlow.create({
        data: {
          organizationId: orgId,
          tipo: CashFlowType.RECEITA,
          categoria: "Comissão Venda",
          descricao: `Comissão ${codigoVenda} • ${property.nome}`,
          valor: calc.comissaoTotalBruta,
          dataVencimento: dataPrevista,
          status: PaymentStatus.PENDENTE,
          meioPagamento: input.meioPagamento,
          modalidade: "VENDA",
          saleId: created.id,
        },
      });

      // 5. Sincronização do Lead no Kanban
      if (leadId) {
        await syncLeadSaleCompletion({
          tx,
          leadId,
          userId: session.userId,
          saleId: created.id,
          codigoVenda,
          propertyName: property.nome,
          vgv: input.vgv,
          comissaoBruta: calc.comissaoTotalBruta,
        });
      }

      return tx.sale.findUniqueOrThrow({ where: { id: created.id }, include: saleInclude });
    });

    await recordAudit({
      req,
      organizationId: orgId,
      userId: session.userId,
      acao: "Venda registrada",
      tipoAcao: "CREATE",
      modulo: "VENDAS",
      entidade: "Sale",
      entidadeId: sale.id,
      entidadeNome: sale.codigoVenda,
      descricao: `Venda ${sale.codigoVenda} (${property.nome}) registrada por ${session.nome}.`,
    });

    // Disparo Server-Side CAPI para Meta (Offline Conversion: Purchase)
    fireSaleMetaCapi({
      orgId,
      leadId: sale.leadId,
      codigoVenda: sale.codigoVenda,
      propertyName: property.nome,
      vgv: Number(sale.valorVendaVGV),
      novoComprador: input.novoComprador,
    });

    return NextResponse.json({ success: true, sale: serializeSale(sale) }, { status: 201 });
  } catch (err: any) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "Conflito ao gerar o código da venda. Tente novamente." },
        { status: 409 }
      );
    }
    console.error("[VENDAS] Erro ao registrar venda:", err);
    return NextResponse.json({ error: "Erro interno ao registrar a venda." }, { status: 500 });
  }
}
