"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

const funnelsData: Record<string, { title: string; steps: FunnelStep[] }> = {
  "funil-1": {
    title: "Funil 1 — Lançamentos & Incorporação",
    steps: [
      { name: "Novos Leads", count: 186, percentage: 100, color: "bg-blue-500" },
      { name: "Qualificação & Contato", count: 142, percentage: 76.3, color: "bg-connect-blue" },
      { name: "Visita Agendada", count: 58, percentage: 31.2, color: "bg-sky-600" },
      { name: "Proposta Enviada", count: 24, percentage: 12.9, color: "bg-[#D9BB4C]" },
      { name: "Venda Fechada", count: 12, percentage: 6.45, color: "bg-emerald-500" },
    ],
  },
  "funil-2": {
    title: "Funil 2 — Prontos & Avulsos",
    steps: [
      { name: "Novos Leads", count: 85, percentage: 100, color: "bg-blue-500" },
      { name: "Qualificação & Contato", count: 64, percentage: 75.3, color: "bg-connect-blue" },
      { name: "Visita ao Imóvel", count: 32, percentage: 37.6, color: "bg-sky-600" },
      { name: "Proposta / Financiamento", count: 14, percentage: 16.5, color: "bg-[#D9BB4C]" },
      { name: "Contrato Assinado", count: 6, percentage: 7.05, color: "bg-emerald-500" },
    ],
  },
};

export function SalesFunnelBarChart() {
  const [currentFunnelKey, setCurrentFunnelKey] = useState<"funil-1" | "funil-2">("funil-1");

  const funnel = funnelsData[currentFunnelKey];

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      {/* 1. CABEÇALHO DO FUNIL COM NAVEGAÇÃO ‹ FUNIL X › + ÍCONE ⓘ (5.3) */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground">Funil de Vendas</h3>
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Cálculo determinístico de conversão por etapa"
            aria-label="Informações sobre o funil"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Navegação ‹ Funil 1 › */}
        <div className="flex items-center gap-1.5 bg-muted rounded-lg p-1 text-xs">
          <button
            onClick={() => setCurrentFunnelKey("funil-1")}
            className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            disabled={currentFunnelKey === "funil-1"}
            aria-label="Funil anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="font-semibold text-foreground px-1.5 truncate max-w-[140px]">
            {currentFunnelKey === "funil-1" ? "Funil 1" : "Funil 2"}
          </span>

          <button
            onClick={() => setCurrentFunnelKey("funil-2")}
            className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            disabled={currentFunnelKey === "funil-2"}
            aria-label="Próximo funil"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. BARRAS HORIZONTAIS COM GRADIENTE PRIMÁRIO (5.3) */}
      <div className="space-y-4">
        {funnel.steps.map((step) => (
          <div key={step.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className={`w-2.5 h-2.5 rounded-full ${step.color} flex-shrink-0`} />
                <span className="font-semibold text-foreground truncate">{step.name}</span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  ({step.count} leads)
                </span>
              </div>

              {/* Pílula com % de conversão à direita (5.3) */}
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue border border-connect-blue/20">
                {step.percentage}%
              </span>
            </div>

            {/* Barra de progresso horizontal com gradiente */}
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-connect-blue to-[#0E51A0] transition-all duration-700 ease-out"
                style={{ width: `${Math.max(step.percentage, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
