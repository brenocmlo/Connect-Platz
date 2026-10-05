"use client";

import React from "react";
import { X, Filter, RotateCcw } from "lucide-react";
import { VendasFilterState } from "./types";

interface VendasFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: VendasFilterState;
  onFilterChange: (filters: VendasFilterState) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
}

export function VendasFilterSheet({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  totalFilteredCount,
}: VendasFilterSheetProps) {
  if (!isOpen) return null;

  const handleChange = (field: keyof VendasFilterState, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-[#0A0E17] border-l border-slate-200 dark:border-[#1C2537] h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-[#1C2537] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-connect-blue/10 text-connect-blue">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Filtros de Vendas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Refine a listagem de negócios e comissões
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161F30] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Form */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Código da Venda */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Código da Venda
            </label>
            <input
              type="text"
              placeholder="Ex: CP-2026-089"
              value={filters.codigoVenda}
              onChange={(e) => handleChange("codigoVenda", e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-connect-blue"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status da Venda
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-connect-blue"
            >
              <option value="ALL">Todos os status</option>
              <option value="APROVADA">Aprovada</option>
              <option value="EM_ANALISE">Em Análise</option>
              <option value="PAGA">Paga / Liquidada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          {/* Corretores */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Corretores
            </label>
            <select
              value={filters.corretor}
              onChange={(e) => handleChange("corretor", e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-connect-blue"
            >
              <option value="ALL">Todos os corretores</option>
              <option value="Lucas Santos">Lucas Santos</option>
              <option value="Mariana Oliveira">Mariana Oliveira</option>
              <option value="Carlos Eduardo">Carlos Eduardo</option>
              <option value="Ana Paula">Ana Paula</option>
            </select>
          </div>

          {/* Gerentes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Gerentes
            </label>
            <select
              value={filters.gerente}
              onChange={(e) => handleChange("gerente", e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-connect-blue"
            >
              <option value="ALL">Todos os gerentes</option>
              <option value="Mariana Oliveira">Mariana Oliveira</option>
              <option value="Rodrigo Pinho">Rodrigo Pinho</option>
            </select>
          </div>

          {/* Captadores */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Captadores
            </label>
            <select
              value={filters.captador}
              onChange={(e) => handleChange("captador", e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-connect-blue"
            >
              <option value="ALL">Todos os captadores</option>
              <option value="Rafael Mendes">Rafael Mendes</option>
              <option value="Lucas Santos">Lucas Santos</option>
            </select>
          </div>

          {/* Gestores */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Gestores / Sócios
            </label>
            <select
              value={filters.gestor}
              onChange={(e) => handleChange("gestor", e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-connect-blue"
            >
              <option value="ALL">Todos os gestores</option>
              <option value="Diretoria Platz">Diretoria Platz</option>
              <option value="Gestão Comercial">Gestão Comercial</option>
            </select>
          </div>

          {/* Construtoras */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Construtoras
            </label>
            <select
              value={filters.construtora}
              onChange={(e) => handleChange("construtora", e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-connect-blue"
            >
              <option value="ALL">Todas as construtoras</option>
              <option value="Platz Empreendimentos">Platz Empreendimentos</option>
              <option value="Moura Dubeux">Moura Dubeux</option>
              <option value="Diagonal Engenharia">Diagonal Engenharia</option>
            </select>
          </div>

          {/* Faixa de VGV */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              VGV Mínimo e Máximo (R$)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Mínimo"
                value={filters.vgvMin}
                onChange={(e) => handleChange("vgvMin", e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
              <input
                type="number"
                placeholder="Máximo"
                value={filters.vgvMax}
                onChange={(e) => handleChange("vgvMax", e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
          </div>

          {/* Ordenar por */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ordenar por
            </label>
            <select
              value={filters.ordenarPor}
              onChange={(e) => handleChange("ordenarPor", e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-connect-blue"
            >
              <option value="recente">Mais recentes primeiro</option>
              <option value="vgv_desc">Maior VGV</option>
              <option value="vgv_asc">Menor VGV</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#1C2537] flex items-center justify-between bg-slate-50 dark:bg-[#080C14]">
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar Filtros
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#161F30] transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-connect-blue text-white hover:bg-connect-deep-blue transition-all"
            >
              Ver resultados ({totalFilteredCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
