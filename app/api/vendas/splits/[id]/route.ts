// app/api/vendas/splits/[id]/route.ts
// Baixa / estorno de comissão (split): marca PAGO ou PENDENTE, sincroniza o repasse no
// Fluxo de Caixa, recalcula o statusComissao da venda e registra auditoria.
// Restrito ao administrador (regra financeira do AGENTS.md).

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PaymentStatus, CashFlowType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession, ADMIN_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import {
  saleInclude,
  serializeSale,
  splitCashFlowDescription,
  computeStatusComissao,
} from "../../serialize";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PatchSchema = z.object({
  status: z.enum(["PAGO", "PENDENTE"]),
  dataPagamento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de pagamento inválida.")
    .optional(),
  documentoPix: z.string().trim().max(140).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "Comissão não encontrada." }, { status: 404 });
  }

  try {
    const split = await prisma.commissionSplit.findFirst({
      where: { id: params.id, sale: { organizationId: session.organizationId } },
      include: { sale: { select: { id: true, codigoVenda: true, status: true } } },
    });
    if (!split) {
      return NextResponse.json({ error: "Comissão não encontrada." }, { status: 404 });
    }
    if (split.sale.status === "cancelada") {
      return NextResponse.json({ error: "Venda cancelada: comissão não pode ser alterada." }, { status: 409 });
    }

    const { status, dataPagamento, documentoPix } = parsed.data;
    const paidAt =
      status === "PAGO" ? (dataPagamento ? new Date(`${dataPagamento}T12:00:00Z`) : new Date()) : null;

    const updatedSale = await prisma.$transaction(async (tx) => {
      await tx.commissionSplit.update({
        where: { id: split.id },
        data: {
          status: status as PaymentStatus,
          dataPagamento: paidAt,
          ...(documentoPix !== undefined ? { documentoPix: documentoPix || null } : {}),
        },
      });

      // Sincroniza o lançamento de repasse (DESPESA) criado junto com a venda
      if (split.beneficiarioTipo !== "IMOBILIARIA") {
        await tx.cashFlow.updateMany({
          where: {
            organizationId: session.organizationId,
            saleId: split.saleId,
            tipo: CashFlowType.DESPESA,
            categoria: "Split Comissão",
            descricao: splitCashFlowDescription(
              split.beneficiarioTipo,
              split.nomeBeneficiario,
              split.sale.codigoVenda
            ),
          },
          data: { status: status as PaymentStatus, dataPagamento: paidAt },
        });
      }

      const allSplits = await tx.commissionSplit.findMany({
        where: { saleId: split.saleId },
        select: { beneficiarioTipo: true, status: true },
      });
      await tx.sale.update({
        where: { id: split.saleId },
        data: { statusComissao: computeStatusComissao(allSplits) },
      });

      return tx.sale.findUniqueOrThrow({ where: { id: split.saleId }, include: saleInclude });
    });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: status === "PAGO" ? "Baixa de comissão" : "Estorno de baixa de comissão",
      tipoAcao: "STATUS_CHANGE",
      modulo: "VENDAS",
      entidade: "CommissionSplit",
      entidadeId: split.id,
      entidadeNome: `${split.nomeBeneficiario} • ${split.sale.codigoVenda}`,
      descricao: `Comissão de ${split.nomeBeneficiario} (${split.sale.codigoVenda}) marcada como ${status} por ${session.nome}.`,
      dadosAntes: { status: split.status, dataPagamento: split.dataPagamento?.toISOString() ?? null },
      dadosDepois: { status, dataPagamento: paidAt?.toISOString() ?? null },
    });

    return NextResponse.json({ success: true, sale: serializeSale(updatedSale) });
  } catch (err: any) {
    console.error("[VENDAS] Erro ao atualizar comissão:", err);
    return NextResponse.json({ error: "Erro interno ao atualizar a comissão." }, { status: 500 });
  }
}
