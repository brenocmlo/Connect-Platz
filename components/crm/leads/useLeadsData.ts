"use client";

// Carrega leads, etapas e funis da API com cache em memória (SWR), busca cross-funnel e deep-linking de URLs.

import { useCallback, useEffect, useRef, useState } from "react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "./KanbanBoard";
import { fetchLeads, LEAD_UPDATED_EVENT, OtherFunnelMatch } from "./leadsApi";

interface FunnelCacheEntry {
  leads: LeadDetail[];
  stages: FunnelColumn[];
  funnels: { id: string; nome: string }[];
  funnelId: string | null;
}

export function useLeadsData(isLoggedIn: boolean) {
  const [leads, setLeads] = useState<LeadDetail[]>([]);
  const [stages, setStages] = useState<FunnelColumn[]>([]);
  const [funnels, setFunnels] = useState<{ id: string; nome: string }[]>([]);
  const [funnelId, setFunnelId] = useState<string | null>(null);
  const [otherFunnelMatches, setOtherFunnelMatches] = useState<OtherFunnelMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);

  // Cache em memória para transições instantâneas (0ms) entre funis
  const cacheRef = useRef<Record<string, FunnelCacheEntry>>({});
  const initialParamsCheckedRef = useRef(false);

  const reload = useCallback(async (targetFunnelId?: string | null, search?: string | null) => {
    const key = targetFunnelId || "default";

    // Se já estiver em cache e não for busca de texto, exibe instantaneamente sem travar a interface
    if (cacheRef.current[key] && !search) {
      const cached = cacheRef.current[key];
      setLeads(cached.leads);
      setStages(cached.stages);
      setFunnels(cached.funnels);
      setFunnelId(cached.funnelId);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    setLoadError(null);
    try {
      const data = await fetchLeads(targetFunnelId, search);
      setLeads(data.leads);
      setStages(data.stages);
      setFunnels(data.funnels);
      setFunnelId(data.funnel?.id || null);
      setOtherFunnelMatches(data.otherFunnelMatches || []);

      if (data.funnel?.id) {
        cacheRef.current[data.funnel.id] = {
          leads: data.leads,
          stages: data.stages,
          funnels: data.funnels,
          funnelId: data.funnel.id,
        };
      }
    } catch (err: any) {
      if (!cacheRef.current[key]) {
        setLeads([]);
        setStages([]);
      }
      setLoadError(err?.message || "Erro ao carregar leads.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Deep-linking: checa se há ?funnelId ou ?leadId na URL (vindo do WhatsApp ou notificação)
    let initialFunnel: string | null = null;
    let initialLeadId: string | null = null;

    if (typeof window !== "undefined" && !initialParamsCheckedRef.current) {
      initialParamsCheckedRef.current = true;
      const urlParams = new URLSearchParams(window.location.search);
      initialFunnel = urlParams.get("funnelId");
      initialLeadId = urlParams.get("leadId");
    }

    reload(initialFunnel).then(() => {
      if (initialLeadId) {
        // Tenta encontrar o lead e abrir o Drawer automaticamente
        setLeads((currentLeads) => {
          const match = currentLeads.find((l) => l.id === initialLeadId);
          if (match) setSelectedLead(match);
          return currentLeads;
        });
      }
    });
  }, [isLoggedIn, reload]);

  /** Substitui um lead no estado (lista + drawer aberto). */
  const replaceLead = useCallback((updated: LeadDetail) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
    setSelectedLead((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  }, []);

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
    otherFunnelMatches,
    isLoading,
    loadError,
    reload,
    replaceLead,
    selectedLead,
    setSelectedLead,
  };
}
