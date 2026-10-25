// app/api/dashboard/_lib/dashboardMetrics.ts
// Blocos numéricos da Dashboard: financeiro, fluxo de caixa, operacional e séries de vendas.

import {
  AppointmentStatus,
  AppointmentType,
  CashFlowType,
  CommissionBeneficiaryType,
  CreditAnalysisStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { DashboardData, SalesSeriesPoint } from "@/components/crm/dashboard/types";
import { ACTIVE_SALE_WHERE, AnalyticsScope, toNumber } from "./scope";
import { DateRange, PeriodRange, dateOnlyFilter, rangeFilter, round1, trendPercent } from "./period";
import {
  Bucket,
  dateOnlyToLocal,
  earliestStart,
  lastDaysBuckets,
  monthWeekBuckets,
  sumByBucket,
  yearMonthBuckets,
} from "./buckets";

interface SalesTotals {
  vgv: number;
  count: number;
  commission: number;
  splitsPaid: number;
  splitsPending: number;
}

async function salesTotals(scope: AnalyticsScope, range: DateRange | null): Promise<SalesTotals> {
  const saleWhere: Prisma.SaleWhereInput = {
    organizationId: scope.organizationId,
    ...ACTIVE_SALE_WHERE,
    ...scope.sale,
    dataVenda: dateOnlyFilter(range),
  };

  // Gestor: repasses a terceiros (exclui a parcela da própria imobiliária).
  // Corretor: somente as parcelas de comissão destinadas a ele.
  const splitWhere: Prisma.CommissionSplitWhereInput = scope.manager
    ? {
        beneficiarioTipo: { not: CommissionBeneficiaryType.IMOBILIARIA },
        sale: { organizationId: scope.organizationId, ...ACTIVE_SALE_WHERE, dataVenda: dateOnlyFilter(range) },
      }
    : {
        userId: scope.userId,
        sale: { organizationId: scope.organizationId, ...ACTIVE_SALE_WHERE, dataVenda: dateOnlyFilter(range) },
      };

  const [agg, splits] = await Promise.all([
    prisma.sale.aggregate({
      where: saleWhere,
      _sum: { valorVendaVGV: true, valorComissaoTotal: true },
      _count: { _all: true },
    }),
    prisma.commissionSplit.findMany({ where: splitWhere, select: { valor: true, status: true } }),
  ]);

  let splitsPaid = 0;
  let splitsPending = 0;
  for (const s of splits) {
    if (s.status === PaymentStatus.PAGO) splitsPaid += toNumber(s.valor);
    else if (s.status === PaymentStatus.PENDENTE) splitsPending += toNumber(s.valor);
  }

  return {
    vgv: toNumber(agg._sum.valorVendaVGV),
    count: agg._count._all,
    commission: toNumber(agg._sum.valorComissaoTotal),
    splitsPaid,
    splitsPending,
  };
}

export async function loadFinancial(
  scope: AnalyticsScope,
  period: PeriodRange
): Promise<DashboardData["financial"]> {
  const [cur, prev] = await Promise.all([
    salesTotals(scope, period.current),
    period.previous ? salesTotals(scope, period.previous) : Promise.resolve(null),
  ]);

  const ticket = (t: SalesTotals) => (t.count > 0 ? Math.round(t.vgv / t.count) : 0);
  // Gestor: comissão bruta gerada pelas vendas; corretor: comissões já recebidas por ele
  const received = (t: SalesTotals) => (scope.manager ? t.commission : t.splitsPaid);

  return {
    vgvTotal: cur.vgv,
    totalSales: cur.count,
    averageTicket: ticket(cur),
    commissionReceived: received(cur),
    commissionPaid: scope.manager ? cur.splitsPaid : null,
    commissionPending: cur.splitsPending,
    trends: {
      vgvTotal: trendPercent(cur.vgv, prev ? prev.vgv : null),
      totalSales: trendPercent(cur.count, prev ? prev.count : null),
      averageTicket: trendPercent(ticket(cur), prev ? ticket(prev) : null),
      commissionReceived: trendPercent(received(cur), prev ? received(prev) : null),
      commissionPaid: scope.manager ? trendPercent(cur.splitsPaid, prev ? prev.splitsPaid : null) : null,
      commissionPending: trendPercent(cur.splitsPending, prev ? prev.splitsPending : null),
    },
  };
}

async function cashFlowTotals(organizationId: string, range: DateRange | null) {
  const dateFilter = dateOnlyFilter(range);
  const flows = await prisma.cashFlow.findMany({
    where: {
      organizationId,
      status: PaymentStatus.PAGO,
      ...(range
        ? {
            OR: [
              { dataPagamento: rangeFilter(range) },
              { dataPagamento: null, dataVencimento: dateFilter },
            ],
          }
        : {}),
    },
    select: { tipo: true, valor: true },
  });
  let inflow = 0;
  let outflow = 0;
  for (const f of flows) {
    if (f.tipo === CashFlowType.RECEITA) inflow += toNumber(f.valor);
    else outflow += toNumber(f.valor);
  }
  return { inflow, outflow, balance: inflow - outflow };
}

/** Fluxo de caixa da empresa: somente Administradores. */
export async function loadCashFlow(
  scope: AnalyticsScope,
  period: PeriodRange
): Promise<DashboardData["cashFlow"]> {
  if (!scope.director) return null;
  const [cur, prev] = await Promise.all([
    cashFlowTotals(scope.organizationId, period.current),
    period.previous ? cashFlowTotals(scope.organizationId, period.previous) : Promise.resolve(null),
  ]);
  return { ...cur, balanceTrend: trendPercent(cur.balance, prev ? prev.balance : null) };
}

async function visitCounts(scope: AnalyticsScope, range: DateRange | null) {
  const groups = await prisma.appointment.groupBy({
    by: ["status"],
    where: {
      organizationId: scope.organizationId,
      ...scope.appointment,
      tipo: AppointmentType.VISITA,
      dataInicio: rangeFilter(range),
    },
    _count: { _all: true },
  });
  const byStatus = (s: AppointmentStatus) => groups.find((g) => g.status === s)?._count._all || 0;
  const agendadas = byStatus(AppointmentStatus.AGENDADO);
  const realizadas = byStatus(AppointmentStatus.CONCLUIDO);
  const naoCompareceu = byStatus(AppointmentStatus.NAO_COMPARECEU);
  return { agendadas, realizadas, total: agendadas + realizadas + naoCompareceu };
}

export async function loadOperational(
  scope: AnalyticsScope,
  period: PeriodRange
): Promise<DashboardData["operational"]> {
  const orgId = scope.organizationId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const leadBase: Prisma.LeadWhereInput = { organizationId: orgId, ...scope.lead };
  const saleBase: Prisma.SaleWhereInput = { organizationId: orgId, ...ACTIVE_SALE_WHERE, ...scope.sale };

  const [
    creditGroups,
    visits,
    prevVisits,
    activeBrokers,
    availableBrokers,
    leadsCur,
    leadsPrev,
    leadsToday,
    salesCur,
    salesPrev,
  ] = await Promise.all([
    prisma.lead.groupBy({
      by: ["statusCredito"],
      where: { ...leadBase, isClosed: false },
      _count: { _all: true },
    }),
    visitCounts(scope, period.current),
    period.previous ? visitCounts(scope, period.previous) : Promise.resolve(null),
    prisma.user.count({ where: { organizationId: orgId, isActive: true, role: "CORRETOR" } }),
    prisma.user.count({
      where: { organizationId: orgId, isActive: true, role: "CORRETOR", status: "DISPONIVEL" },
    }),
    prisma.lead.count({ where: { ...leadBase, createdAt: rangeFilter(period.current) } }),
    period.previous
      ? prisma.lead.count({ where: { ...leadBase, createdAt: rangeFilter(period.previous) } })
      : Promise.resolve(null),
    prisma.lead.count({ where: { ...leadBase, createdAt: { gte: today } } }),
    prisma.sale.count({ where: { ...saleBase, dataVenda: dateOnlyFilter(period.current) } }),
    period.previous
      ? prisma.sale.count({ where: { ...saleBase, dataVenda: dateOnlyFilter(period.previous) } })
      : Promise.resolve(null),
  ]);

  const credit = (s: CreditAnalysisStatus) => creditGroups.find((g) => g.statusCredito === s)?._count._all || 0;
  const emAnalise =
    credit(CreditAnalysisStatus.EM_ANALISE) +
    credit(CreditAnalysisStatus.DOCUMENTACAO_PENDENTE) +
    credit(CreditAnalysisStatus.CONDICIONADO);
  const aprovadas = credit(CreditAnalysisStatus.APROVADO);
  const reprovadas = credit(CreditAnalysisStatus.REPROVADO);

  const rate = leadsCur > 0 ? round1((salesCur / leadsCur) * 100) : 0;
  const prevRate =
    leadsPrev !== null && leadsPrev > 0 && salesPrev !== null ? round1((salesPrev / leadsPrev) * 100) : null;

  return {
    docs: { total: emAnalise + aprovadas + reprovadas, emAnalise, aprovadas, reprovadas },
    visits: { ...visits, trend: trendPercent(visits.total, prevVisits ? prevVisits.total : null) },
    brokers: { disponiveis: availableBrokers, ativos: activeBrokers },
    leads: { captados: leadsCur, hoje: leadsToday, trend: trendPercent(leadsCur, leadsPrev) },
    conversion: { rate, trendPoints: prevRate === null ? null : round1(rate - prevRate) },
  };
}

/** Séries de VGV e quantidade: Anual (Jan–Dez), Mensal (semanas do mês) e Semanal (7 dias). */
export async function loadSalesSeries(scope: AnalyticsScope): Promise<DashboardData["salesSeries"]> {
  const now = new Date();
  const anual = yearMonthBuckets(now.getFullYear());
  const mensal = monthWeekBuckets(now);
  const semanal = lastDaysBuckets(7, now);
  const since = earliestStart(anual, mensal, semanal);

  const sales = await prisma.sale.findMany({
    where: {
      organizationId: scope.organizationId,
      ...ACTIVE_SALE_WHERE,
      ...scope.sale,
      dataVenda: { gte: new Date(Date.UTC(since.getFullYear(), since.getMonth(), since.getDate())) },
    },
    select: { dataVenda: true, valorVendaVGV: true },
  });

  const toSeries = (buckets: Bucket[]): SalesSeriesPoint[] => {
    const vgv = sumByBucket(buckets, sales, (s) => dateOnlyToLocal(s.dataVenda), (s) => toNumber(s.valorVendaVGV));
    const qty = sumByBucket(buckets, sales, (s) => dateOnlyToLocal(s.dataVenda), () => 1);
    return buckets.map((b, i) => ({ label: b.label, vgv: vgv[i], vendas: qty[i] }));
  };

  return { anual: toSeries(anual), mensal: toSeries(mensal), semanal: toSeries(semanal) };
}
