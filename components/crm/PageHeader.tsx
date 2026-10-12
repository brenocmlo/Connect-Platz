"use client";

import React from "react";
import { Eye, EyeOff, Download, Plus } from "lucide-react";
import { useCrm } from "./CrmContext";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  actionHref?: string;
  showPeriodSelector?: boolean;
  showExportButton?: boolean;
  showHideValuesButton?: boolean;
  onExportClick?: () => void;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  actionLabel,
  onActionClick,
  actionHref,
  showPeriodSelector = false,
  showExportButton = true,
  showHideValuesButton = true,
  onExportClick,
  children,
}: PageHeaderProps) {
  const { hideValues, toggleHideValues } = useCrm();

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
        {showHideValuesButton && (
          <button
            onClick={toggleHideValues}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            title={hideValues ? "Mostrar valores monetários" : "Ocultar valores monetários"}
            aria-label={hideValues ? "Mostrar valores monetários" : "Ocultar valores monetários"}
          >
            {hideValues ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4" />}
          </button>
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
        {actionLabel && (() => {
          const cleanLabel = actionLabel.replace(/^\+\s*/, "");
          return actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold transition-all shadow-md shadow-connect-blue/20 hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{cleanLabel}</span>
            </a>
          ) : (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold transition-all shadow-md shadow-connect-blue/20 hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{cleanLabel}</span>
            </button>
          );
        })()}
      </div>
    </div>
  );
}
