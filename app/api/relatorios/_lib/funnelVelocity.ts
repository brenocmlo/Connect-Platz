// app/api/relatorios/_lib/funnelVelocity.ts
// Velocidade do funil: tempo médio dos leads abertos na etapa atual x SLA da etapa e taxa de passagem.

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { BiFunnelStageMetric } from "@/components/crm/relatorios/types";
import { buildFunnelReports } from "@/app/api/dashboard/_lib/funnel";
import { round1 } from "@/app/api/dashboard/_lib/period";

const HOUR_MS = 60 * 60 * 1000;

function stageStatus(tempoHoras: number, slaHoras: number | null): BiFunnelStageMetric["status"] {
  if (!slaHoras || slaHoras <= 0) return "normal";
  if (tempoHoras > slaHoras) return "critico";
  if (tempoHoras > slaHoras * 0.8) return "alerta";
  return "normal";
}

export async function buildFunnelVelocity(
  organizationId: string,
  leadWhere: Prisma.LeadWhereInput,
  now: Date = new Date()
): Promise<{ funil: string | null; stages: BiFunnelStageMetric[] }> {
  const reports = await buildFunnelReports(organizationId, leadWhere);
  const funnel = reports[0];
  if (!funnel) return { funil: null, stages: [] };

  const openLeads = await prisma.lead.findMany({
    where: { organizationId, ...leadWhere, funnelId: funnel.id, isClosed: false },
    select: {
      stageId: true,
      createdAt: true,
      // Entrada na etapa atual = última mudança de etapa registrada (ou a criação do lead)
      timeline: {
        where: { tipo: "status_change" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const hoursByStage = new Map<string, { total: number; count: number }>();
  for (const lead of openLeads) {
    const enteredAt = lead.timeline[0]?.createdAt || lead.createdAt;
    const hours = Math.max(0, (now.getTime() - enteredAt.getTime()) / HOUR_MS);
    const acc = hoursByStage.get(lead.stageId) || { total: 0, count: 0 };
    acc.total += hours;
    acc.count += 1;
    hoursByStage.set(lead.stageId, acc);
  }

  const stages = funnel.stages.map((stage, i) => {
    const acc = hoursByStage.get(stage.id);
    const tempoHoras = acc && acc.count > 0 ? round1(acc.total / acc.count) : 0;
    const slaHoras = stage.slaMinutes ? round1(stage.slaMinutes / 60) : null;
    const next = funnel.stages[i + 1];
    return {
      etapa: stage.nome,
      cor: stage.cor,
      tempoHoras,
      slaHoras,
      status: stageStatus(tempoHoras, slaHoras),
      leadsAbertos: acc?.count || 0,
      leadsEntraram: stage.reached,
      // Passagem = % dos que chegaram à etapa e avançaram para a próxima
      taxaPassagem: next ? next.conversionPct : null,
    };
  });

  return { funil: funnel.nome, stages };
}
