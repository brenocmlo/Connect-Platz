"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Download, Plus, CalendarDays, ChevronDown, Check } from "lucide-react";
import { useCrm, PeriodFilter } from "./CrmContext";

/** Opções do filtro global de período (estado em CrmContext.selectedPeriod). */
export const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "mes", label: "Mês atual" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "ano", label: "Ano atual" },
  { value: "todos", label: "Todos" },
];

export function periodLabel(period: PeriodFilter): string {
  return PERIOD_OPTIONS.find((o) => o.value === period)?.label || "Mês atual";
}

/** Botão outline "📅 <período> ▾" com menu ancorado (fecha com clique externo ou Esc). */
function PeriodSelector() {
  const { selectedPeriod, setSelectedPeriod } = useCrm();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <CalendarDays className="w-4 h-4 text-connect-blue" />
        <span>{periodLabel(selectedPeriod)}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Filtrar por período"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
            className="absolute right-0 md:right-auto md:left-0 z-40 mt-1.5 w-48 origin-top rounded-xl border border-border bg-card p-1 shadow-xl"
          >
            {PERIOD_OPTIONS.map((option) => {
              const active = option.value === selectedPeriod;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setSelectedPeriod(option.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                    active
                      ? "bg-connect-blue/10 text-connect-blue font-bold"
                      : "text-foreground hover:bg-connect-blue hover:text-white"
                  }`}
                >
                  <span>{option.label}</span>
                  {active && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

        {/* Seletor de período global (5.2) */}
        {showPeriodSelector && <PeriodSelector />}

        {/* Botão Exportar (somente quando há ação de exportação) */}
        {showExportButton && onExportClick && (
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
