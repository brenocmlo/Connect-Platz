"use client";

import React, { useState } from "react";
import { ResponsiveContainer } from "recharts";
import { TrendingUp, BarChart3, Sparkles, Info } from "lucide-react";
import { BiMetricType, BiGranularityType, BiChartVisualType } from "./types";
import { BI_METRIC_SUMMARIES } from "./biData";
import { renderMetricChart } from "./BiChartRenderers";
import { useCrm } from "@/components/crm/CrmContext";

interface BiHeroChartCanvasProps {
  activeMetric: BiMetricType;
  granularity: BiGranularityType;
  onGranularityChange: (g: BiGranularityType) => void;
}

export function BiHeroChartCanvas({
  activeMetric,
  granularity,
  onGranularityChange,
}: BiHeroChartCanvasProps) {
  const { hideValues } = useCrm();
  const [visualType, setVisualType] = useState<BiChartVisualType>("area");
  const [showComparison, setShowComparison] = useState<boolean>(true);

  const currentSummary =
    BI_METRIC_SUMMARIES.find((m) => m.id === activeMetric) ||
    BI_METRIC_SUMMARIES[0];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Barra Superior do Canvas: Título + Seletores de Granulosidade e Visualização */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">{currentSummary.title}</h3>
            <span className="text-[11px] font-semibold text-connect-blue bg-connect-blue/10 px-2 py-0.5 rounded-full border border-connect-blue/20">
              {currentSummary.category}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{currentSummary.sublabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor de Granulosidade (Diário / Semanal / Mensal) */}
          {activeMetric === "vgv" && (
            <div className="flex items-center bg-muted/70 p-1 rounded-xl border border-border text-xs">
              {(["diario", "semanal", "mensal"] as BiGranularityType[]).map((g) => (
                <button
                  key={g}
                  onClick={() => onGranularityChange(g)}
                  className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                    granularity === g
                      ? "bg-card text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* Seletor de Modo de Visualização (Área vs Barras) */}
          {activeMetric === "vgv" && (
            <div className="flex items-center bg-muted/70 p-1 rounded-xl border border-border text-xs">
              <button
                onClick={() => setVisualType("area")}
                className={`p-1.5 rounded-lg transition-all ${
                  visualType === "area" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
                title="Gráfico em Área"
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setVisualType("barras")}
                className={`p-1.5 rounded-lg transition-all ${
                  visualType === "barras" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
                title="Gráfico em Barras"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Toggle de Comparação */}
          {activeMetric === "vgv" && (
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`text-xs px-2.5 py-1.5 rounded-xl border font-semibold transition-colors ${
                showComparison
                  ? "bg-connect-blue/10 border-connect-blue/30 text-connect-blue"
                  : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              vs. Anterior
            </button>
          )}
        </div>
      </div>

      {/* Área do Gráfico Recharts */}
      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {renderMetricChart({
            activeMetric,
            granularity,
            visualType,
            showComparison,
            hideValues,
          })}
        </ResponsiveContainer>
      </div>

      {/* Insights Determinísticos no Rodapé do Gráfico */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/70">
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60">
          <Sparkles className="w-3.5 h-3.5 text-platz-gold shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-foreground block">Pico de Performance</span>
            <span className="text-[11px] text-muted-foreground">
              {activeMetric === "funil"
                ? "Novo Lead com 18 min de SLA recorde"
                : "Setembro registrou maior VGV: R$ 4,85M"}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60">
          <TrendingUp className="w-3.5 h-3.5 text-connect-blue shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-foreground block">Eficiência & Escala</span>
            <span className="text-[11px] text-muted-foreground">
              {activeMetric === "roi"
                ? "Indicações & Carteira lideram com ROI de 28x"
                : "Meta comercial atingida em 108% no trimestre"}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60">
          <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-foreground block">Previsão Próximo Ciclo</span>
            <span className="text-[11px] text-muted-foreground">
              Projeção de fechamento positivo com margem de +12%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
