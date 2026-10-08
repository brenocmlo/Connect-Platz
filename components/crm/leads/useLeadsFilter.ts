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
  viewMode: "kanban" | "table" | "bolsao";
  selectedPeriod?: PeriodFilter;
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
  selectedPeriod = "mes",
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

      let matchesPeriod = true;
      if (selectedPeriod && selectedPeriod !== "todos") {
        const leadDate = lead.createdAt ? new Date(lead.createdAt) : new Date();
        const now = new Date();
        const diffMs = now.getTime() - leadDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (selectedPeriod === "hoje") {
          matchesPeriod = diffDays <= 1 || leadDate.toDateString() === now.toDateString();
        } else if (selectedPeriod === "7d") {
          matchesPeriod = diffDays <= 7;
        } else if (selectedPeriod === "mes" || selectedPeriod === "30d") {
          matchesPeriod = diffDays <= 31;
        } else if (selectedPeriod === "ano") {
          matchesPeriod = diffDays <= 365;
        }
      }

      return (
        matchesSearch &&
        matchesTemp &&
        matchesOrigin &&
        matchesSla &&
        matchesMember &&
        matchesBolsao &&
        matchesPeriod
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
    selectedPeriod,
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
