import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "@/components/crm/leads/KanbanBoard";

export function findLeadStageIndex(lead: LeadDetail, stages: FunnelColumn[]): number {
  if (!stages || stages.length === 0) return 0;

  // 1. Match exato por s.id === lead.stageId
  let idx = stages.findIndex((s) => s.id === lead.stageId);
  if (idx !== -1) return idx;

  // 2. Match por stage objeto
  if ((lead as any).stage?.id) {
    idx = stages.findIndex((s) => s.id === (lead as any).stage.id);
    if (idx !== -1) return idx;
  }

  // 3. Match por posição ordinal (1..7)
  const pos = (lead as any).stage?.posicao;
  if (pos !== undefined) {
    idx = stages.findIndex((s) => s.posicao === pos);
    if (idx !== -1) return idx;
  }

  // 4. Match por string stage-X
  const numMatch = lead.stageId?.match(/stage-(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    idx = stages.findIndex((s) => s.posicao === num);
    if (idx !== -1) return idx;
  }

  // 5. Fallback para primeira etapa
  return 0;
}

export function getNextStage(lead: LeadDetail, stages: FunnelColumn[]): FunnelColumn | null {
  if (!stages || stages.length === 0) return null;
  const currentIdx = findLeadStageIndex(lead, stages);
  if (currentIdx < stages.length - 1) {
    return stages[currentIdx + 1];
  }
  return null;
}

export const defaultStages: FunnelColumn[] = [
  { id: "stage-1", nome: "Novo Lead", posicao: 1, cor: "#1266C7", slaMinutes: 20 },
  { id: "stage-2", nome: "Primeiro Contato", posicao: 2, cor: "#0D478F", slaMinutes: 120 },
  { id: "stage-3", nome: "Visita Agendada", posicao: 3, cor: "#D9BB4C", slaMinutes: 2880 },
  { id: "stage-4", nome: "Proposta Enviada", posicao: 4, cor: "#F59E0B", slaMinutes: 1440 },
  { id: "stage-5", nome: "Análise de Crédito", posicao: 5, cor: "#0284C7", slaMinutes: 4320 },
  { id: "stage-6", nome: "Fechado / Ganho", posicao: 6, cor: "#22C55E", slaMinutes: null },
  { id: "stage-7", nome: "Encerrado", posicao: 7, cor: "#64748B", slaMinutes: null },
];
