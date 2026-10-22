"use client";

// Histórico (LeadTimeline) do lead lido/gravado via API — compartilhado pela seção de
// abordagens e pela aba "Histórico & Timeline" do drawer (sincronizados por evento global).

import { useCallback, useEffect, useState } from "react";
import { fetchTimeline, addTimelineEntry, TimelineEntry } from "@/components/crm/leads/leadsApi";

const TIMELINE_EVENT = "crm:lead-timeline-entry";

type TimelineEventDetail = { leadId: string; entry: TimelineEntry };

export function useLeadTimeline(leadId: string | null | undefined) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchTimeline(leadId)
      .then((items) => !cancelled && setEntries(items))
      .catch((err) => !cancelled && setError(err?.message || "Falha ao carregar histórico."))
      .finally(() => !cancelled && setIsLoading(false));

    // Recebe registros feitos por outra instância do hook (mesmo lead)
    const onEntry = (ev: Event) => {
      const { detail } = ev as CustomEvent<TimelineEventDetail>;
      if (detail?.leadId !== leadId) return;
      setEntries((prev) => (prev.some((e) => e.id === detail.entry.id) ? prev : [detail.entry, ...prev]));
    };
    window.addEventListener(TIMELINE_EVENT, onEntry);
    return () => {
      cancelled = true;
      window.removeEventListener(TIMELINE_EVENT, onEntry);
    };
  }, [leadId]);

  /** Grava um registro na timeline; lança erro em caso de falha (o chamador exibe a mensagem). */
  const add = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!leadId) throw new Error("Lead inválido.");
      const entry = await addTimelineEntry(leadId, payload);
      window.dispatchEvent(
        new CustomEvent<TimelineEventDetail>(TIMELINE_EVENT, { detail: { leadId, entry } })
      );
      return entry;
    },
    [leadId]
  );

  return { entries, isLoading, error, add };
}

/** "dd/mm/aaaa às hh:mm" a partir de uma data ISO. */
export function formatTimelineDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("pt-BR");
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} às ${time}`;
}
