"use client";

// components/crm/relatorios/useBiReport.ts
// Carrega GET /api/relatorios?period= e recarrega ao trocar o período global.
// Mantém os dados anteriores durante o recarregamento (Count-Up transiciona do valor antigo).

import { useCallback, useEffect, useRef, useState } from "react";
import type { PeriodFilter } from "@/components/crm/CrmContext";
import type { BiReportData } from "./types";

export function useBiReport(period: PeriodFilter) {
  const [data, setData] = useState<BiReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/relatorios?period=${encodeURIComponent(period)}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Não foi possível carregar os relatórios.");
      setData(json as BiReportData);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Não foi possível carregar os relatórios.");
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  return { data, loading, error, reload: load };
}
