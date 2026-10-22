// app/api/dashboard/_lib/dashboardLists.ts
// Listas da Dashboard: leads quentes, compromissos, performance da equipe e atividades recentes.

import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getOrgScoreRules } from "@/lib/domain/settings/orgSettings";
import { temperatureFromScore } from "@/lib/domain/scoring/leadScore";
import type {
  ActivityItem,
  AppointmentItem,
  HotLeadItem,
  TeamMemberItem,
} from "@/components/crm/dashboard/types";
import { AnalyticsScope } from "./scope";
import { PeriodRange } from "./period";
import { compareByPerformance, computeUserMetrics, emptyMetrics } from "./userMetrics";

/** Top 12 leads abertos por score determinístico (desempate: atualização mais recente). */
export async function loadHotLeads(scope: AnalyticsScope): Promise<HotLeadItem[]> {
  const [leads, rules] = await Promise.all([
    prisma.lead.findMany({
      where: {
        organizationId: scope.organizationId,
        ...scope.lead,
        isClosed: false,
        score: { not: null },
      },
      orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
      take: 12,
      select: {
        id: true,
        nome: true,
        telefone: true,
        score: true,
        updatedAt: true,
        stage: { select: { nome: true } },
        corretor: { select: { nome: true } },
      },
    }),
    getOrgScoreRules(scope.organizationId),
  ]);

  return leads.map((l) => {
    const score = l.score ?? 0;
    return {
      id: l.id,
      nome: l.nome,
      telefone: l.telefone,
      score,
      temperatura: temperatureFromScore(score, rules),
      etapa: l.stage?.nome || "—",
      corretor: l.corretor?.nome || null,
      atualizadoEm: l.updatedAt.toISOString(),
    };
  });
}

/** Compromissos de hoje até os próximos 15 dias (corretor: apenas a própria agenda). */
export async function loadAppointments(scope: AnalyticsScope): Promise<AppointmentItem[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 15);

  const items = await prisma.appointment.findMany({
    where: {
      organizationId: scope.organizationId,
      ...scope.appointment,
      status: { not: AppointmentStatus.CANCELADO },
      dataInicio: { gte: start, lt: end },
    },
    orderBy: { dataInicio: "asc" },
    take: 60,
    select: {
      id: true,
      tipo: true,
      titulo: true,
      status: true,
      dataInicio: true,
      dataFim: true,
      lead: { select: { nome: true } },
      user: { select: { nome: true } },
      property: { select: { nome: true } },
    },
  });

  return items.map((a) => ({
    id: a.id,
    tipo: a.tipo,
    titulo: a.titulo,
    status: a.status,
    inicio: a.dataInicio.toISOString(),
    fim: a.dataFim.toISOString(),
    cliente: a.lead?.nome || null,
    responsavel: a.user?.nome || "—",
    empreendimento: a.property?.nome || null,
  }));
}

/** Performance da equipe no período (somente gestores). */
export async function loadTeam(
  scope: AnalyticsScope,
  period: PeriodRange
): Promise<{ corretores: TeamMemberItem[]; gerentes: TeamMemberItem[] } | null> {
  if (!scope.manager) return null;

  const [users, metrics] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: scope.organizationId, isActive: true, role: { in: ["CORRETOR", "GERENTE"] } },
      select: { id: true, nome: true, role: true, photoUrl: true },
    }),
    computeUserMetrics(scope.organizationId, period.current),
  ]);

  const build = (role: "CORRETOR" | "GERENTE"): TeamMemberItem[] =>
    users
      .filter((u) => u.role === role)
      .map((u) => {
        const raw = metrics.get(u.id) || emptyMetrics();
        // Gerente é avaliado pelas vendas em que participa como gerente no split
        const m =
          role === "GERENTE" ? { ...raw, vgv: raw.vgvGerencia, vendas: raw.vendasGerencia } : raw;
        return { u, nome: u.nome, m };
      })
      .filter((x) => x.m.vendas > 0 || x.m.vgv > 0)
      .sort(compareByPerformance)
      .slice(0, 5)
      .map((x) => ({ id: x.u.id, nome: x.u.nome, photoUrl: x.u.photoUrl, vendas: x.m.vendas, vgv: x.m.vgv }));

  return { corretores: build("CORRETOR"), gerentes: build("GERENTE") };
}

const TIMELINE_TITLES: Record<string, string> = {
  status_change: "Etapa do lead alterada",
  nota: "Nota registrada",
  transbordo: "Lead redistribuído",
  visita: "Visita registrada",
  whatsapp_print: "Interação registrada",
  audio: "Áudio anexado",
};

function humanize(value: string): string {
  const text = value.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Feed recente: timeline dos leads (escopo do usuário) + auditoria (somente gestores). */
export async function loadActivities(scope: AnalyticsScope): Promise<ActivityItem[]> {
  const [timeline, audits] = await Promise.all([
    prisma.leadTimeline.findMany({
      where: { lead: { organizationId: scope.organizationId, ...scope.lead } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        tipo: true,
        conteudo: true,
        createdAt: true,
        lead: { select: { nome: true } },
        user: { select: { nome: true } },
      },
    }),
    scope.manager
      ? prisma.auditLog.findMany({
          where: { organizationId: scope.organizationId },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            acao: true,
            entidade: true,
            detalhes: true,
            createdAt: true,
            user: { select: { nome: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const items: ActivityItem[] = [
    ...timeline.map((t) => ({
      id: `tl-${t.id}`,
      origem: "timeline" as const,
      tipo: t.tipo,
      titulo: TIMELINE_TITLES[t.tipo] || "Atualização do lead",
      descricao: [t.lead?.nome, t.conteudo].filter(Boolean).join(" — "),
      autor: t.user?.nome || null,
      criadoEm: t.createdAt.toISOString(),
    })),
    ...audits.map((a) => {
      const det = (a.detalhes || {}) as Record<string, any>;
      return {
        id: `au-${a.id}`,
        origem: "auditoria" as const,
        tipo: String(det.tipoAcao || a.acao),
        titulo: humanize(a.acao),
        descricao: String(det.descricao || det.entidadeNome || a.entidade),
        autor: a.user?.nome || (det.ator ? String(det.ator) : null),
        criadoEm: a.createdAt.toISOString(),
      };
    }),
  ];

  return items.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 8);
}
