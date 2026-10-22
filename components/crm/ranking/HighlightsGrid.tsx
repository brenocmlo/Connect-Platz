"use client";

import React from "react";
import { Users, Eye, FileCheck, Building, TrendingUp, CalendarCheck } from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { HighlightItem, HighlightKey } from "./types";

const ICONS: Record<HighlightKey, React.ElementType> = {
  leads: Users,
  visitas: Eye,
  documentos: FileCheck,
  captacoes: Building,
  taxa: TrendingUp,
  compromissos: CalendarCheck,
};

/** Grid 3×2 de destaques por categoria (calculados em /api/ranking). */
export function HighlightsGrid({ highlights }: { highlights: HighlightItem[] }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Destaques por Categoria</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {highlights.map((item) => {
          const Icon = ICONS[item.icone] || TrendingUp;
          return (
            <div
              key={item.icone}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-connect-blue/40 transition-colors flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block truncate">
                  {item.titulo}
                </span>
                {item.nome ? (
                  <>
                    <span className="text-base font-extrabold text-foreground truncate block">{item.nome}</span>
                    <span className="text-xs font-semibold text-connect-blue dark:text-blue-400 block">
                      {item.metrica} {item.rotuloMetrica}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground block">Sem registros no período</span>
                )}
              </div>

              <div className="w-10 h-10 rounded-xl bg-connect-blue/10 text-connect-blue flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
