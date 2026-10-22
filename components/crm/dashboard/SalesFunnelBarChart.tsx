"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Info, Filter } from "lucide-react";
import { EmptyState } from "@/components/crm/primitives/EmptyState";
import type { FunnelReport } from "./types";

interface SalesFunnelBarChartProps {
  funnels: FunnelReport[];
}

/** Funil de Vendas (5.3 item 6): barras por etapa com % de conversão entre etapas. */
export function SalesFunnelBarChart({ funnels }: SalesFunnelBarChartProps) {
  const [index, setIndex] = useState(0);

  // Mantém o índice válido quando a lista de funis muda (ex.: troca de período)
  useEffect(() => {
    if (index > funnels.length - 1) setIndex(0);
  }, [funnels.length, index]);

  const funnel = funnels[index];
  const hasLeads = Boolean(funnel && funnel.totalLeads > 0);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground">Funil de Vendas</h3>
          <span
            className="text-muted-foreground"
            title="Leads captados no período, por etapa atual. A % indica a conversão em relação à etapa anterior."
            aria-label="Leads captados no período, por etapa atual. A % indica a conversão em relação à etapa anterior."
          >
            <Info className="w-3.5 h-3.5" />
          </span>
        </div>

        {funnels.length > 0 && (
          <div className="flex items-center gap-1.5 bg-muted rounded-lg p-1 text-xs">
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
              disabled={index === 0}
              aria-label="Funil anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-foreground px-1.5 truncate max-w-[140px]" title={funnel?.nome}>
              {funnel?.nome || `Funil ${index + 1}`}
            </span>
            <button
              onClick={() => setIndex((i) => Math.min(funnels.length - 1, i + 1))}
              className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
              disabled={index >= funnels.length - 1}
              aria-label="Próximo funil"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {!funnel || !hasLeads ? (
        <EmptyState
          icon={Filter}
          title={funnels.length === 0 ? "Nenhum funil ativo" : "Nenhum lead neste funil no período"}
          description="As etapas e taxas de conversão aparecem conforme os leads avançam no Kanban."
          className="min-h-[256px]"
        />
      ) : (
        <div className="space-y-4">
          {funnel.stages.map((stage) => (
            <div key={stage.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.cor }} />
                  <span className="font-semibold text-foreground truncate">{stage.nome}</span>
                  <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                    ({stage.count} {stage.count === 1 ? "lead" : "leads"})
                  </span>
                </div>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue border border-connect-blue/20 whitespace-nowrap"
                  title="Conversão em relação à etapa anterior"
                >
                  {stage.conversionPct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-connect-blue to-connect-deep-blue transition-all duration-700 ease-out motion-reduce:transition-none"
                  style={{ width: `${stage.reached > 0 ? Math.max(stage.sharePct, 4) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
