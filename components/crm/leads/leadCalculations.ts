import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "@/components/crm/leads/KanbanBoard";

/** Índice da etapa atual do lead no funil (0 quando a etapa não é encontrada). */
export function findLeadStageIndex(lead: LeadDetail, stages: FunnelColumn[]): number {
  if (!stages || stages.length === 0) return 0;
  const idx = stages.findIndex((s) => s.id === lead.stageId);
  return idx === -1 ? 0 : idx;
}

export function getNextStage(lead: LeadDetail, stages: FunnelColumn[]): FunnelColumn | null {
  if (!stages || stages.length === 0) return null;
  const currentIdx = findLeadStageIndex(lead, stages);
  return currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;
}
