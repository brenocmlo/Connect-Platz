// components/crm/ranking/tv/TvMotivationalBanner.tsx
// Faixa de citação inspiradora ("Frase do Dia"), seletor de semana e ações de tela.

"use client";

import React, { useState, useEffect } from "react";
import { Maximize2, Minimize2, RefreshCw, Sparkles, ChevronDown } from "lucide-react";
import type { TvPeriodKey, TvPeriodOption } from "./types";

interface TvMotivationalBannerProps {
  frase: string;
  autor: string;
  selectedPeriod: TvPeriodKey | "";
  onSelectPeriod: (p: TvPeriodKey) => void;
  onRefresh: () => void;
  loading: boolean;
  lastUpdated: Date;
}

const PERIOD_OPTIONS: TvPeriodOption[] = [
  { key: "sem_1", label: "1ª SEM" },
  { key: "sem_2", label: "2ª SEM" },
  { key: "sem_3", label: "3ª SEM" },
  { key: "sem_4", label: "4ª SEM" },
  { key: "sem_5", label: "5ª SEM" },
  { key: "mes", label: "MÊS" },
];

export function TvMotivationalBanner({
  frase,
  autor,
  selectedPeriod,
  onSelectPeriod,
  onRefresh,
  loading,
  lastUpdated,
}: TvMotivationalBannerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentLabel =
    PERIOD_OPTIONS.find((o) => o.key === selectedPeriod)?.label || "5ª SEM";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-3 sm:px-5 py-2 mx-2 sm:mx-4 rounded-xl bg-gradient-to-r from-[#0F1E36]/90 via-[#111F38]/90 to-[#0F1E36]/90 border border-[#1E2E4A]/80 shadow-inner">
      {/* Citação / Frase do Dia */}
      <div className="flex items-center gap-2.5 text-center sm:text-left min-w-0">
        <Sparkles className="w-4 h-4 text-[#D9BB4C] shrink-0 animate-pulse" />
        <p className="text-xs sm:text-sm text-slate-200 italic font-medium truncate max-w-2xl">
          &ldquo;{frase}&rdquo;{" "}
          <span className="not-italic font-bold text-slate-400">— {autor}</span>
        </p>
      </div>

      {/* Controles: Seletor de Semanas + Fullscreen + Refresh */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Dropdown de Período / Semanas */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#152542] hover:bg-[#1A2E52] border border-[#23385F] text-xs font-bold text-white shadow-sm transition-colors"
          >
            <span>{currentLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-28 rounded-lg bg-[#0E1B33] border border-[#23385F] shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    onSelectPeriod(opt.key);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedPeriod === opt.key
                      ? "bg-[#1266C7] text-white"
                      : "text-slate-300 hover:bg-[#182C52] hover:text-white"
                  }`}
                >
                  {opt.label}
                  {selectedPeriod === opt.key && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botão Atualizar */}
        <button
          type="button"
          onClick={onRefresh}
          title="Atualizar dados agora"
          className="p-1.5 rounded-lg bg-[#152542] hover:bg-[#1A2E52] border border-[#23385F] text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#D9BB4C]" : ""}`} />
        </button>

        {/* Botão Fullscreen */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia (Modo TV)"}
          className="p-1.5 rounded-lg bg-[#1266C7] hover:bg-[#0D478F] text-white shadow-md transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
