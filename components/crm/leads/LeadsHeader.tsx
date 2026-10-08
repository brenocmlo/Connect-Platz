"use client";

import React from "react";
import {
  Kanban as KanbanIcon,
  List,
  Plus,
  Download,
  Upload,
  Calendar,
} from "lucide-react";
import { useCrm, PeriodFilter } from "@/components/crm/CrmContext";

interface LeadsHeaderProps {
  viewMode: "kanban" | "table" | "bolsao";
  setViewMode: (mode: "kanban" | "table" | "bolsao") => void;
  onOpenNewLead: () => void;
  onImport?: () => void;
  onExport?: () => void;
}

export function LeadsHeader({
  viewMode,
  setViewMode,
  onOpenNewLead,
  onImport,
  onExport,
}: LeadsHeaderProps) {
  const { selectedPeriod, setSelectedPeriod } = useCrm();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-card border border-border rounded-2xl p-4 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Leads</h1>
        <p className="text-xs text-muted-foreground">
          Gestão do funil de vendas, esteira de atendimento e transbordo para bolsão
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Toggle Kanban | Lista */}
        <div className="flex bg-muted rounded-lg p-1 border border-border/60">
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === "kanban"
                ? "bg-connect-blue text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <KanbanIcon className="w-3.5 h-3.5" />
            Kanban
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === "table"
                ? "bg-connect-blue text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Lista
          </button>
        </div>

        {/* Filtro de período Interativo */}
        <div className="relative">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as PeriodFilter)}
            className="appearance-none bg-background hover:bg-muted/80 border border-border text-foreground text-xs font-semibold rounded-lg pl-8 pr-7 py-2 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-connect-blue shadow-xs"
            aria-label="Filtrar período dos leads"
          >
            <option value="hoje">📅 Hoje</option>
            <option value="7d">📅 7 dias</option>
            <option value="mes">📅 Mês atual</option>
            <option value="30d">📅 30 dias</option>
            <option value="ano">📅 Ano</option>
            <option value="todos">📅 Todo o período</option>
          </select>
          <Calendar className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Importar e Exportar */}
        <button
          onClick={onImport || (() => alert("Importação de planilha"))}
          className="p-2 rounded-lg border border-border bg-background hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          title="Importar Leads"
          aria-label="Importar Leads"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onExport || (() => alert("Exportação CSV/Excel"))}
          className="p-2 rounded-lg border border-border bg-background hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          title="Exportar"
          aria-label="Exportar"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* CTA + Novo Lead */}
        <button
          onClick={onOpenNewLead}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold shadow-md shadow-connect-blue/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Lead
        </button>
      </div>
    </div>
  );
}
