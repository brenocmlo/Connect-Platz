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

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function getRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 60) return `há ${diffMinutes || 1} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `há ${diffDays}d`;
  } catch {
    return "recente";
  }
}
