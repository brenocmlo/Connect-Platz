"use client";

import React from "react";
import { Users, Eye, FileCheck, Building, TrendingUp, CalendarCheck } from "lucide-react";
import { HighlightItem } from "./types";

interface HighlightsGridProps {
  highlights: HighlightItem[];
}

export function HighlightsGrid({ highlights }: HighlightsGridProps) {
  const iconMap: Record<string, React.ElementType> = {
    leads: Users,
    visitas: Eye,
    documentos: FileCheck,
    captacoes: Building,
    taxa: TrendingUp,
    compromissos: CalendarCheck,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-4 bg-connect-blue rounded-full" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Destaques por Categoria
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {highlights.map((item, idx) => {
          const Icon = iconMap[item.icone] || TrendingUp;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] rounded-2xl p-4 shadow-sm hover:border-connect-blue/40 transition-all flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                  {item.titulo}
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white truncate block">
                  {item.nome}
                </span>
                <span className="text-xs font-semibold text-connect-blue dark:text-blue-400 block">
                  {item.metrica} {item.rotuloMetrica}
                </span>
              </div>

              <div className="w-10 h-10 rounded-xl bg-connect-blue/10 dark:bg-connect-blue/15 text-connect-blue flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
