"use client";

import React, { useEffect, useRef, useState } from "react";
import { Gift, Calendar, Sparkles, Award, Settings2, Plus, Target } from "lucide-react";
import confetti from "canvas-confetti";
import { GOAL_METRIC_LABELS, GoalIncentive, GoalInput } from "./types";
import { AdminGoalModal } from "./AdminGoalModal";

interface GoalIncentiveCardProps {
  incentive: GoalIncentive | null;
  isAdmin?: boolean;
  onCreate: (input: GoalInput) => Promise<string | null>;
  onUpdate: (id: string, input: GoalInput) => Promise<string | null>;
  onDelete: (id: string) => Promise<string | null>;
}

const formatDate = (iso: string) => iso.split("-").reverse().join("/");

function formatGoalValue(value: number, metrica: GoalIncentive["metrica"]): string {
  if (metrica === "VGV") {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  }
  return `${value.toLocaleString("pt-BR")} ${GOAL_METRIC_LABELS[metrica].unidade}`;
}

function celebrate() {
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#D9BB4C", "#1266C7", "#F8DA56", "#22C55E"] });
}

/** Bloco "Metas e Incentivos" (5.9) — meta persistida em /api/metas com progresso real. */
export function GoalIncentiveCard({ incentive, isAdmin = false, onCreate, onUpdate, onDelete }: GoalIncentiveCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const celebratedRef = useRef<string | null>(null);

  const percentage =
    incentive && incentive.objetivo > 0
      ? Math.min(100, Math.round((incentive.progressoAtual / incentive.objetivo) * 100))
      : 0;
  const reached = Boolean(incentive && percentage >= 100);

  // Disparo comemorativo uma única vez quando a meta é batida
  useEffect(() => {
    if (incentive && reached && celebratedRef.current !== incentive.id) {
      celebratedRef.current = incentive.id;
      celebrate();
    }
  }, [incentive, reached]);

  const modal = isAdmin && (
    <AdminGoalModal
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      currentGoal={incentive}
      onSave={(input) => (incentive ? onUpdate(incentive.id, input) : onCreate(input))}
      onDelete={incentive ? () => onDelete(incentive.id) : undefined}
    />
  );

  if (!incentive) {
    if (!isAdmin) return null;
    return (
      <>
        <div className="bg-card/60 border-2 border-dashed border-border rounded-2xl p-6 text-center space-y-3 transition-colors hover:border-connect-blue/50">
          <div className="w-12 h-12 rounded-2xl bg-platz-gold/15 text-platz-gold border border-platz-gold/30 flex items-center justify-center mx-auto shadow-xs">
            <Target className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-foreground">Nenhuma Meta de Incentivo Ativa no Momento</h3>
            <p className="text-xs text-muted-foreground">
              Campanhas de incentivo só aparecem para a equipe quando cadastradas por um gestor.
            </p>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold shadow-lg shadow-connect-blue/20 hover:shadow-connect-blue/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 text-platz-gold" />
            Cadastrar Nova Meta
          </button>
        </div>
        {modal}
      </>
    );
  }

  const progressTitle = incentive.progressScope === "equipe" ? "Progresso da Equipe" : "Seu Progresso";

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-connect-blue/40 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-full bg-platz-gold/20 text-amber-800 dark:text-[#F8DA56] border border-platz-gold/40 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Award className="w-3.5 h-3.5 text-platz-gold" />
              Meta Connect Platz
            </span>
            <h3 className="text-base font-bold text-foreground">{incentive.titulo}</h3>
            {incentive.status === "agendada" && (
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
                Agendada
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Calendar className="w-3.5 h-3.5 text-connect-blue" />
              <span>
                {formatDate(incentive.inicio)} a {formatDate(incentive.fim)}
              </span>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-connect-blue/10 hover:bg-connect-blue/20 text-connect-blue border border-connect-blue/30 text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Ajustar</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Prêmio */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center gap-3">
            {incentive.imagemUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={incentive.imagemUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-platz-gold/15 text-platz-gold flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Premiação da Campanha
              </span>
              <span className="text-sm font-bold text-foreground block truncate">
                {incentive.premio || "Reconhecimento da campanha"}
              </span>
              {incentive.descricao && (
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{incentive.descricao}</p>
              )}
            </div>
          </div>

          {/* Objetivo */}
          <div className="p-4 rounded-xl bg-connect-blue/5 dark:bg-connect-blue/10 border border-connect-blue/20 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-connect-blue block">Objetivo</span>
            <span className="text-lg font-extrabold text-connect-blue dark:text-blue-400 mt-1 block">
              {formatGoalValue(incentive.objetivo, incentive.metrica)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {GOAL_METRIC_LABELS[incentive.metrica].label} registradas no período da campanha
            </span>
          </div>

          {/* Progresso */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-foreground">{progressTitle}</span>
              <span className="font-extrabold text-amber-700 dark:text-platz-gold text-right">
                {incentive.metrica === "VGV"
                  ? `${formatGoalValue(incentive.progressoAtual, "VGV")} / ${formatGoalValue(incentive.objetivo, "VGV")}`
                  : `${incentive.progressoAtual} / ${formatGoalValue(incentive.objetivo, incentive.metrica)}`}
              </span>
            </div>
            <div
              className="w-full h-3.5 bg-muted rounded-full overflow-hidden p-0.5"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-gradient-to-r from-connect-blue via-platz-gold to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{percentage}% atingido</span>
              {reached && (
                <button
                  onClick={celebrate}
                  className="font-bold text-connect-blue hover:text-connect-deep-blue dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-platz-gold" />
                  Meta batida!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {modal}
    </>
  );
}
