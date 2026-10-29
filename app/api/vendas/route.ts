// app/api/vendas/route.ts
// Vendas e Comissões: listagem com RBAC e registro de venda com split determinístico,
// lançamentos no Fluxo de Caixa e auditoria.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  Prisma,
  PaymentMethod,
  PaymentStatus,
  CashFlowType,
  CommissionBeneficiaryType,
  LeadSource,
  LeadTemperature,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession, isAdmin, canManageSaleValues } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { recordAudit } from "@/lib/services/audit-server";
import { normalizeBrPhone } from "@/lib/utils/phone";
import {
  calculateSaleValues,
  ROLE_TO_BENEFICIARY,
  ParticipantRole,
} from "@/components/crm/vendas/saleSplitHelper";
import { saleInclude, serializeSale, splitCashFlowDescription } from "./serialize";
import { syncLeadSaleCompletion } from "./leadSync";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  if (session.role === Role.FINANCEIRO_ALUGUEL || session.role === Role.CORRETOR_ALUGUEL) {
    return NextResponse.json({ error: "Acesso restrito ao departamento de Vendas." }, { status: 403 });
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

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD).");

const ParticipantSchema = z.object({
  role: z.enum(["CORRETOR_1", "CORRETOR_2", "GESTOR", "CAPTADOR"]),
  userId: z.string().uuid("Participante inválido."),
  percentual: z.number().min(0).max(100),
  desconto: z.number().nonnegative().optional().default(0),
  bonus: z.number().nonnegative().optional().default(0),
  documentoPix: z.string().trim().max(140).optional(),
});

const CreateSaleSchema = z
  .object({
    leadId: z.string().uuid().optional(),
    novoComprador: z
      .object({
        nome: z.string().trim().min(2, "Informe o nome do comprador."),
        telefone: z.string().trim().min(8, "Informe o telefone do comprador."),
        email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")),
      })
      .optional(),
    propertyId: z.string().uuid("Selecione um empreendimento."),
    unidadeNumero: z.string().trim().max(40).optional(),
    dataVenda: dateOnly,
    dataPrevistaPagamento: dateOnly.optional(),
    vgv: z.number().positive("O VGV deve ser maior que zero."),
    valorAvaliacao: z.number().nonnegative().optional(),
    percentualComissao: z.number().positive("Informe a % de comissão.").max(100),
    impostoPercentual: z.number().min(0).max(100).default(6),
    meioPagamento: z.nativeEnum(PaymentMethod).default(PaymentMethod.TED),
    participants: z.array(ParticipantSchema).min(1, "Informe o corretor titular."),
  })
  .refine((d) => Boolean(d.leadId) !== Boolean(d.novoComprador), {
    message: "Selecione um cliente cadastrado ou informe os dados do novo comprador.",
    path: ["leadId"],
  })
  .refine((d) => d.participants.some((p) => p.role === "CORRETOR_1"), {
    message: "O Corretor 1 (titular) é obrigatório.",
    path: ["participants"],
  })
  .refine((d) => new Set(d.participants.map((p) => p.role)).size === d.participants.length, {
    message: "Cada papel do split só pode aparecer uma vez.",
    path: ["participants"],
  });

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function nextSaleCode(tx: Prisma.TransactionClient, year: number) {
  const prefix = `CP-${year}-`;
  const count = await tx.sale.count({ where: { codigoVenda: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
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
    const invalidParticipant = users.find((u) => u.role === Role.CORRETOR_ALUGUEL || u.role === Role.FINANCEIRO_ALUGUEL);
    if (invalidParticipant) {
      throw new HttpError(400, `O profissional ${invalidParticipant.nome} pertence à modalidade de Aluguel e não pode participar de vendas.`);
    }
    const nameById = new Map(users.map((u) => [u.id, u.nome]));

    const property = await prisma.property.findFirst({
      where: { id: input.propertyId, organizationId: orgId },
      include: { units: { select: { id: true, numeroUnidade: true } } },
    });
    if (!property) throw new HttpError(404, "Empreendimento não encontrado.");

    // Cálculo determinístico (o servidor recalcula; não confia nos valores do cliente)
    const calc = calculateSaleValues({
      vgvValue: input.vgv,
      percentualComissao: input.percentualComissao,
      impostoPercentual: input.impostoPercentual,
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
      // 1. Comprador: lead real existente ou novo lead com os dados informados
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
          const created = await tx.lead.create({
            data: {
              organizationId: orgId,
              funnelId: funnel.id,
              // Etapa de venda/fechamento quando existir; senão a primeira etapa do funil
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
          leadId = created.id;
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
          meioPagamento: input.meioPagamento,
          status: "ativa",
          statusComissao: "pendente",
          dataVenda,
        },
      });

      // 3. Splits (somente valores > 0) + parcela da imobiliária (restante)
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
        // Repasse previsto no Fluxo de Caixa (DRE: Custo Variável)
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

      // 4. Receita da comissão bruta a receber da construtora/vendedor
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

      // 5. Sincronização automática do Lead no Kanban (move para Ganho e registra na timeline)
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
      dadosDepois: {
        vgv: input.vgv,
        comissaoBruta: calc.comissaoTotalBruta,
        imposto: calc.impostoEstimado,
        baseLiquida: calc.baseLiquida,
        receitaImobiliaria: calc.receitaImobiliaria,
        participantes: calc.participants.map((p) => ({ papel: p.role, nome: p.nome, valor: p.valor })),
      },
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
