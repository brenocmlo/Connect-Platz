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

        {/* Filtro de período */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted/80 text-foreground text-xs font-semibold shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Mês atual</span>
        </button>

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
