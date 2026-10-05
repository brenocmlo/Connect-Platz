import { useMemo } from "react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "@/components/crm/leads/KanbanBoard";

interface UseLeadsFilterProps {
  leads: LeadDetail[];
  stages: FunnelColumn[];
  searchQuery: string;
  temperatureFilter: string;
  originFilter: string;
  slaFilter: string;
  selectedMember: string;
  viewMode: "kanban" | "table" | "bolsao";
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
}: UseLeadsFilterProps) {
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lead.nome.toLowerCase().includes(q) ||
        lead.telefone.includes(q) ||
        (lead.email && lead.email.toLowerCase().includes(q));

      const matchesTemp =
        temperatureFilter === "TODAS" || lead.temperatura === temperatureFilter;

      const matchesOrigin =
        originFilter === "TODAS" || lead.source === originFilter;

      const matchesSla =
        slaFilter === "TODOS" ||
        (slaFilter === "CRITICO" && !lead.slaBreached && lead.slaDueAt) ||
        (slaFilter === "ESTOURADO" && lead.slaBreached) ||
        (slaFilter === "DENTRO_PRAZO" && !lead.slaBreached);

      const matchesMember =
        selectedMember === "TODOS" || lead.corretor?.nome === selectedMember;

      const matchesBolsao = viewMode === "bolsao" ? lead.isBolsao : !lead.isBolsao;

      return (
        matchesSearch &&
        matchesTemp &&
        matchesOrigin &&
        matchesSla &&
        matchesMember &&
        matchesBolsao
      );
    });
  }, [
    leads,
    searchQuery,
    temperatureFilter,
    originFilter,
    slaFilter,
    selectedMember,
    viewMode,
  ]);

  const metrics = useMemo(() => {
    const bolsaoCount = leads.filter((l) => l.isBolsao).length;
    const totalLeadsCount = leads.length;
    const wonStageId = stages.find((s) => s.posicao === 6)?.id || "stage-6";
    const closedStageId = stages.find((s) => s.posicao === 7)?.id || "stage-7";

    const activeLeadsCount = leads.filter(
      (l) => !l.isBolsao && l.stageId !== closedStageId && (l as any).stage?.posicao !== 7
    ).length;

    const wonCount = leads.filter(
      (l) => l.stageId === wonStageId || (l as any).stage?.posicao === 6
    ).length;

    const convRate = totalLeadsCount > 0 ? (wonCount / totalLeadsCount) * 100 : 0;

    const hasActiveFilters =
      temperatureFilter !== "TODAS" ||
      originFilter !== "TODAS" ||
      slaFilter !== "TODOS" ||
      selectedMember !== "TODOS" ||
      searchQuery.trim().length > 0;

    return {
      bolsaoCount,
      totalLeadsCount,
      activeLeadsCount,
      wonCount,
      convRate,
      hasActiveFilters,
    };
  }, [
    leads,
    stages,
    temperatureFilter,
    originFilter,
    slaFilter,
    selectedMember,
    searchQuery,
  ]);

  return {
    filteredLeads,
    ...metrics,
  };
}
