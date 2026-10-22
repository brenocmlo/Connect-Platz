import { useMemo } from "react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "@/components/crm/leads/KanbanBoard";
import { PeriodFilter } from "@/components/crm/CrmContext";

interface UseLeadsFilterProps {
  leads: LeadDetail[];
  stages: FunnelColumn[];
  searchQuery: string;
  temperatureFilter: string;
  originFilter: string;
  slaFilter: string;
  selectedMember: string;
  viewMode: "kanban" | "table" | "bolsao" | "nightQueue";
  selectedPeriod?: PeriodFilter;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const FIFTEEN_MIN_MS = 15 * 60 * 1000;

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Etapas de fechamento identificadas pelo nome (fallback: posição 6/7 do funil padrão). */
export function classifyStages(stages: FunnelColumn[]) {
  const won = stages.filter((s) => /ganho|fechad|vendid|venda/.test(normalize(s.nome)));
  const lost = stages.filter((s) => /encerrad|perdid|descartad/.test(normalize(s.nome)));
  return {
    wonIds: new Set((won.length ? won : stages.filter((s) => s.posicao === 6)).map((s) => s.id)),
    lostIds: new Set((lost.length ? lost : stages.filter((s) => s.posicao === 7)).map((s) => s.id)),
  };
}

/** Situação de SLA do lead: estourado, crítico (≤ 15 min ou sem 1º contato há > 15 min) ou em dia. */
export function leadSlaStatus(lead: LeadDetail, now = Date.now()): "ESTOURADO" | "CRITICO" | "DENTRO_PRAZO" {
  const due = lead.slaDueAt ? new Date(lead.slaDueAt).getTime() : null;
  if (lead.slaBreached || (due !== null && due <= now)) return "ESTOURADO";
  if (due !== null && due - now <= FIFTEEN_MIN_MS) return "CRITICO";
  const created = lead.createdAt ? new Date(lead.createdAt).getTime() : null;
  if (!lead.firstContactAt && created !== null && now - created > FIFTEEN_MIN_MS) return "CRITICO";
  return "DENTRO_PRAZO";
}

function matchesPeriod(lead: LeadDetail, period: PeriodFilter, now: Date): boolean {
  if (!period || period === "todos") return true;
  if (!lead.createdAt) return false;
  const created = new Date(lead.createdAt);
  if (period === "hoje") return created.toDateString() === now.toDateString();
  // Janelas móveis (mantém leads recentes visíveis na virada do mês/ano)
  const days = period === "7d" ? 7 : period === "ano" ? 365 : 31;
  return now.getTime() - created.getTime() <= days * DAY_MS;
}

export function useLeadsFilter({
  leads,
  stages,
  searchQuery,
  temperatureFilter,
  originFilter,
  slaFilter,
  selectedMember,
  viewMode,
  selectedPeriod = "todos",
}: UseLeadsFilterProps) {
  const filteredLeads = useMemo(() => {
    const now = new Date();
    const q = normalize(searchQuery.trim());
    const qDigits = searchQuery.replace(/\D/g, "");
    return leads.filter((lead) => {
      const matchesSearch =
        !q ||
        normalize(lead.nome).includes(q) ||
        (qDigits.length >= 3 && lead.telefone.replace(/\D/g, "").includes(qDigits)) ||
        Boolean(lead.email && normalize(lead.email).includes(q));
      const matchesTemp = temperatureFilter === "TODAS" || lead.temperatura === temperatureFilter;
      const matchesOrigin =
        originFilter === "TODAS" || lead.source === originFilter || lead.sourceLabel === originFilter;
      const matchesSla = slaFilter === "TODOS" || leadSlaStatus(lead, now.getTime()) === slaFilter;
      const matchesMember = selectedMember === "TODOS" || lead.corretor?.nome === selectedMember;
      const matchesView =
        viewMode === "bolsao"
          ? Boolean(lead.isBolsao)
          : viewMode === "nightQueue"
          ? Boolean(lead.isNightQueue)
          : !lead.isBolsao && !lead.isNightQueue;

      return (
        matchesSearch &&
        matchesTemp &&
        matchesOrigin &&
        matchesSla &&
        matchesMember &&
        matchesView &&
        matchesPeriod(lead, selectedPeriod, now)
      );
    });
  }, [leads, searchQuery, temperatureFilter, originFilter, slaFilter, selectedMember, viewMode, selectedPeriod]);

  const metrics = useMemo(() => {
    const { wonIds, lostIds } = classifyStages(stages);
    const now = Date.now();
    const totalLeadsCount = leads.length;
    const bolsaoCount = leads.filter((l) => l.isBolsao).length;
    const wonCount = leads.filter((l) => wonIds.has(l.stageId)).length;
    const activeLeadsCount = leads.filter(
      (l) => !l.isBolsao && !wonIds.has(l.stageId) && !lostIds.has(l.stageId)
    ).length;
    const newLeadsCount = leads.filter(
      (l) => l.createdAt && now - new Date(l.createdAt).getTime() <= 7 * DAY_MS
    ).length;
    const convRate = totalLeadsCount > 0 ? (wonCount / totalLeadsCount) * 100 : 0;

    const hasActiveFilters =
      temperatureFilter !== "TODAS" ||
      originFilter !== "TODAS" ||
      slaFilter !== "TODOS" ||
      selectedMember !== "TODOS" ||
      searchQuery.trim().length > 0;

    return { bolsaoCount, totalLeadsCount, activeLeadsCount, wonCount, newLeadsCount, convRate, hasActiveFilters };
  }, [leads, stages, temperatureFilter, originFilter, slaFilter, selectedMember, searchQuery]);

  return { filteredLeads, ...metrics };
}
