// app/api/vendas/[id]/route.ts
// Edição e exclusão de vendas com estorno/atualização de Fluxo de Caixa e Splits.
// Acesso restrito a administradores e gestores financeiros de venda.

import { NextRequest, NextResponse } from "next/server";
import {
  PaymentStatus,
  CashFlowType,
  CommissionBeneficiaryType,
  UnitStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession, canManageSaleValues } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import {
  calculateSaleValues,
  ROLE_TO_BENEFICIARY,
  ParticipantRole,
} from "@/components/crm/vendas/saleSplitHelper";
import {
  saleInclude,
  serializeSale,
  splitCashFlowDescription,
} from "../serialize";
import { UUID_RE, UpdateSaleSchema } from "../saleSchemas";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/vendas/[id]
 * Exclui definitivamente uma venda lançada, removendo seus splits e lançamentos no fluxo de caixa.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  if (!canManageSaleValues(session.role)) {
    return NextResponse.json(
      { error: "Apenas administradores e financeiro de vendas podem excluir vendas." },
      { status: 403 }
    );
  }

  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "Identificador de venda inválido." }, { status: 400 });
  }

  try {
    const sale = await prisma.sale.findFirst({
      where: { id: params.id, organizationId: session.organizationId },
      include: {
        property: { select: { nome: true } },
        corretorTitular: { select: { nome: true } },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Venda não encontrada." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Remove lançamentos vinculados no Fluxo de Caixa
      await tx.cashFlow.deleteMany({
        where: { saleId: sale.id, organizationId: session.organizationId },
      });

      // 2. Remove splits de comissão
      await tx.commissionSplit.deleteMany({
        where: { saleId: sale.id },
      });

      // 3. Libera a unidade no Espelho de Vendas se vinculada
      if (sale.unitId) {
        await tx.propertyUnit.update({
          where: { id: sale.unitId },
          data: { status: UnitStatus.DISPONIVEL },
        });
      }

      // 4. Remove a venda e restaura status financeiro do lead se não houver outra venda
      await tx.sale.delete({ where: { id: sale.id } });
      if (sale.leadId) {
        const otherSales = await tx.sale.count({ where: { leadId: sale.leadId } });
        if (otherSales === 0) {
          await tx.lead.update({
            where: { id: sale.leadId },
            data: { financialApprovalStatus: "NONE" },
          });
        }
      }
    });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Exclusão de Venda",
      tipoAcao: "DELETE",
      modulo: "VENDAS",
      entidade: "Sale",
      entidadeId: sale.id,
      entidadeNome: sale.codigoVenda,
      descricao: `Venda ${sale.codigoVenda} (${sale.property?.nome || "Imóvel"}) excluída definitivamente por ${session.nome}. Lançamentos do fluxo de caixa e comissões revertidos.`,
      dadosAntes: {
        codigoVenda: sale.codigoVenda,
        vgv: Number(sale.valorVendaVGV),
        comissao: Number(sale.valorComissaoTotal),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Venda ${sale.codigoVenda} excluída com sucesso.`,
      deletedId: sale.id,
    });
  } catch (err: any) {
    console.error("[VENDAS] Erro ao excluir venda:", err);
    return NextResponse.json({ error: "Erro interno ao excluir a venda." }, { status: 500 });
  }
}

/**
 * PATCH /api/vendas/[id]
 * Edita uma venda já lançada, recalculando splits e fluxo de caixa.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  if (!canManageSaleValues(session.role)) {
    return NextResponse.json(
      { error: "Apenas administradores e financeiro de vendas podem editar vendas." },
      { status: 403 }
    );
  }

  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "Identificador de venda inválido." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = UpdateSaleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados de edição inválidos." },
      { status: 400 }
    );
  }

  const input = parsed.data;

  try {
    const existing = await prisma.sale.findFirst({
      where: { id: params.id, organizationId: session.organizationId },
      include: {
        commissionSplits: true,
        cashFlowEntries: true,
        property: { include: { units: true } },
      },
    });
    if (!existing) return NextResponse.json({ error: "Venda não encontrada." }, { status: 404 });

    const vgvValue = input.vgv ?? Number(existing.valorVendaVGV);
    const percentualComissao = input.percentualComissao ?? Number(existing.percentualComissao);
    const totalPrevSplits = existing.commissionSplits.reduce((s, sp) => s + Number(sp.valor), 0);
    const prevGross = Number(existing.valorComissaoTotal) || 0;
    const inferredTaxPct =
      prevGross > 0 && totalPrevSplits > 0 && totalPrevSplits < prevGross
        ? Math.max(0, Number((((prevGross - totalPrevSplits) / prevGross) * 100).toFixed(2)))
        : 0;
    const impostoPercentual = input.impostoPercentual ?? inferredTaxPct;
    const isRepasse = input.isRepasse !== undefined ? input.isRepasse : Boolean(existing.isRepasse);
    const valorRepasse =
      input.valorRepasse !== undefined ? (input.valorRepasse ?? undefined) : existing.valorRepasse ? Number(existing.valorRepasse) : undefined;
    const saldoDevedor =
      input.saldoDevedor !== undefined ? (input.saldoDevedor ?? undefined) : existing.saldoDevedor ? Number(existing.saldoDevedor) : undefined;
    const baseCalculoComissao =
      input.baseCalculoComissao !== undefined
        ? (input.baseCalculoComissao ?? "REPASSE")
        : (existing.baseCalculoComissao as any) || "REPASSE";
    const dataVenda = input.dataVenda ? new Date(`${input.dataVenda}T00:00:00Z`) : existing.dataVenda;
    const targetUnit =
      input.unidadeNumero !== undefined
        ? input.unidadeNumero
          ? existing.property?.units.find(
              (u) => u.numeroUnidade.toLowerCase() === input.unidadeNumero!.toLowerCase()
            ) || null
          : null
        : undefined;

    let participantsToCalculate = input.participants;
    let nameById = new Map<string, string>();

    if (participantsToCalculate && participantsToCalculate.length > 0) {
      const userIds = Array.from(new Set(participantsToCalculate.map((p) => p.userId)));
      const users = await prisma.user.findMany({
        where: { id: { in: userIds }, organizationId: session.organizationId },
        select: { id: true, nome: true, role: true },
      });
      nameById = new Map(users.map((u) => [u.id, u.nome]));
    }

    const updatedSale = await prisma.$transaction(async (tx) => {
      let calc;
      if (participantsToCalculate && participantsToCalculate.length > 0) {
        calc = calculateSaleValues({
          vgvValue,
          percentualComissao,
          impostoPercentual,
          isRepasse,
          valorRepasse,
          saldoDevedor,
          baseCalculoComissao,
          participants: participantsToCalculate.map((p) => ({
            role: p.role as ParticipantRole,
            userId: p.userId,
            nome: nameById.get(p.userId) || "",
            percentual: p.percentual,
            desconto: p.desconto,
            bonus: p.bonus,
          })),
        });

        if (calc.isOverAllocated) {
          throw new Error(
            `A soma dos participantes excede a base líquida em R$ ${calc.excedente.toFixed(2)}.`
          );
        }
      }

      // Atualiza a venda principal
      const updated = await tx.sale.update({
        where: { id: existing.id },
        data: {
          dataVenda,
          valorVendaVGV: vgvValue,
          isRepasse,
          valorRepasse: isRepasse ? valorRepasse : null,
          entradaRepasse: isRepasse ? (input.entradaRepasse !== undefined ? input.entradaRepasse : existing.entradaRepasse ? Number(existing.entradaRepasse) : null) : null,
          parcelasRepasse: isRepasse ? (input.parcelasRepasse !== undefined ? input.parcelasRepasse : existing.parcelasRepasse) : null,
          valorParcelaRepasse: isRepasse ? (input.valorParcelaRepasse !== undefined ? input.valorParcelaRepasse : existing.valorParcelaRepasse ? Number(existing.valorParcelaRepasse) : null) : null,
          saldoDevedor: isRepasse ? saldoDevedor : null,
          titularOriginario: isRepasse ? (input.titularOriginario !== undefined ? input.titularOriginario : existing.titularOriginario) : null,
          clausulaRepasse: isRepasse ? (input.clausulaRepasse !== undefined ? input.clausulaRepasse : existing.clausulaRepasse) : null,
          baseCalculoComissao: isRepasse ? baseCalculoComissao : null,
          ...(input.valorAvaliacao !== undefined ? { valorAvaliacao: input.valorAvaliacao } : {}),
          ...(calc ? { valorComissaoTotal: calc.comissaoTotalBruta } : {}),
          ...(targetUnit !== undefined ? { unitId: targetUnit?.id || null } : {}),
          percentualComissao,
          ...(input.meioPagamento ? { meioPagamento: input.meioPagamento } : {}),
        },
      });

      if (targetUnit !== undefined && targetUnit?.id !== existing.unitId) {
        if (existing.unitId) {
          await tx.propertyUnit.update({ where: { id: existing.unitId }, data: { status: UnitStatus.DISPONIVEL } });
        }
        if (targetUnit?.id) {
          await tx.propertyUnit.update({ where: { id: targetUnit.id }, data: { status: UnitStatus.VENDIDA } });
        }
      }

      // Se os participantes/valores foram alterados, sincroniza splits e fluxo de caixa
      if (calc && participantsToCalculate) {
        // Preserva o status dos splits existentes caso continuem pagos
        const existingSplitsByRole = new Map(
          existing.commissionSplits.map((sp) => [sp.beneficiarioTipo, sp])
        );

        // Remove splits antigos e recria os novos
        await tx.commissionSplit.deleteMany({ where: { saleId: existing.id } });
        await tx.cashFlow.deleteMany({
          where: { saleId: existing.id, organizationId: session.organizationId },
        });

        const pixByRole = new Map(participantsToCalculate.map((p) => [p.role, p.documentoPix]));
        const payouts = calc.participants.filter((p) => p.valor > 0);

        for (const p of payouts) {
          const tipo = ROLE_TO_BENEFICIARY[p.role] as CommissionBeneficiaryType;
          const prevSplit = existingSplitsByRole.get(tipo);
          const splitStatus = prevSplit?.status === PaymentStatus.PAGO ? PaymentStatus.PAGO : PaymentStatus.PENDENTE;
          const paidAt = prevSplit?.dataPagamento || null;

          await tx.commissionSplit.create({
            data: {
              saleId: updated.id,
              beneficiarioTipo: tipo,
              userId: p.userId || null,
              nomeBeneficiario: p.nome,
              documentoPix: pixByRole.get(p.role) || null,
              valor: p.valor,
              percentual: p.percentual,
              dataVencimento: prevSplit?.dataVencimento || new Date(dataVenda.getTime() + 30 * 86400000),
              status: splitStatus,
              dataPagamento: paidAt,
              comprovanteUrl: prevSplit?.comprovanteUrl || null,
            },
          });

          await tx.cashFlow.create({
            data: {
              organizationId: session.organizationId,
              tipo: CashFlowType.DESPESA,
              categoria: "Split Comissão",
              descricao: splitCashFlowDescription(tipo, p.nome, existing.codigoVenda),
              valor: p.valor,
              dataVencimento: prevSplit?.dataVencimento || new Date(dataVenda.getTime() + 30 * 86400000),
              status: splitStatus,
              dataPagamento: paidAt,
              modalidade: "VENDA",
              saleId: updated.id,
              anexoUrl: prevSplit?.comprovanteUrl || null,
            },
          });
        }

        if (calc.receitaImobiliaria > 0) {
          const org = await tx.organization.findUnique({
            where: { id: session.organizationId },
            select: { nome: true },
          });
          await tx.commissionSplit.create({
            data: {
              saleId: updated.id,
              beneficiarioTipo: CommissionBeneficiaryType.IMOBILIARIA,
              nomeBeneficiario: org?.nome || "Imobiliária",
              valor: calc.receitaImobiliaria,
              percentual: calc.percentualImobiliaria,
              dataVencimento: new Date(dataVenda.getTime() + 30 * 86400000),
            },
          });
        }

        // Receita da comissão no fluxo de caixa (preservando status se já recebida)
        const prevRevenue = existing.cashFlowEntries.find(
          (cf) => cf.tipo === CashFlowType.RECEITA && cf.categoria === "Comissão Venda"
        );
        await tx.cashFlow.create({
          data: {
            organizationId: session.organizationId,
            tipo: CashFlowType.RECEITA,
            categoria: "Comissão Venda",
            descricao: `Comissão ${existing.codigoVenda} • ${existing.property?.nome || "Imóvel"}`,
            valor: calc.comissaoTotalBruta,
            dataVencimento: prevRevenue?.dataVencimento || new Date(dataVenda.getTime() + 30 * 86400000),
            status: prevRevenue?.status || PaymentStatus.PENDENTE,
            dataPagamento: prevRevenue?.dataPagamento || null,
            meioPagamento: input.meioPagamento || prevRevenue?.meioPagamento || existing.meioPagamento,
            modalidade: "VENDA",
            saleId: updated.id,
          },
        });
      }

      return tx.sale.findUniqueOrThrow({
        where: { id: updated.id },
        include: saleInclude,
      });
    });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Edição de Venda",
      tipoAcao: "UPDATE",
      modulo: "VENDAS",
      entidade: "Sale",
      entidadeId: updatedSale.id,
      entidadeNome: updatedSale.codigoVenda,
      descricao: `Venda ${updatedSale.codigoVenda} editada por ${session.nome}. Valores e splits recalculados.`,
    });

    return NextResponse.json({ success: true, sale: serializeSale(updatedSale) });
  } catch (err: any) {
    console.error("[VENDAS] Erro ao editar venda:", err);
    return NextResponse.json(
      { error: err?.message || "Erro interno ao editar venda." },
      { status: 500 }
    );
  }
}
