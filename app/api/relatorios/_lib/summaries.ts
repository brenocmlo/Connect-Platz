// app/api/relatorios/_lib/summaries.ts
// Cards-resumo do BI (VGV, tempo de funil, ROI, conversão e comissões) e base LGPD de leads encerrados.

import type {
  BiChannelRoiMetric,
  BiFunnelStageMetric,
  BiLgpdClosedLead,
  BiMetricSummary,
} from "@/components/crm/relatorios/types";
import { prisma } from "@/lib/db/prisma";
import { AnalyticsScope } from "@/app/api/dashboard/_lib/scope";
import {
  DateRange,
  PeriodRange,
  inDateOnlyRange,
  inRange,
  round1,
  trendPercent,
} from "@/app/api/dashboard/_lib/period";
import { BiDataset } from "./dataset";

function totals(dataset: BiDataset, range: DateRange | null, manager: boolean) {
  let vgv = 0;
  let vendas = 0;
  let comissaoBruta = 0;
  for (const s of dataset.sales) {
    if (!inDateOnlyRange(s.dataVenda, range)) continue;
    vgv += s.vgv;
    vendas += 1;
    comissaoBruta += s.comissao;
  }
  let splitsTotal = 0;
  let splitsPagos = 0;
  for (const s of dataset.splits) {
    if (!inDateOnlyRange(s.dataVenda, range)) continue;
    splitsTotal += s.valor;
    if (s.pago) splitsPagos += s.valor;
  }
  const leads = dataset.leads.filter((l) => inRange(l.createdAt, range)).length;
  return {
    vgv,
    vendas,
    leads,
    conversao: leads > 0 ? round1((vendas / leads) * 100) : null,
    comissao: manager ? comissaoBruta : splitsTotal,
    pagos: splitsPagos,
  };
}

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function buildSummaries(
  dataset: BiDataset,
  period: PeriodRange,
  scope: AnalyticsScope,
  channels: BiChannelRoiMetric[],
  funnelStages: BiFunnelStageMetric[]
): BiMetricSummary[] {
  const cur = totals(dataset, period.current, scope.manager);
  const prev = period.previous ? totals(dataset, period.previous, scope.manager) : null;

  const withLeads = funnelStages.filter((s) => s.leadsAbertos > 0);
  const avgHours =
    withLeads.length > 0
      ? round1(withLeads.reduce((acc, s) => acc + s.tempoHoras * s.leadsAbertos, 0) /
          withLeads.reduce((acc, s) => acc + s.leadsAbertos, 0))
      : null;
  const gargalos = funnelStages.filter((s) => s.status === "critico").length;

  const invested = channels.filter((c) => c.investimento && c.investimento > 0);
  const investTotal = invested.reduce((acc, c) => acc + (c.investimento || 0), 0);
  const investVgv = invested.reduce((acc, c) => acc + c.vgv, 0);
  const roi = investTotal > 0 ? round1(investVgv / investTotal) : null;

  const vgvTrend = trendPercent(cur.vgv, prev ? prev.vgv : null);
  const convTrend = cur.conversao !== null && prev && prev.conversao !== null ? round1(cur.conversao - prev.conversao) : null;
  const comTrend = trendPercent(cur.comissao, prev ? prev.comissao : null);

  return [
    {
      id: "vgv",
      title: "VGV Comercial Total",
      shortLabel: "VGV & Vendas",
      value: cur.vgv,
      prefix: "R$ ",
      decimals: 0,
      changePercent: vgvTrend,
      changePositive: (vgvTrend ?? 0) >= 0,
      sublabel: `${cur.vendas} ${cur.vendas === 1 ? "venda" : "vendas"} no período`,
      category: "Faturamento",
      iconName: "DollarSign",
    },
    {
      id: "funil",
      title: "Eficiência & Tempo de Funil",
      shortLabel: "Tempo de Funil",
      value: avgHours,
      suffix: "h",
      decimals: 1,
      changePercent: null,
      changePositive: true,
      sublabel:
        avgHours === null
          ? "Sem leads abertos no funil"
          : gargalos > 0
          ? `${gargalos} ${gargalos === 1 ? "etapa acima" : "etapas acima"} do SLA`
          : "Média na etapa atual (leads abertos)",
      category: "Operacional",
      iconName: "Clock",
    },
    {
      id: "roi",
      title: "ROI de Mídia por Origem",
      shortLabel: "ROI de Mídia",
      value: roi,
      suffix: "x",
      decimals: 1,
      changePercent: null,
      changePositive: true,
      sublabel:
        roi === null
          ? scope.director
            ? "Sem despesas de mídia no Fluxo de Caixa"
            : "Disponível para o Administrador"
          : `${brl(investVgv)} de VGV sobre ${brl(investTotal)} investidos`,
      category: "Marketing",
      iconName: "TrendingUp",
    },
    {
      id: "conversao",
      title: "Taxa de Conversão Global",
      shortLabel: "Conversão",
      value: cur.conversao,
      suffix: "%",
      decimals: 1,
      changePercent: convTrend,
      changeSuffix: " p.p.",
      changePositive: (convTrend ?? 0) >= 0,
      sublabel: `${cur.leads} leads → ${cur.vendas} ${cur.vendas === 1 ? "venda" : "vendas"}`,
      category: "Eficiência",
      iconName: "Zap",
    },
    {
      id: "comissoes",
      title: scope.manager ? "Comissões & Repasses" : "Minhas Comissões",
      shortLabel: "Comissões",
      value: cur.comissao,
      prefix: "R$ ",
      decimals: 0,
      changePercent: comTrend,
      changePositive: (comTrend ?? 0) >= 0,
      sublabel: scope.manager ? `${brl(cur.pagos)} repassados (pagos)` : `${brl(cur.pagos)} já recebidos`,
      category: "Financeiro",
      iconName: "PieChart",
    },
  ];
}

/** Leads encerrados (base de descarte/remarketing LGPD) — corretor vê apenas os próprios. */
export async function loadClosedLeads(scope: AnalyticsScope, now: Date = new Date()): Promise<BiLgpdClosedLead[]> {
  const leads = await prisma.lead.findMany({
    where: { organizationId: scope.organizationId, ...scope.lead, isClosed: true },
    orderBy: [{ closedAt: "desc" }, { updatedAt: "desc" }],
    take: 60,
    select: {
      id: true,
      nome: true,
      telefone: true,
      email: true,
      closedAt: true,
      updatedAt: true,
      isBolsao: true,
      slaBreached: true,
      bairrosInteresse: true,
      campaignName: true,
      stage: { select: { nome: true } },
      corretor: { select: { nome: true } },
    },
  });

  return leads.map((l) => {
    const closedAt = l.closedAt || l.updatedAt;
    return {
      id: l.id,
      nome: l.nome,
      telefone: l.telefone,
      email: l.email || "—",
      motivo: l.isBolsao
        ? "Encerrado no bolsão"
        : l.slaBreached
        ? "SLA estourado"
        : `Encerrado em ${l.stage?.nome || "etapa não informada"}`,
      dataEncerramento: closedAt.toLocaleDateString("pt-BR"),
      interesse: l.bairrosInteresse.join(", ") || l.campaignName || "—",
      corretorUltimo: l.corretor?.nome || "—",
      diasInativo: Math.max(0, Math.floor((now.getTime() - l.updatedAt.getTime()) / 86400000)),
    };
  });
}
