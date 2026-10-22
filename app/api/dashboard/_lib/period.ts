// app/api/dashboard/_lib/period.ts
// Resolução determinística de períodos (?period=) e comparação com o período anterior equivalente.
// Compartilhado por /api/dashboard, /api/relatorios, /api/ranking e /api/metas.

export type PeriodKey = "hoje" | "7d" | "mes" | "30d" | "ano" | "todos";

const VALID_PERIODS: PeriodKey[] = ["hoje", "7d", "mes", "30d", "ano", "todos"];

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PeriodRange {
  key: PeriodKey;
  label: string;
  /** null quando o período é "todos" (sem limite inferior) */
  current: DateRange | null;
  /** Período anterior equivalente; null quando não há base de comparação */
  previous: DateRange | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  hoje: "Hoje",
  "7d": "Últimos 7 dias",
  mes: "Mês atual",
  "30d": "Últimos 30 dias",
  ano: "Ano atual",
  todos: "Todo o período",
};

export function parsePeriod(raw: string | null | undefined): PeriodKey {
  const value = String(raw || "").trim() as PeriodKey;
  return VALID_PERIODS.includes(value) ? value : "mes";
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function resolvePeriod(key: PeriodKey, now: Date = new Date()): PeriodRange {
  const label = PERIOD_LABELS[key];
  const end = new Date(now);

  switch (key) {
    case "hoje": {
      const start = startOfDay(now);
      const elapsed = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - DAY_MS);
      return {
        key,
        label,
        current: { start, end },
        previous: { start: prevStart, end: new Date(prevStart.getTime() + elapsed) },
      };
    }
    case "7d":
    case "30d": {
      const days = key === "7d" ? 7 : 30;
      const start = new Date(end.getTime() - days * DAY_MS);
      return {
        key,
        label,
        current: { start, end },
        previous: { start: new Date(start.getTime() - days * DAY_MS), end: start },
      };
    }
    case "mes": {
      // Mês corrente até agora x mesmo intervalo de dias do mês anterior
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
      const elapsed = end.getTime() - start.getTime();
      const prevEnd = new Date(Math.min(prevStart.getTime() + elapsed, prevMonthEnd.getTime()));
      return { key, label, current: { start, end }, previous: { start: prevStart, end: prevEnd } };
    }
    case "ano": {
      const start = new Date(now.getFullYear(), 0, 1);
      const prevStart = new Date(now.getFullYear() - 1, 0, 1);
      const elapsed = end.getTime() - start.getTime();
      return {
        key,
        label,
        current: { start, end },
        previous: { start: prevStart, end: new Date(prevStart.getTime() + elapsed) },
      };
    }
    default:
      return { key: "todos", label, current: null, previous: null };
  }
}

/** Filtro Prisma `{ gte, lte }` para um intervalo (undefined = sem filtro). */
export function rangeFilter(range: DateRange | null): { gte: Date; lte: Date } | undefined {
  return range ? { gte: range.start, lte: range.end } : undefined;
}

export function inRange(date: Date | null | undefined, range: DateRange | null): boolean {
  if (!date) return false;
  if (!range) return true;
  const t = date.getTime();
  return t >= range.start.getTime() && t <= range.end.getTime();
}

/**
 * Variação percentual vs. período anterior.
 * Retorna null quando não há base (período "todos" ou valor anterior zerado).
 */
export function trendPercent(current: number, previous: number | null): number | null {
  if (previous === null || !Number.isFinite(previous) || previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Filtro para colunas @db.Date (ex.: Sale.dataVenda, CashFlow.dataVencimento):
 * compara apenas a data local, sem deslocamento de fuso.
 */
export function dateOnlyFilter(range: DateRange | null): { gte: Date; lte: Date } | undefined {
  if (!range) return undefined;
  const s = range.start;
  const e = range.end;
  return {
    gte: new Date(Date.UTC(s.getFullYear(), s.getMonth(), s.getDate())),
    lte: new Date(Date.UTC(e.getFullYear(), e.getMonth(), e.getDate())),
  };
}

/** Verifica se uma coluna @db.Date (meia-noite UTC) cai no intervalo, comparando só a data local. */
export function inDateOnlyRange(date: Date, range: DateRange | null): boolean {
  if (!range) return true;
  const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const s = range.start;
  const e = range.end;
  const startDay = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
  const endDay = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
  return day >= startDay && day <= endDay;
}
