// app/api/relatorios/_lib/series.ts
// Séries temporais do BI: VGV (com período anterior), conversão e comissões.

import type { BiGranularityType, BiTimeSeriesPoint } from "@/components/crm/relatorios/types";
import { round1 } from "@/app/api/dashboard/_lib/period";
import {
  Bucket,
  dateOnlyToLocal,
  lastDaysBuckets,
  lastMonthsBuckets,
  lastWeeksBuckets,
  shiftBuckets,
  sumByBucket,
} from "@/app/api/dashboard/_lib/buckets";
import { BiDataset } from "./dataset";

function vgvSeries(dataset: BiDataset, current: Bucket[], previous: Bucket[]): BiTimeSeriesPoint[] {
  const saleDate = (s: BiDataset["sales"][number]) => dateOnlyToLocal(s.dataVenda);
  const cur = sumByBucket(current, dataset.sales, saleDate, (s) => s.vgv);
  const prev = sumByBucket(previous, dataset.sales, saleDate, (s) => s.vgv);
  return current.map((b, i) => ({ label: b.label, realizado: cur[i], anterior: prev[i] }));
}

/** Mensal: 12 meses x mesmo mês do ano anterior. Semanal: 8 semanas x 8 anteriores. Diário: 7 dias x 7 anteriores. */
export function buildVgvSeries(dataset: BiDataset, now: Date = new Date()): Record<BiGranularityType, BiTimeSeriesPoint[]> {
  const months = lastMonthsBuckets(12, now);
  const weeks = lastWeeksBuckets(8, now);
  const days = lastDaysBuckets(7, now);
  return {
    mensal: vgvSeries(dataset, months, shiftBuckets(months, { years: 1 })),
    semanal: vgvSeries(dataset, weeks, shiftBuckets(weeks, { days: 56 })),
    diario: vgvSeries(dataset, days, shiftBuckets(days, { days: 7 })),
  };
}

/** Taxa de conversão mensal (vendas ÷ leads captados no mês) x mesmo mês do ano anterior. */
export function buildConversionSeries(dataset: BiDataset, now: Date = new Date()): BiTimeSeriesPoint[] {
  const months = lastMonthsBuckets(12, now);
  const prevMonths = shiftBuckets(months, { years: 1 });
  const rate = (buckets: Bucket[]) => {
    const leads = sumByBucket(buckets, dataset.leads, (l) => l.createdAt, () => 1);
    const sales = sumByBucket(buckets, dataset.sales, (s) => dateOnlyToLocal(s.dataVenda), () => 1);
    return buckets.map((_, i) => (leads[i] > 0 ? round1((sales[i] / leads[i]) * 100) : 0));
  };
  const cur = rate(months);
  const prev = rate(prevMonths);
  return months.map((b, i) => ({ label: b.label, realizado: cur[i], anterior: prev[i] }));
}

/**
 * Comissões mensais (12 meses).
 * Gestor: realizado = comissão bruta das vendas; auxiliar = repasses pagos a terceiros.
 * Corretor: realizado = suas parcelas de comissão; auxiliar = parcelas já pagas.
 */
export function buildCommissionSeries(
  dataset: BiDataset,
  manager: boolean,
  now: Date = new Date()
): BiTimeSeriesPoint[] {
  const months = lastMonthsBuckets(12, now);
  const splitDate = (s: BiDataset["splits"][number]) => dateOnlyToLocal(s.dataVenda);
  const total = manager
    ? sumByBucket(months, dataset.sales, (s) => dateOnlyToLocal(s.dataVenda), (s) => s.comissao)
    : sumByBucket(months, dataset.splits, splitDate, (s) => s.valor);
  const paid = sumByBucket(months, dataset.splits, splitDate, (s) => (s.pago ? s.valor : 0));
  return months.map((b, i) => ({ label: b.label, realizado: total[i], auxiliar: paid[i] }));
}
