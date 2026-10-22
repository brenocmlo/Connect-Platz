// app/api/relatorios/_lib/channels.ts
// Canais (origem do lead) e campanhas: leads, vendas, VGV, conversão e ROI determinísticos.

import { CashFlowType, LeadSource, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { BiChannelRoiMetric } from "@/components/crm/relatorios/types";
import { toNumber } from "@/app/api/dashboard/_lib/scope";
import { PeriodRange, dateOnlyFilter, inDateOnlyRange, inRange, round1 } from "@/app/api/dashboard/_lib/period";
import { BiDataset } from "./dataset";

export const SOURCE_META: Record<LeadSource, { label: string; cor: string }> = {
  META_ADS: { label: "Meta Ads", cor: "#1266C7" },
  GOOGLE_ADS: { label: "Google Ads", cor: "#0D478F" },
  INDICACAO: { label: "Indicação", cor: "#22C55E" },
  CATALOGO_SITE: { label: "Catálogo / Site", cor: "#D9BB4C" },
  PORTAL_IMOBILIARIO: { label: "Portais Imobiliários", cor: "#0284C7" },
  MANUAL_CORRETOR: { label: "Cadastro Manual", cor: "#64748B" },
  API_EXTERNA: { label: "API / Integrações", cor: "#14B8A6" },
};

/** Palavras-chave das despesas de mídia no Fluxo de Caixa, por canal. */
const MEDIA_KEYWORDS: Partial<Record<LeadSource, RegExp>> = {
  META_ADS: /\b(meta|facebook|instagram)\b/i,
  GOOGLE_ADS: /\bgoogle\b/i,
  PORTAL_IMOBILIARIO: /\b(portal|portais|zap|viva ?real|olx|imovelweb|chaves na m[aã]o)\b/i,
};

/** Despesas de mídia (não canceladas) no período, atribuídas ao canal por palavra-chave. */
export async function loadMediaInvestment(
  organizationId: string,
  period: PeriodRange
): Promise<Map<LeadSource, number>> {
  const flows = await prisma.cashFlow.findMany({
    where: {
      organizationId,
      tipo: CashFlowType.DESPESA,
      status: { not: PaymentStatus.CANCELADO },
      dataVencimento: dateOnlyFilter(period.current),
    },
    select: { categoria: true, descricao: true, valor: true },
  });

  const totals = new Map<LeadSource, number>();
  for (const flow of flows) {
    const text = `${flow.categoria} ${flow.descricao}`;
    for (const [source, regex] of Object.entries(MEDIA_KEYWORDS) as [LeadSource, RegExp][]) {
      if (regex.test(text)) {
        totals.set(source, (totals.get(source) || 0) + toNumber(flow.valor));
        break;
      }
    }
  }
  return totals;
}

interface Accumulator {
  leads: number;
  vendas: number;
  vgv: number;
}

function toMetric(
  canal: string,
  cor: string,
  acc: Accumulator,
  investimento: number | null
): BiChannelRoiMetric {
  return {
    canal,
    cor,
    leads: acc.leads,
    vendas: acc.vendas,
    vgv: acc.vgv,
    investimento,
    ticketMedio: acc.vendas > 0 ? Math.round(acc.vgv / acc.vendas) : 0,
    roiMultiplicador: investimento && investimento > 0 ? round1(acc.vgv / investimento) : null,
    cpl: investimento && investimento > 0 && acc.leads > 0 ? Math.round((investimento / acc.leads) * 100) / 100 : null,
    taxaConversao: acc.leads > 0 ? round1((acc.vendas / acc.leads) * 100) : 0,
  };
}

/** Agrega leads (captados no período) e vendas (fechadas no período) por chave. */
function aggregate<K extends string>(
  dataset: BiDataset,
  period: PeriodRange,
  keyOfLead: (l: BiDataset["leads"][number]) => K | null,
  keyOfSale: (s: BiDataset["sales"][number]) => K | null
): Map<K, Accumulator> {
  const map = new Map<K, Accumulator>();
  const bump = (key: K | null) => {
    if (!key) return null;
    if (!map.has(key)) map.set(key, { leads: 0, vendas: 0, vgv: 0 });
    return map.get(key)!;
  };
  for (const lead of dataset.leads) {
    if (!inRange(lead.createdAt, period.current)) continue;
    const acc = bump(keyOfLead(lead));
    if (acc) acc.leads += 1;
  }
  for (const sale of dataset.sales) {
    if (!inDateOnlyRange(sale.dataVenda, period.current)) continue;
    const acc = bump(keyOfSale(sale));
    if (acc) {
      acc.vendas += 1;
      acc.vgv += sale.vgv;
    }
  }
  return map;
}

export function buildChannels(
  dataset: BiDataset,
  period: PeriodRange,
  investment: Map<LeadSource, number> | null
): BiChannelRoiMetric[] {
  const map = aggregate<LeadSource>(dataset, period, (l) => l.source, (s) => s.source);
  return Array.from(map.entries())
    .map(([source, acc]) =>
      toMetric(
        SOURCE_META[source]?.label || source,
        SOURCE_META[source]?.cor || "#64748B",
        acc,
        investment ? investment.get(source) ?? null : null
      )
    )
    .sort((a, b) => b.vgv - a.vgv || b.leads - a.leads || a.canal.localeCompare(b.canal, "pt-BR"));
}

const CAMPAIGN_COLORS = ["#1266C7", "#0D478F", "#D9BB4C", "#22C55E", "#0284C7", "#14B8A6", "#64748B"];

export function buildCampaigns(dataset: BiDataset, period: PeriodRange): BiChannelRoiMetric[] {
  const map = aggregate<string>(dataset, period, (l) => l.campaign, (s) => s.campaign);
  return Array.from(map.entries())
    .map(([campaign, acc]) => ({ campaign, acc }))
    .sort((a, b) => b.acc.leads - a.acc.leads || b.acc.vgv - a.acc.vgv || a.campaign.localeCompare(b.campaign))
    .slice(0, 15)
    .map(({ campaign, acc }, i) => toMetric(campaign, CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length], acc, null));
}
