// Métricas determinísticas da tela de Vendas: janela do período, totais e variação vs. período anterior.

import { SaleItem, VendasFilterState } from "./types";

export type PeriodKey = "hoje" | "7d" | "mes" | "30d" | "ano" | "todos";

const DAY = 86400000;

/** Janela [início, fim] do período atual (offset 0) ou do período imediatamente anterior (offset 1). */
export function periodWindow(period: PeriodKey, offset = 0): [number, number] | null {
  if (period === "todos") return null;
  const now = new Date();
  if (period === "mes") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - offset, 1, 0, 0, 0, 0).getTime();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59, 999).getTime();
    return [startOfMonth, endOfMonth];
  }
  if (period === "ano") {
    const startOfYear = new Date(now.getFullYear() - offset, 0, 1, 0, 0, 0, 0).getTime();
    const endOfYear = new Date(now.getFullYear() - offset, 11, 31, 23, 59, 59, 999).getTime();
    return [startOfYear, endOfYear];
  }
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  const endOfToday = startOfToday + DAY - 1;
  const length = period === "hoje" ? DAY : period === "7d" ? 7 * DAY : 30 * DAY;
  return [endOfToday - length * (offset + 1) + 1, endOfToday - length * offset];
}

export function saleTime(sale: SaleItem): number {
  const [y, m, d] = sale.dataVendaIso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0).getTime();
}

export function inWindow(sale: SaleItem, window: [number, number] | null) {
  if (!window) return true;
  const t = saleTime(sale);
  return t >= window[0] && t <= window[1];
}

export function matchesFilters(s: SaleItem, f: VendasFilterState) {
  if (f.status !== "ALL") {
    if (f.status.startsWith("comissao_")) {
      if (s.statusComissao !== f.status.replace("comissao_", "")) return false;
    } else if (s.status !== f.status) return false;
  }
  if (f.corretor !== "ALL" && s.corretorTitular !== f.corretor && s.segundoCorretor !== f.corretor) return false;
  if (f.captador !== "ALL" && s.captador !== f.captador) return false;
  if (f.gestor !== "ALL" && s.gestor !== f.gestor) return false;
  if (f.construtora !== "ALL" && s.construtora !== f.construtora) return false;
  if (f.codigoVenda && !s.codigoVenda.toLowerCase().includes(f.codigoVenda.toLowerCase())) return false;
  if (f.vgvMin && s.vgv < Number(f.vgvMin)) return false;
  if (f.vgvMax && s.vgv > Number(f.vgvMax)) return false;
  return true;
}

export function sortSales(list: SaleItem[], ordenarPor: VendasFilterState["ordenarPor"]) {
  const copy = [...list];
  if (ordenarPor === "vgv_desc") return copy.sort((a, b) => b.vgv - a.vgv);
  if (ordenarPor === "vgv_asc") return copy.sort((a, b) => a.vgv - b.vgv);
  return copy.sort((a, b) => saleTime(b) - saleTime(a));
}

export interface VendasTotals {
  vgvTotal: number;
  totalVendas: number;
  comissaoRecebida: number;
  comissoesPagas: number;
  comissoesPendentes: number;
}

/** Vendas canceladas não entram nos totais. */
export function computeTotals(list: SaleItem[]): VendasTotals {
  const ativas = list.filter((s) => s.status !== "cancelada");
  const sumSplits = (pred: (tipo: string | undefined, status: string) => boolean) =>
    ativas.reduce(
      (acc, s) => acc + s.splits.filter((sp) => pred(sp.tipo, sp.status)).reduce((a, b) => a + b.valor, 0),
      0
    );
  return {
    vgvTotal: ativas.reduce((acc, s) => acc + s.vgv, 0),
    totalVendas: ativas.length,
    // Parcela da imobiliária já baixada como recebida
    comissaoRecebida: sumSplits((tipo, st) => tipo === "IMOBILIARIA" && st === "PAGO"),
    comissoesPagas: sumSplits((tipo, st) => tipo !== "IMOBILIARIA" && st === "PAGO"),
    comissoesPendentes: sumSplits((tipo, st) => tipo !== "IMOBILIARIA" && st === "PENDENTE"),
  };
}

/** Variação % entre períodos; null quando não há base de comparação (badge omitido). */
export function trendOf(current: number, previous: number): number | null {
  if (!Number.isFinite(previous) || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
