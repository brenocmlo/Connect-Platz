// app/api/dashboard/_lib/funnel.ts
// Funil por etapa: contagem de leads, alcance acumulado e % de conversão entre etapas.

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { FunnelReport } from "@/components/crm/dashboard/types";

/**
 * Considera o funil linear (posição crescente): um lead na etapa N já passou pelas anteriores.
 * reached[i] = leads na etapa i ou adiante; conversão(i) = reached[i] / reached[i-1].
 */
export async function buildFunnelReports(
  organizationId: string,
  leadWhere: Prisma.LeadWhereInput
): Promise<FunnelReport[]> {
  const [funnels, groups] = await Promise.all([
    prisma.funnel.findMany({
      where: { organizationId, isActive: true },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        nome: true,
        stages: {
          orderBy: { posicao: "asc" },
          select: { id: true, nome: true, cor: true, slaMinutes: true },
        },
      },
    }),
    prisma.lead.groupBy({
      by: ["stageId"],
      where: { organizationId, ...leadWhere },
      _count: { _all: true },
    }),
  ]);

  const countByStage = new Map<string, number>();
  for (const g of groups) countByStage.set(g.stageId, g._count._all);

  return funnels.map((funnel) => {
    const counts = funnel.stages.map((s) => countByStage.get(s.id) || 0);
    const reached = counts.map((_, i) => counts.slice(i).reduce((acc, n) => acc + n, 0));
    const top = reached[0] || 0;

    return {
      id: funnel.id,
      nome: funnel.nome,
      totalLeads: top,
      stages: funnel.stages.map((stage, i) => ({
        id: stage.id,
        nome: stage.nome,
        cor: stage.cor,
        slaMinutes: stage.slaMinutes,
        count: counts[i],
        reached: reached[i],
        sharePct: top > 0 ? Math.round((reached[i] / top) * 1000) / 10 : 0,
        conversionPct:
          i === 0
            ? top > 0
              ? 100
              : 0
            : reached[i - 1] > 0
            ? Math.round((reached[i] / reached[i - 1]) * 1000) / 10
            : 0,
      })),
    };
  });
}
