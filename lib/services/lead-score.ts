// lib/services/lead-score.ts
// Recalcula e persiste score + temperatura de um lead a partir das regras da organização.

import { prisma } from "@/lib/db/prisma";
import { LeadTemperature } from "@prisma/client";
import { computeLeadScore, temperatureFromScore } from "@/lib/domain/scoring/leadScore";
import { getOrgScoreRules } from "@/lib/domain/settings/orgSettings";

export async function refreshLeadScore(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { stage: { select: { posicao: true } }, _count: { select: { documents: true } } },
  });
  if (!lead) return null;

  const rules = await getOrgScoreRules(lead.organizationId);
  const score = computeLeadScore(
    {
      telefone: lead.telefone,
      email: lead.email,
      hasPropertyInterest: lead.bairrosInteresse.length > 0 || Boolean(lead.adName),
      rendaDeclarada: lead.rendaDeclarada ? Number(lead.rendaDeclarada) : null,
      createdAt: lead.createdAt,
      firstContactAt: lead.firstContactAt,
      documentsCount: lead._count.documents,
      stagePosition: lead.stage?.posicao,
    },
    rules
  );
  const temperatura = temperatureFromScore(score, rules) as LeadTemperature;

  return prisma.lead.update({
    where: { id: leadId },
    data: { score, temperatura },
  });
}
