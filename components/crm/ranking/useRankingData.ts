"use client";

// components/crm/ranking/useRankingData.ts
// Carrega GET /api/ranking?period= e GET /api/metas; expõe CRUD de metas (gestores) com checagem de res.ok.

import { useCallback, useEffect, useRef, useState } from "react";
import type { PeriodFilter } from "@/components/crm/CrmContext";
import type { GoalIncentive, GoalInput, RankingResponse } from "./types";

async function readError(res: Response, fallback: string): Promise<string> {
  const json = await res.json().catch(() => null);
  return json?.error || fallback;
}

export function useRankingData(period: PeriodFilter) {
  const [ranking, setRanking] = useState<RankingResponse | null>(null);
  const [goals, setGoals] = useState<GoalIncentive[]>([]);
  const [canManageGoals, setCanManageGoals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const loadGoals = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch("/api/metas", { cache: "no-store", signal });
    if (!res.ok) throw new Error(await readError(res, "Não foi possível carregar as metas."));
    const json = await res.json();
    setGoals(json.goals || []);
    setCanManageGoals(Boolean(json.canManage));
  }, []);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const [res] = await Promise.all([
        fetch(`/api/ranking?period=${encodeURIComponent(period)}`, { cache: "no-store", signal: controller.signal }),
        loadGoals(controller.signal),
      ]);
      if (!res.ok) throw new Error(await readError(res, "Não foi possível carregar o ranking."));
      setRanking((await res.json()) as RankingResponse);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Não foi possível carregar o ranking.");
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  }, [period, loadGoals]);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  /** Executa a escrita e recarrega as metas; retorna mensagem de erro ou null. */
  const mutateGoal = useCallback(
    async (method: "POST" | "PATCH" | "DELETE", body?: object, id?: string): Promise<string | null> => {
      try {
        const res = await fetch(method === "DELETE" ? `/api/metas?id=${encodeURIComponent(id || "")}` : "/api/metas", {
          method,
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) return await readError(res, "Não foi possível salvar a meta.");
        await loadGoals();
        return null;
      } catch {
        return "Falha de conexão ao salvar a meta.";
      }
    },
    [loadGoals]
  );

  return {
    ranking,
    goals,
    canManageGoals,
    loading,
    error,
    reload: load,
    createGoal: (input: GoalInput) => mutateGoal("POST", input),
    updateGoal: (id: string, input: GoalInput) => mutateGoal("PATCH", { id, ...input }),
    deleteGoal: (id: string) => mutateGoal("DELETE", undefined, id),
  };
}
