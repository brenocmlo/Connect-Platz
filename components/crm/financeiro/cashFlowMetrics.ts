// Métricas determinísticas do Fluxo de Caixa: normalização da API, totais do mês,
// variação vs. mês anterior e projeção de saldo a partir dos lançamentos reais.

import type { CashFlowItem } from "./CashFlowTable";
import { localDateKey } from "@/components/crm/agenda/types";

/** Converte o lançamento serializado por /api/financeiro no item da UI. */
export function cashFlowFromApi(raw: any): CashFlowItem {
  return {
    id: raw.id,
    tipo: raw.tipo === "RECEITA" ? "RECEITA" : "DESPESA",
    categoria: raw.categoria,
    descricao: raw.descricao,
    valor: Number(raw.valor) || 0,
    dataVencimento: raw.dataVencimento,
    status: raw.status === "PAGO" ? "PAGO" : "PENDENTE",
    meioPagamento: raw.meioPagamento ?? null,
    dataLiquidacao: raw.dataLiquidacao ?? undefined,
    foiAntecipado: Boolean(raw.foiAntecipado),
    saleId: raw.saleId ?? null,
    bookingId: raw.bookingId ?? null,
    isRecorrente: Boolean(raw.isRecorrente),
  };
}

const monthOf = (iso?: string) => (iso ? iso.slice(0, 7) : null);

function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Soma do que foi liquidado (PAGO) no mês informado, pela data de liquidação. */
function paidInMonth(items: CashFlowItem[], tipo: CashFlowItem["tipo"], month: string) {
  return items
    .filter((c) => c.tipo === tipo && c.status === "PAGO" && monthOf(c.dataLiquidacao || c.dataVencimento) === month)
    .reduce((acc, c) => acc + c.valor, 0);
}

/** Variação % entre períodos; null quando não há base de comparação (badge omitido). */
function trend(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export interface CashFlowSummary {
  receitasMes: number;
  despesasMes: number;
  saldoAtual: number;
  receitasTrend: number | null;
  despesasTrend: number | null;
}

export function computeCashFlowSummary(items: CashFlowItem[], today = new Date()): CashFlowSummary {
  const month = localDateKey(today).slice(0, 7);
  const prev = shiftMonth(month, -1);
  const receitasMes = paidInMonth(items, "RECEITA", month);
  const despesasMes = paidInMonth(items, "DESPESA", month);
  const saldoAtual = items
    .filter((c) => c.status === "PAGO")
    .reduce((acc, c) => acc + (c.tipo === "RECEITA" ? c.valor : -c.valor), 0);
  return {
    receitasMes,
    despesasMes,
    saldoAtual,
    receitasTrend: trend(receitasMes, paidInMonth(items, "RECEITA", prev)),
    despesasTrend: trend(despesasMes, paidInMonth(items, "DESPESA", prev)),
  };
}

export interface ProjectionPoint {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

const HORIZONS: { label: string; days: number }[] = [
  { label: "Hoje", days: 0 },
  { label: "+15 dias", days: 15 },
  { label: "+30 dias", days: 30 },
  { label: "+60 dias", days: 60 },
  { label: "+90 dias", days: 90 },
];

/**
 * Projeção acumulada: saldo liquidado atual + títulos pendentes com vencimento até cada horizonte.
 * Pendências vencidas entram já no ponto "Hoje".
 */
export function computeProjection(items: CashFlowItem[], today = new Date()): ProjectionPoint[] {
  const base = computeCashFlowSummary(items, today).saldoAtual;
  const pendentes = items.filter((c) => c.status === "PENDENTE");
  return HORIZONS.map(({ label, days }) => {
    const limit = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
    const limitKey = localDateKey(limit);
    const due = pendentes.filter((c) => c.dataVencimento <= limitKey);
    const receitas = due.filter((c) => c.tipo === "RECEITA").reduce((a, c) => a + c.valor, 0);
    const despesas = due.filter((c) => c.tipo === "DESPESA").reduce((a, c) => a + c.valor, 0);
    return { mes: label, receitas, despesas, saldo: base + receitas - despesas };
  });
}
