// app/api/financeiro/shared.ts
// Serialização e utilitários dos lançamentos do Fluxo de Caixa.

import { CashFlow, PaymentMethod } from "@prisma/client";

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export function serializeCashFlow(c: CashFlow) {
  return {
    id: c.id,
    tipo: c.tipo,
    categoria: c.categoria,
    descricao: c.descricao,
    valor: Number(c.valor),
    dataVencimento: isoDate(c.dataVencimento),
    status: c.status,
    meioPagamento: c.meioPagamento,
    dataLiquidacao: c.dataPagamento ? isoDate(c.dataPagamento) : null,
    // Liquidado antes do vencimento
    foiAntecipado: Boolean(c.dataPagamento && isoDate(c.dataPagamento) < isoDate(c.dataVencimento)),
    saleId: c.saleId,
    bookingId: c.bookingId,
    isRecorrente: c.isRecorrente,
    centroCusto: c.centroCusto,
    observacaoLiquidacao: c.observacaoLiquidacao,
  };
}

/** Converte "AAAA-MM-DD" em Date (meio-dia UTC evita deslocamento de fuso em colunas @db.Date). */
export function parseDateOnly(value: string): Date {
  return new Date(`${value}T12:00:00Z`);
}

export const paymentMethodValues = Object.values(PaymentMethod) as [PaymentMethod, ...PaymentMethod[]];
