"use client";

import React from "react";
import { ShieldAlert, Moon } from "lucide-react";

interface LeadsSubBarProps {
  funnels: { id: string; nome: string }[];
  selectedFunnelId: string | null;
  onSelectFunnel: (funnelId: string) => void;
  members: string[];
  selectedMember: string;
  setSelectedMember: (member: string) => void;
  viewMode: "kanban" | "table" | "bolsao" | "nightQueue";
  setViewMode: (mode: "kanban" | "table" | "bolsao" | "nightQueue") => void;
  bolsaoCount: number;
  nightQueueCount?: number;
}

const selectClass =
  "bg-card border border-border text-foreground text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-connect-blue shadow-xs cursor-pointer w-full sm:w-auto max-w-full truncate";

export function LeadsSubBar({
  funnels,
  selectedFunnelId,
  onSelectFunnel,
  members,
  selectedMember,
  setSelectedMember,
  viewMode,
  setViewMode,
  bolsaoCount,
  nightQueueCount = 0,
}: LeadsSubBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 px-1">
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {/* Seletor de Funil (funis ativos da organização) */}
        {funnels.length > 0 && (
          <select
            value={selectedFunnelId || ""}
            onChange={(e) => onSelectFunnel(e.target.value)}
            className={`${selectClass} font-bold`}
            aria-label="Funil de vendas"
          >
            {funnels.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        )}

        {/* Seletor de Membros (corretores presentes nos leads carregados) */}
        {members.length > 0 && (
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className={`${selectClass} font-semibold`}
            aria-label="Filtrar por membro"
          >
            <option value="TODOS">👥 Todos os Membros</option>
            {members.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Botão Fila Noturna com contador */}
        {nightQueueCount > 0 && (
          <button
            onClick={() => setViewMode(viewMode === "nightQueue" ? "kanban" : "nightQueue")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              viewMode === "nightQueue"
                ? "bg-connect-deep-blue text-white border-connect-deep-blue shadow-sm"
                : "bg-card border-border hover:border-connect-blue/50 text-foreground"
            }`}
            title="Leads retidos na Fila Noturna"
          >
            <Moon className={`w-3.5 h-3.5 ${viewMode === "nightQueue" ? "text-white" : "text-connect-blue"}`} />
            <span>Fila Noturna</span>
            <span className="bg-connect-blue/15 text-connect-blue dark:text-sky-300 px-1.5 py-0.5 rounded-full text-[10px]">
              {nightQueueCount}
            </span>
          </button>
        )}

        {/* Botão Bolsão com contador */}
        <button
          onClick={() => setViewMode(viewMode === "bolsao" ? "kanban" : "bolsao")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
            viewMode === "bolsao"
              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
              : "bg-card border-border hover:border-amber-500/50 text-foreground"
          }`}
        >
          <ShieldAlert className={`w-3.5 h-3.5 ${viewMode === "bolsao" ? "text-white" : "text-amber-500"}`} />
          <span>Bolsão</span>
          <span className="bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full text-[10px]">
            {bolsaoCount}
          </span>
        </button>
      </div>
    </div>
  );
}
