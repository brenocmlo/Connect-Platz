"use client";

import React from "react";
import { Eye, EyeOff, Calendar, Download, Plus } from "lucide-react";
import { useCrm, PeriodFilter } from "./CrmContext";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  actionHref?: string;
  showPeriodSelector?: boolean;
  showExportButton?: boolean;
  onExportClick?: () => void;
  children?: React.ReactNode;
}

const periodLabels: Record<PeriodFilter, string> = {
  hoje: "Hoje",
  "7d": "Últimos 7 dias",
  mes: "Mês atual",
  "30d": "Últimos 30 dias",
  ano: "Ano",
};

export function PageHeader({
  title,
  subtitle,
  actionLabel,
  onActionClick,
  actionHref,
  showPeriodSelector = true,
  showExportButton = true,
  onExportClick,
  children,
}: PageHeaderProps) {
  const { hideValues, toggleHideValues, selectedPeriod, setSelectedPeriod } = useCrm();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
      {/* 1. TÍTULO À ESQUERDA (5.2) */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      {/* 2. AÇÕES À DIREITA (5.2) */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Botão-ícone Olho: Ocultar/Exibir Valores */}
        <button
          onClick={toggleHideValues}
          className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-sm"
          title={hideValues ? "Mostrar valores monetários" : "Ocultar valores monetários"}
          aria-label={hideValues ? "Mostrar valores monetários" : "Ocultar valores monetários"}
        >
          {hideValues ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Seletor de Período (Outline Button) */}
        {showPeriodSelector && (
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as PeriodFilter)}
              className="appearance-none bg-card hover:bg-muted border border-border text-foreground text-xs font-medium rounded-lg pl-8 pr-7 py-2 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              aria-label="Selecionar período"
            >
              <option value="hoje">📅 Hoje</option>
              <option value="7d">📅 7 dias</option>
              <option value="mes">📅 Mês atual</option>
              <option value="30d">📅 30 dias</option>
              <option value="ano">📅 Ano</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Botão Exportar */}
        {showExportButton && (
          <button
            onClick={onExportClick}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            title="Exportar dados"
            aria-label="Exportar dados"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Conteúdo adicional/customizado injetado */}
        {children}

        {/* CTA Primário Sólido "+ Novo …" */}
        {actionLabel && (
          actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold transition-all shadow-md shadow-connect-blue/20 hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{actionLabel}</span>
            </a>
          ) : (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold transition-all shadow-md shadow-connect-blue/20 hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{actionLabel}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
