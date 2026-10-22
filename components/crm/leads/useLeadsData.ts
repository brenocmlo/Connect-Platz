"use client";

// Carrega leads, etapas e funis reais da API (sem dados de exemplo) e mantém o estado sincronizado.

import { useCallback, useEffect, useState } from "react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "./KanbanBoard";
import { fetchLeads, LEAD_UPDATED_EVENT } from "./leadsApi";

export function useLeadsData(isLoggedIn: boolean) {
  const [leads, setLeads] = useState<LeadDetail[]>([]);
  const [stages, setStages] = useState<FunnelColumn[]>([]);
  const [funnels, setFunnels] = useState<{ id: string; nome: string }[]>([]);
  const [funnelId, setFunnelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);

  const reload = useCallback(async (targetFunnelId?: string | null) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchLeads(targetFunnelId);
      setLeads(data.leads);
      setStages(data.stages);
      setFunnels(data.funnels);
      setFunnelId(data.funnel?.id || null);
    } catch (err: any) {
      setLeads([]);
      setStages([]);
      setLoadError(err?.message || "Erro ao carregar leads.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) reload();
  }, [isLoggedIn, reload]);

  /** Substitui um lead no estado (lista + drawer aberto). */
  const replaceLead = useCallback((updated: LeadDetail) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
    setSelectedLead((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  }, []);

  // Atualizações disparadas fora do fluxo principal (ex.: primeiro contato pelo WhatsApp)
  useEffect(() => {
    const handler = (e: Event) => replaceLead((e as CustomEvent<LeadDetail>).detail);
    window.addEventListener(LEAD_UPDATED_EVENT, handler);
    return () => window.removeEventListener(LEAD_UPDATED_EVENT, handler);
  }, [replaceLead]);

  return {
    leads,
    setLeads,
    stages,
    funnels,
    funnelId,
    isLoading,
    loadError,
    reload,
    replaceLead,
    selectedLead,
    setSelectedLead,
  };
}
