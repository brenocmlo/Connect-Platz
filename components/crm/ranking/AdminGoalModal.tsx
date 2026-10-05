"use client";

import React, { useState } from "react";
import { X, Award, Gift, Target, Calendar, Users, CheckCircle2 } from "lucide-react";
import { GoalIncentive } from "./types";

interface AdminGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: GoalIncentive;
  onSave: (updatedGoal: GoalIncentive) => void;
}

export function AdminGoalModal({
  isOpen,
  onClose,
  currentGoal,
  onSave,
}: AdminGoalModalProps) {
  const [titulo, setTitulo] = useState(currentGoal.titulo);
  const [premio, setPremio] = useState(currentGoal.premio);
  const [descricao, setDescricao] = useState(currentGoal.descricao);
  const [objetivoMeta, setObjetivoMeta] = useState(currentGoal.objetivoMeta);
  const [unidade, setUnidade] = useState(currentGoal.unidade);
  const [periodoValidade, setPeriodoValidade] = useState(currentGoal.periodoValidade);
  const [tipoMeta, setTipoMeta] = useState(currentGoal.tipoMeta || "vendas");
  const [publicoAlvo, setPublicoAlvo] = useState(currentGoal.publicoAlvo || "Toda a Equipe Comercial");
  const [progressoAtual, setProgressoAtual] = useState(currentGoal.progressoAtual);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...currentGoal,
      titulo,
      premio,
      descricao,
      objetivoMeta: Number(objetivoMeta) || 1,
      unidade,
      periodoValidade,
      tipoMeta: tipoMeta as any,
      publicoAlvo,
      progressoAtual: Number(progressoAtual) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1F2937] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1C2537] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-platz-gold/20 text-platz-gold border border-platz-gold/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Gestão de Metas & Incentivos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajuste e cadastro de campanhas direto pelo Administrador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Título da Campanha */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Nome da Campanha de Incentivo
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Campanha Acelera Platz — Q4"
              className="w-full bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-connect-blue"
            />
          </div>

          {/* Grid: Tipo de Meta + Alvo + Unidade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Tipo de Meta
              </label>
              <select
                value={tipoMeta}
                onChange={(e) => {
                  setTipoMeta(e.target.value as any);
                  if (e.target.value === "vendas") setUnidade("Vendas");
                  if (e.target.value === "vgv") setUnidade("R$ VGV");
                  if (e.target.value === "captacoes") setUnidade("Imóveis");
                  if (e.target.value === "visitas") setUnidade("Visitas");
                }}
                className="w-full bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-connect-blue"
              >
                <option value="vendas">Volume de Vendas</option>
                <option value="vgv">VGV Total (R$)</option>
                <option value="captacoes">Novas Captações</option>
                <option value="visitas">Visitas Realizadas</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Alvo Individual
              </label>
              <input
                type="number"
                required
                min={1}
                value={objetivoMeta}
                onChange={(e) => setObjetivoMeta(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Unidade
              </label>
              <input
                type="text"
                required
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                placeholder="Ex: Vendas"
                className="w-full bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
          </div>

          {/* Premiação */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-platz-gold" />
              Premiação em Destaque
            </label>
            <input
              type="text"
              required
              value={premio}
              onChange={(e) => setPremio(e.target.value)}
              placeholder="Ex: Viagem para Resort + iPhone 16 Pro"
              className="w-full bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-connect-blue"
            />
          </div>

          {/* Descrição / Regras */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Critérios & Regras de Conquista
            </label>
            <textarea
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Premiação exclusiva para fechamentos com contrato assinado no período."
              className="w-full bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-connect-blue"
            />
          </div>

          {/* Grid: Validade + Público + Progresso Simulado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-connect-blue" />
                Válido até
              </label>
              <input
                type="text"
                required
                value={periodoValidade}
                onChange={(e) => setPeriodoValidade(e.target.value)}
                placeholder="dd/mm/aaaa"
                className="w-full bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-connect-blue" />
                Público Alvo
              </label>
              <select
                value={publicoAlvo}
                onChange={(e) => setPublicoAlvo(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-connect-blue"
              >
                <option value="Toda a Equipe Comercial">Toda a Equipe</option>
                <option value="Corretores Sênior">Corretores Sênior</option>
                <option value="Novos Talentos / Júnior">Novos Talentos</option>
                <option value="Gerentes de Produto">Gerentes</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                Progresso Atual
              </label>
              <input
                type="number"
                min={0}
                value={progressoAtual}
                onChange={(e) => setProgressoAtual(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-[#1C2537]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161F30] font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white font-bold flex items-center gap-2 shadow-md shadow-connect-blue/20 hover:scale-[1.01] transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-platz-gold" />
              Salvar e Ativar Meta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
