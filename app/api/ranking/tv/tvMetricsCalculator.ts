// app/api/ranking/tv/tvMetricsCalculator.ts
// Motor determinístico de cálculo de métricas individuais de corretores para o Modo TV.

import { prisma } from "@/lib/db/prisma";
import { Role, AppointmentType, AppointmentStatus } from "@prisma/client";
import { ACTIVE_SALE_WHERE } from "@/app/api/dashboard/_lib/scope";
import type { TvSettingsConfig } from "@/lib/domain/settings/orgSettings";
import type {
  TvDataResponse,
  TvBrokerActivityItem,
  TvBrokerSalesItem,
} from "@/components/crm/ranking/tv/types";
import type { TvResolvedPeriod } from "./tvPeriodHelper";
import { computeTvKpis, type TvUserSummary } from "./tvKpiHelper";

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return ((parts[0][0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export async function computeTvDashboard(
  organizationId: string,
  period: TvResolvedPeriod,
  tvConfig: TvSettingsConfig | undefined,
  orgName: string,
  orgLogoUrl: string | null
): Promise<TvDataResponse> {
  const { semanaRange, mesRange, hojeRange } = period;

  // 1. Corretores ativos da organização
  const users: TvUserSummary[] = await prisma.user.findMany({
    where: {
      organizationId,
      isActive: true,
      role: { in: [Role.CORRETOR_VENDA, Role.CORRETOR_ALUGUEL] },
    },
    select: { id: true, nome: true, photoUrl: true },
    orderBy: { nome: "asc" },
  });

  const totalCorretoresAtivos = users.length;

  // 2. Vendas ativas do período (Semana e Mês)
  const salesSemana = await prisma.sale.findMany({
    where: {
      organizationId,
      ...ACTIVE_SALE_WHERE,
      dataVenda: { gte: semanaRange.start, lte: semanaRange.end },
    },
    select: { id: true, corretorId: true, valorVendaVGV: true },
  });

  // 3. Mapeamento de estágios de Análise e Aprovação nos funis
  const funnelStages = await prisma.funnelStage.findMany({
    where: { funnel: { organizationId } },
    select: { id: true, nome: true },
  });

  const configAnaliseIds = new Set(tvConfig?.etapasAnaliseIds || []);
  const configAprovacaoIds = new Set(tvConfig?.etapasAprovacaoIds || []);
  const analiseStageIds = new Set<string>();
  const aprovacaoStageIds = new Set<string>();

  for (const st of funnelStages) {
    const lower = st.nome.toLowerCase();
    if (
      configAnaliseIds.has(st.id) ||
      lower.includes("analise") ||
      lower.includes("análise") ||
      lower.includes("crédito") ||
      lower.includes("credito") ||
      lower.includes("proposta")
    ) {
      analiseStageIds.add(st.id);
    }
    if (
      configAprovacaoIds.has(st.id) ||
      lower.includes("aprova") ||
      lower.includes("aprovad")
    ) {
      aprovacaoStageIds.add(st.id);
    }
  }

  // 4. Contagens de Leads e Compromissos
  const [leadsHoje, leadsMes, appointmentsMes] = await Promise.all([
    prisma.lead.findMany({
      where: { organizationId, updatedAt: { gte: hojeRange.start, lte: hojeRange.end } },
      select: { id: true, corretorId: true, stageId: true },
    }),
    prisma.lead.findMany({
      where: { organizationId, updatedAt: { gte: mesRange.start, lte: mesRange.end } },
      select: { id: true, corretorId: true, stageId: true },
    }),
    prisma.appointment.findMany({
      where: {
        organizationId,
        tipo: AppointmentType.DOCUMENTACAO,
        status: AppointmentStatus.CONCLUIDO,
        dataInicio: { gte: mesRange.start, lte: mesRange.end },
      },
      select: { id: true, userId: true },
    }),
  ]);

  // Contadores por Corretor
  const brokerAnalises = new Map<string, { hoje: number; mes: number }>();
  const brokerAprovacoes = new Map<string, { hoje: number; mes: number }>();
  const brokerVendas = new Map<string, { vd: number; vgv: number }>();

  for (const u of users) {
    brokerAnalises.set(u.id, { hoje: 0, mes: 0 });
    brokerAprovacoes.set(u.id, { hoje: 0, mes: 0 });
    brokerVendas.set(u.id, { vd: 0, vgv: 0 });
  }

  // Preencher Vendas
  for (const s of salesSemana) {
    if (!s.corretorId) continue;
    const vgv = Number(s.valorVendaVGV) || 0;
    const b = brokerVendas.get(s.corretorId) || { vd: 0, vgv: 0 };
    b.vd += 1;
    b.vgv += vgv;
    brokerVendas.set(s.corretorId, b);
  }

  // Preencher Análises e Aprovações (Mês)
  for (const l of leadsMes) {
    if (!l.corretorId) continue;
    const isAn = analiseStageIds.has(l.stageId);
    const isAp = aprovacaoStageIds.has(l.stageId);

    if (isAn) {
      const b = brokerAnalises.get(l.corretorId) || { hoje: 0, mes: 0 };
      b.mes += 1;
      brokerAnalises.set(l.corretorId, b);
    }
    if (isAp) {
      const b = brokerAprovacoes.get(l.corretorId) || { hoje: 0, mes: 0 };
      b.mes += 1;
      brokerAprovacoes.set(l.corretorId, b);
    }
  }

  // Preencher Análises e Aprovações (Hoje)
  for (const l of leadsHoje) {
    if (!l.corretorId) continue;
    const isAn = analiseStageIds.has(l.stageId);
    const isAp = aprovacaoStageIds.has(l.stageId);

    if (isAn) {
      const b = brokerAnalises.get(l.corretorId) || { hoje: 0, mes: 0 };
      b.hoje += 1;
      brokerAnalises.set(l.corretorId, b);
    }
    if (isAp) {
      const b = brokerAprovacoes.get(l.corretorId) || { hoje: 0, mes: 0 };
      b.hoje += 1;
      brokerAprovacoes.set(l.corretorId, b);
    }
  }

  // Incorporar agendamentos de documentação nas análises
  for (const app of appointmentsMes) {
    if (app.userId && brokerAnalises.has(app.userId)) {
      const b = brokerAnalises.get(app.userId)!;
      b.mes += 1;
    }
  }

  // Montar tabelas ordenadas de Corretores
  const brokerAnalisesItems: TvBrokerActivityItem[] = users
    .map((u) => {
      const d = brokerAnalises.get(u.id) || { hoje: 0, mes: 0 };
      return {
        posicao: 1,
        corretorId: u.id,
        corretorNome: u.nome,
        avatar: initials(u.nome),
        hoje: d.hoje,
        mes: d.mes,
        valor: d.mes,
      };
    })
    .sort((a, b) => b.mes - a.mes || b.hoje - a.hoje || a.corretorNome.localeCompare(b.corretorNome))
    .map((item, idx) => ({ ...item, posicao: idx + 1 }));

  const brokerAprovacoesItems: TvBrokerActivityItem[] = users
    .map((u) => {
      const d = brokerAprovacoes.get(u.id) || { hoje: 0, mes: 0 };
      return {
        posicao: 1,
        corretorId: u.id,
        corretorNome: u.nome,
        avatar: initials(u.nome),
        hoje: d.hoje,
        mes: d.mes,
        valor: d.mes,
      };
    })
    .sort((a, b) => b.mes - a.mes || b.hoje - a.hoje || a.corretorNome.localeCompare(b.corretorNome))
    .map((item, idx) => ({ ...item, posicao: idx + 1 }));

  const brokerVendasItems: TvBrokerSalesItem[] = users
    .map((u) => {
      const v = brokerVendas.get(u.id) || { vd: 0, vgv: 0 };
      return {
        posicao: 1,
        corretorId: u.id,
        corretorNome: u.nome,
        avatar: initials(u.nome),
        vd: v.vd,
        vgv: v.vgv,
      };
    })
    .sort((a, b) => b.vgv - a.vgv || b.vd - a.vd || a.corretorNome.localeCompare(b.corretorNome))
    .map((item, idx) => ({ ...item, posicao: idx + 1 }));

  // KPIs consolidados
  const totalVgvSemana = salesSemana.reduce((acc, s) => acc + (Number(s.valorVendaVGV) || 0), 0);
  const totalVendasSemana = salesSemana.length;
  const totalAnalises = Array.from(brokerAnalises.values()).reduce((a, b) => a + b.mes, 0);
  const totalAprovacoes = Array.from(brokerAprovacoes.values()).reduce((a, b) => a + b.mes, 0);

  const kpis = computeTvKpis({
    totalVgvSemana,
    totalVendasSemana,
    totalAnalises,
    totalAprovacoes,
    totalCorretoresAtivos,
    users,
    brokerVendas,
    brokerAprovacoes,
    brokerAnalises,
  });

  const frase = tvConfig?.fraseMotivacional || "O sucesso é a soma de pequenos esforços repetidos dia após dia.";
  const autor = tvConfig?.autorFrase || "Robert Collier";
  const slogan = tvConfig?.slogan || "Morar. Investir. Realizar";

  return {
    organization: {
      nome: orgName,
      logoUrl: orgLogoUrl,
      slogan,
    },
    quote: { frase, autor },
    period: {
      key: period.key,
      label: period.label,
      semanaNumero: period.semanaNumero,
    },
    kpis,
    brokers: {
      analises: {
        items: brokerAnalisesItems,
        totalHoje: brokerAnalisesItems.reduce((acc, i) => acc + i.hoje, 0),
        totalMes: totalAnalises,
        total: totalAnalises,
      },
      aprovacoes: {
        items: brokerAprovacoesItems,
        totalHoje: brokerAprovacoesItems.reduce((acc, i) => acc + i.hoje, 0),
        totalMes: totalAprovacoes,
        total: totalAprovacoes,
      },
      vendas: {
        items: brokerVendasItems,
        totalVd: totalVendasSemana,
        totalVgv: totalVgvSemana,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}
