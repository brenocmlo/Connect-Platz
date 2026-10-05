"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";

interface LeadsSubBarProps {
  selectedFunnel: string;
  setSelectedFunnel: (funnel: string) => void;
  selectedMember: string;
  setSelectedMember: (member: string) => void;
  viewMode: "kanban" | "table" | "bolsao";
  setViewMode: (mode: "kanban" | "table" | "bolsao") => void;
  bolsaoCount: number;
}

export function LeadsSubBar({
  selectedFunnel,
  setSelectedFunnel,
  selectedMember,
  setSelectedMember,
  viewMode,
  setViewMode,
  bolsaoCount,
}: LeadsSubBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
      <div className="flex flex-wrap items-center gap-2">
        {/* Seletor de Funil */}
        <select
          value={selectedFunnel}
          onChange={(e) => setSelectedFunnel(e.target.value)}
          className="bg-card border border-border text-foreground text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-connect-blue shadow-xs cursor-pointer"
        >
          <option>Lançamentos de Médio & Alto Padrão</option>
          <option>Imóveis Prontos & Avulsos</option>
          <option>Aluguel de Temporada (Veraneio)</option>
          <option>Programa Minha Casa Minha Vida</option>
        </select>

        {/* Seletor de Membros */}
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="bg-card border border-border text-foreground text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-connect-blue shadow-xs cursor-pointer"
        >
          <option value="TODOS">👥 Todos os Membros</option>
          <option value="Lucas Pinheiro">Lucas Pinheiro</option>
          <option value="Camila Duarte">Camila Duarte</option>
          <option value="Robson Carvalho">Robson Carvalho</option>
        </select>
      </div>

      {/* Botão Bolsão com contador */}
      <button
        onClick={() => setViewMode(viewMode === "bolsao" ? "kanban" : "bolsao")}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
          viewMode === "bolsao"
            ? "bg-amber-600 text-white border-amber-600 shadow-sm"
            : "bg-card border-border hover:border-amber-500/50 text-foreground"
        }`}
      >
        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
        <span>Bolsão</span>
        <span className="bg-amber-500/20 text-amber-500 px-1.5 py-0.2 rounded-full text-[10px]">
          {bolsaoCount}
        </span>
      </button>
    </div>
  );
}
