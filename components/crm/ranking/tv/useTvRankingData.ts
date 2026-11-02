// components/crm/ranking/tv/useTvRankingData.ts
// Hook de consumo e auto-refresh em tempo real do Modo TV.

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { TvDataResponse, TvPeriodKey } from "./types";

const REFRESH_INTERVAL_MS = 45_000; // 45 segundos

export function useTvRankingData() {
  const [data, setData] = useState<TvDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TvPeriodKey | "">("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(
    async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        const query = selectedPeriod ? `?period=${selectedPeriod}` : "";
        const res = await fetch(`/api/ranking/tv${query}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Não foi possível carregar os dados da TV.");
        }
        const json: TvDataResponse = await res.json();
        setData(json);
        setLastUpdated(new Date());
        setError(null);
        if (!selectedPeriod && json.period?.key) {
          setSelectedPeriod(json.period.key);
        }
      } catch (err: any) {
        if (!isBackground) {
          setError(err?.message || "Erro desconhecido ao carregar TV.");
        }
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [selectedPeriod]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling silencioso
  useEffect(() => {
    timerRef.current = setInterval(() => {
      fetchData(true);
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchData]);

  const reload = useCallback(() => fetchData(false), [fetchData]);

  return {
    data,
    loading,
    error,
    selectedPeriod,
    setSelectedPeriod,
    lastUpdated,
    reload,
  };
}
