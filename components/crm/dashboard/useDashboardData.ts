"use client";

// components/crm/dashboard/useDashboardData.ts
// Carrega GET /api/dashboard?period= e recarrega ao trocar o período global.
// Mantém os dados anteriores durante o recarregamento (Count-Up e Recharts transicionam do valor antigo).

import { useCallback, useEffect, useRef, useState } from "react";
import type { PeriodFilter } from "@/components/crm/CrmContext";
import type { DashboardData } from "./types";

export function useDashboardData(
  period: PeriodFilter,
  customRange?: { start: string; end: string },
  modality: "TODOS" | "VENDA" | "ALUGUEL" = "TODOS"
) {
  const [data, setData] = useState<DashboardData | null>(null);
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
      const params = new URLSearchParams({ period, modality });
      if (period === "personalizado" && customRange?.start && customRange?.end) {
        params.set("startDate", customRange.start);
        params.set("endDate", customRange.end);
      }
      const res = await fetch(`/api/dashboard?${params.toString()}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || "Não foi possível carregar as métricas.");
      }
      setData(json as DashboardData);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Não foi possível carregar as métricas.");
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  }, [period, customRange?.start, customRange?.end, modality]);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  return { data, loading, error, reload: load };
}
