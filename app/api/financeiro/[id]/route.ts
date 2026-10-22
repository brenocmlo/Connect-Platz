// app/api/financeiro/[id]/route.ts
// Confirmar pagamento / estornar (PATCH) e excluir (DELETE) um lançamento do Fluxo de Caixa.
// Repasses de comissão vinculados a uma venda mantêm o split sincronizado.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PaymentStatus, CashFlowType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession, DIRECTOR_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { serializeCashFlow, parseDateOnly, paymentMethodValues } from "../shared";
import { splitCashFlowDescription, computeStatusComissao } from "../../vendas/serialize";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PatchSchema = z.object({
  status: z.enum(["PAGO", "PENDENTE"]),
  dataPagamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.").optional(),
  meioPagamento: z.enum(paymentMethodValues).nullable().optional(),
  observacao: z.string().trim().max(500).optional(),
});

async function findEntry(id: string, organizationId: string) {
  if (!UUID_RE.test(id)) return null;
  return prisma.cashFlow.findFirst({ where: { id, organizationId } });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireSession(req, DIRECTOR_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
  }

  try {
    const before = await findEntry(params.id, session.organizationId);
    if (!before) return NextResponse.json({ error: "Lançamento não encontrado." }, { status: 404 });
    if (before.status === PaymentStatus.CANCELADO) {
      return NextResponse.json({ error: "Lançamento cancelado não pode ser alterado." }, { status: 409 });
    }

    const { status, dataPagamento, meioPagamento, observacao } = parsed.data;
    const paidAt = status === "PAGO" ? (dataPagamento ? parseDateOnly(dataPagamento) : new Date()) : null;

    const updated = await prisma.$transaction(async (tx) => {
      const entry = await tx.cashFlow.update({
        where: { id: before.id },
        data: {
          status: status as PaymentStatus,
          dataPagamento: paidAt,
          ...(meioPagamento !== undefined ? { meioPagamento } : {}),
          observacaoLiquidacao: status === "PAGO" ? observacao || null : null,
        },
      });

      // Repasse de comissão: mantém o split da venda e o statusComissao coerentes
      if (entry.saleId && entry.tipo === CashFlowType.DESPESA && entry.categoria === "Split Comissão") {
        const sale = await tx.sale.findUnique({
          where: { id: entry.saleId },
          include: { commissionSplits: true },
        });
        const split = sale?.commissionSplits.find(
          (sp) => splitCashFlowDescription(sp.beneficiarioTipo, sp.nomeBeneficiario, sale.codigoVenda) === entry.descricao
        );
        if (sale && split) {
          await tx.commissionSplit.update({
            where: { id: split.id },
            data: { status: status as PaymentStatus, dataPagamento: paidAt },
          });
          const splits = sale.commissionSplits.map((sp) =>
            sp.id === split.id ? { ...sp, status: status as PaymentStatus } : sp
          );
          await tx.sale.update({ where: { id: sale.id }, data: { statusComissao: computeStatusComissao(splits) } });
        }
      }
      return entry;
    });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: status === "PAGO" ? "Lançamento liquidado" : "Liquidação estornada",
      tipoAcao: "STATUS_CHANGE",
      modulo: "FLUXO_DE_CAIXA",
      entidade: "CashFlow",
      entidadeId: updated.id,
      entidadeNome: updated.descricao,
      descricao: `Lançamento "${updated.descricao}" ${status === "PAGO" ? "confirmado" : "estornado para pendente"} por ${session.nome}.${observacao ? ` Obs.: ${observacao}` : ""}`,
      dadosAntes: { status: before.status, dataPagamento: before.dataPagamento?.toISOString() ?? null },
      dadosDepois: { status: updated.status, dataPagamento: updated.dataPagamento?.toISOString() ?? null, observacao },
    });

    return NextResponse.json({ entry: serializeCashFlow(updated) });
  } catch (error: any) {
    console.error("[FINANCEIRO] Erro ao atualizar lançamento:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar o lançamento." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireSession(req, DIRECTOR_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const entry = await findEntry(params.id, session.organizationId);
    if (!entry) return NextResponse.json({ error: "Lançamento não encontrado." }, { status: 404 });
    if (entry.saleId || entry.bookingId) {
      return NextResponse.json(
        { error: "Lançamento gerado por uma venda/reserva. Gerencie-o pela origem." },
        { status: 409 }
      );
    }

    await prisma.cashFlow.delete({ where: { id: entry.id } });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Lançamento financeiro excluído",
      tipoAcao: "DELETE",
      modulo: "FLUXO_DE_CAIXA",
      entidade: "CashFlow",
      entidadeId: entry.id,
      entidadeNome: entry.descricao,
      descricao: `Lançamento "${entry.descricao}" excluído por ${session.nome}.`,
      dadosAntes: serializeCashFlow(entry) as Record<string, unknown>,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[FINANCEIRO] Erro ao excluir lançamento:", error);
    return NextResponse.json({ error: "Erro interno ao excluir o lançamento." }, { status: 500 });
  }
}
