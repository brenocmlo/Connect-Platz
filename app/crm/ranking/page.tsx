"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Tv } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { getUserModality } from "@/lib/auth/session";
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { DashboardSkeleton } from "@/components/crm/dashboard/DashboardSkeleton";
import { useRankingData } from "@/components/crm/ranking/useRankingData";
import { GoalIncentiveCard } from "@/components/crm/ranking/GoalIncentiveCard";
import { BrokerOfTheMonthCard } from "@/components/crm/ranking/BrokerOfTheMonthCard";
import { RankingPodium } from "@/components/crm/ranking/RankingPodium";
import { HighlightsGrid } from "@/components/crm/ranking/HighlightsGrid";
import { RankingTable } from "@/components/crm/ranking/RankingTable";
import type { GoalInput } from "@/components/crm/ranking/types";

export default function RankingGamificacaoPage() {
  const { selectedPeriod, customDateRange, setActionMessage, user } = useCrm();
  const isAdminGeral = user?.role === "ADMINISTRADOR";
  const userModality = getUserModality(user?.role || "");

  const [selectedModality, setSelectedModality] = useState<"TODOS" | "VENDA" | "ALUGUEL">(
    isAdminGeral ? "TODOS" : userModality === "ALUGUEL" ? "ALUGUEL" : "VENDA"
  );

  const { ranking, goals, canManageGoals, loading, error, reload, createGoal, updateGoal, deleteGoal } =
    useRankingData(selectedPeriod, customDateRange, selectedModality);
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(null);

  // "Corretor do Mês" abre sempre no líder real do período carregado
  useEffect(() => {
    setSelectedBrokerId(ranking?.leader?.id || null);
  }, [ranking]);

  const activeGoal = goals.find((g) => g.status === "ativa") || goals.find((g) => g.status === "agendada") || null;

  const notify = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Toast de sucesso somente após confirmação da API
  const withToast =
    <A extends unknown[]>(fn: (...args: A) => Promise<string | null>, success: string) =>
    async (...args: A) => {
      const err = await fn(...args);
      if (!err) notify(success);
      return err;
    };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Ranking & Gamificação"
        subtitle="Desempenho da equipe, metas de incentivo e reconhecimento dos campeões de vendas."
        showPeriodSelector={true}
      >
        {isAdminGeral ? (
          <div className="flex items-center p-1 bg-muted rounded-xl border border-border/80 text-xs">
            <button
              type="button"
              onClick={() => setSelectedModality("TODOS")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedModality === "TODOS"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Geral
            </button>
            <button
              type="button"
              onClick={() => setSelectedModality("VENDA")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedModality === "VENDA"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Vendas
            </button>
            <button
              type="button"
              onClick={() => setSelectedModality("ALUGUEL")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedModality === "ALUGUEL"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Aluguel
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-muted-foreground border border-border/60">
            <span>Modalidade:</span>
            <span className="font-bold text-foreground">
              {userModality === "ALUGUEL" ? "Aluguel & Temporada" : "Vendas"}
            </span>
          </div>
        )}

        <Link
          href="/crm/ranking/tv"
          target="_blank"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#1266C7] to-[#0D478F] hover:from-[#0D478F] hover:to-[#0A376E] text-white text-xs font-bold shadow-md shadow-[#1266C7]/20 transition-all hover:scale-[1.02]"
        >
          <Tv className="w-4 h-4 text-white" />
          <span>Modo TV (War Room)</span>
        </Link>
      </PageHeader>

      {error && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-700 dark:text-rose-300">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </span>
          <button
            onClick={reload}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
          </button>
        </div>
      )}

      {!ranking ? (
        loading ? <DashboardSkeleton /> : null
      ) : (
        <div
          className={`space-y-6 transition-opacity duration-300 ${loading ? "opacity-70" : "opacity-100"}`}
          aria-busy={loading}
        >
          {/* Metas e Incentivos (persistidas em /api/metas) */}
          <GoalIncentiveCard
            incentive={activeGoal}
            isAdmin={canManageGoals}
            onCreate={withToast((input: GoalInput) => createGoal(input), "Meta de incentivo cadastrada e ativada!")}
            onUpdate={withToast((id: string, input: GoalInput) => updateGoal(id, input), "Meta de incentivo atualizada!")}
            onDelete={withToast((id: string) => deleteGoal(id), "Meta de incentivo removida.")}
          />

          {/* Corretor do Mês = líder real do período */}
          <BrokerOfTheMonthCard
            brokers={ranking.fullRanking}
            leader={ranking.leader}
            selectedBrokerId={selectedBrokerId}
            onSelectBroker={setSelectedBrokerId}
            periodLabel={ranking.period.label}
          />

          {/* Pódio 1º/2º/3º */}
          {ranking.podium.length > 0 && (
            <div className="space-y-3">
              <SectionTitle>Pódio do Período</SectionTitle>
              <RankingPodium podium={ranking.podium} />
            </div>
          )}

          <HighlightsGrid highlights={ranking.highlights} />

          <RankingTable
            corretores={ranking.fullRanking}
            currentUserId={ranking.currentUserId}
          />
        </div>
      )}
    </div>
  );
}
