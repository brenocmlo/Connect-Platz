"use client";

import React, { useState } from "react";
import { Gift, Calendar, Sparkles, Award, Settings2, Plus, Target } from "lucide-react";
import confetti from "canvas-confetti";
import { GoalIncentive } from "./types";
import { AdminGoalModal } from "./AdminGoalModal";

interface GoalIncentiveCardProps {
  incentive: GoalIncentive | null;
  isAdmin?: boolean;
  onUpdateIncentive?: (updated: GoalIncentive | null) => void;
}

export function GoalIncentiveCard({
  incentive,
  isAdmin = true,
  onUpdateIncentive,
}: GoalIncentiveCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const percentage = incentive
    ? Math.min(100, Math.round((incentive.progressoAtual / incentive.objetivoMeta) * 100))
    : 0;

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#D9BB4C", "#1266C7", "#F8DA56", "#22C55E"],
    });
  };

  const handleSaveGoal = (updated: GoalIncentive | null) => {
    if (onUpdateIncentive) {
      onUpdateIncentive(updated);
    }
  };

  // Se não houver meta cadastrada:
  if (!incentive) {
    // Para corretores regulares, não exibe nada
    if (!isAdmin) return null;

    // Para administradores, exibe card para cadastro de nova meta
    return (
      <>
        <div className="bg-white/60 dark:bg-[#0A0E17]/60 border-2 border-dashed border-slate-300 dark:border-[#1F2937] rounded-2xl p-6 text-center space-y-3 transition-colors hover:border-connect-blue/50">
          <div className="w-12 h-12 rounded-2xl bg-platz-gold/15 text-platz-gold border border-platz-gold/30 flex items-center justify-center mx-auto shadow-xs">
            <Target className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Nenhuma Meta de Incentivo Ativa no Momento
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Campanhas de incentivo só aparecem para a equipe quando cadastradas pelo Administrador.
            </p>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold shadow-md shadow-connect-blue/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 text-platz-gold" />
            Cadastrar Nova Meta (ADM)
          </button>
        </div>

        <AdminGoalModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentGoal={null}
          onSave={handleSaveGoal}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] rounded-2xl p-5 shadow-sm space-y-4">
        {/* Header com Badge 'Meta Connect Platz' e Ações de ADM */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-full bg-platz-gold/20 text-amber-800 dark:text-[#F8DA56] border border-platz-gold/40 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Award className="w-3.5 h-3.5 text-platz-gold" />
              Meta Connect Platz
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {incentive.titulo}
            </h3>
            {incentive.publicoAlvo && (
              <span className="text-[10px] bg-slate-100 dark:bg-[#161F30] text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-semibold">
                {incentive.publicoAlvo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-connect-blue" />
              <span>Válido até: {incentive.periodoValidade}</span>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-connect-blue/10 hover:bg-connect-blue/20 text-connect-blue border border-connect-blue/30 text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02]"
                title="Ajustar ou cadastrar meta como Administrador"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ajustar Meta (ADM)</span>
                <span className="sm:hidden">Ajustar</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Grid: Card Prêmio + Objetivo + Progresso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Prêmio */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-platz-gold/15 text-platz-gold flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Premiação da Campanha
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                {incentive.premio}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {incentive.descricao}
              </p>
            </div>
          </div>

          {/* Card Tint Objetivo */}
          <div className="p-4 rounded-xl bg-connect-blue/5 dark:bg-[#0E1726] border border-connect-blue/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-connect-blue block">
                Alvo Individual
              </span>
              <span className="text-lg font-extrabold text-connect-blue dark:text-blue-400 mt-1 block">
                OBJETIVO: {incentive.objetivoMeta} {incentive.unidade}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Fechamentos validados no período vigente
            </span>
          </div>

          {/* Card Seu Progresso com barra grossa */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-white">Seu Progresso</span>
              <span className="font-extrabold text-platz-gold">
                {incentive.progressoAtual} / {incentive.objetivoMeta} {incentive.unidade}
              </span>
            </div>

            {/* Barra grossa */}
            <div className="w-full h-3.5 bg-slate-200 dark:bg-[#161F30] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-connect-blue via-platz-gold to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">{percentage}% atingido</span>
              <button
                onClick={handleCelebrate}
                className="font-bold text-connect-blue hover:text-connect-deep-blue dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-platz-gold" />
                Celebrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal do Administrador */}
      {isAdmin && (
        <AdminGoalModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentGoal={incentive}
          onSave={handleSaveGoal}
        />
      )}
    </>
  );
}
