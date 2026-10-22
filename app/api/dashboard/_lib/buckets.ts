// app/api/dashboard/_lib/buckets.ts
// Janelas temporais (meses, semanas, dias) para séries de gráficos. 100% determinístico.

export interface Bucket {
  label: string;
  start: Date;
  end: Date; // exclusivo
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Campos @db.Date chegam como meia-noite UTC: converte para a data local equivalente. */
export function dateOnlyToLocal(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0);
}

/** Jan…Dez do ano informado. */
export function yearMonthBuckets(year: number): Bucket[] {
  return MONTHS.map((label, m) => ({
    label,
    start: new Date(year, m, 1),
    end: new Date(year, m + 1, 1),
  }));
}

/** Últimos N meses (inclui o mês corrente). */
export function lastMonthsBuckets(count: number, now: Date = new Date()): Bucket[] {
  const buckets: Bucket[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    buckets.push({ label: `${MONTHS[start.getMonth()]}/${String(start.getFullYear()).slice(2)}`, start, end });
  }
  return buckets;
}

/** Semanas do mês corrente: Sem 1 (dias 1–7), Sem 2 (8–14)… */
export function monthWeekBuckets(now: Date = new Date()): Bucket[] {
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthEnd = new Date(year, month + 1, 1);
  const buckets: Bucket[] = [];
  for (let w = 0; w < 5; w++) {
    const start = new Date(year, month, 1 + w * 7);
    if (start >= monthEnd) break;
    const end = new Date(Math.min(new Date(year, month, 1 + (w + 1) * 7).getTime(), monthEnd.getTime()));
    buckets.push({ label: `Sem ${w + 1}`, start, end });
  }
  return buckets;
}

/** Últimas N semanas corridas (7 dias cada), terminando hoje. */
export function lastWeeksBuckets(count: number, now: Date = new Date()): Bucket[] {
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const buckets: Bucket[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const end = new Date(todayEnd.getFullYear(), todayEnd.getMonth(), todayEnd.getDate() - i * 7);
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 7);
    buckets.push({ label: `${pad(start.getDate())}/${pad(start.getMonth() + 1)}`, start, end });
  }
  return buckets;
}

/** Últimos N dias (inclui hoje). */
export function lastDaysBuckets(count: number, now: Date = new Date()): Bucket[] {
  const buckets: Bucket[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    buckets.push({ label: `${WEEKDAYS[start.getDay()]} ${pad(start.getDate())}`, start, end });
  }
  return buckets;
}

/** Desloca todas as janelas (ex.: mesmo intervalo no ano anterior). */
export function shiftBuckets(buckets: Bucket[], shift: { years?: number; days?: number }): Bucket[] {
  const move = (d: Date) =>
    new Date(d.getFullYear() - (shift.years || 0), d.getMonth(), d.getDate() - (shift.days || 0));
  return buckets.map((b) => ({ label: b.label, start: move(b.start), end: move(b.end) }));
}

export function bucketIndex(buckets: Bucket[], date: Date): number {
  const t = date.getTime();
  return buckets.findIndex((b) => t >= b.start.getTime() && t < b.end.getTime());
}

/** Soma valores por janela. */
export function sumByBucket<T>(
  buckets: Bucket[],
  items: T[],
  getDate: (item: T) => Date,
  getValue: (item: T) => number
): number[] {
  const totals = buckets.map(() => 0);
  for (const item of items) {
    const idx = bucketIndex(buckets, getDate(item));
    if (idx >= 0) totals[idx] += getValue(item);
  }
  return totals;
}

/** Menor data de início entre conjuntos de janelas (para limitar a consulta). */
export function earliestStart(...groups: Bucket[][]): Date {
  let min = Infinity;
  for (const g of groups) for (const b of g) min = Math.min(min, b.start.getTime());
  return new Date(min);
}
