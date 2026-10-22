"use client";

import React, { useState } from "react";
import { ResponsiveContainer } from "recharts";
import { TrendingUp, BarChart3, Sparkles, Info } from "lucide-react";
import type { BiMetricType, BiGranularityType, BiChartVisualType, BiReportData } from "./types";
import { renderMetricChart } from "./BiChartRenderers";
import { useCrm } from "@/components/crm/CrmContext";
import { formatCompactBRL } from "@/components/crm/dashboard/format";

interface BiHeroChartCanvasProps {
  data: BiReportData;
  activeMetric: BiMetricType;
  granularity: BiGranularityType;
  onGranularityChange: (g: BiGranularityType) => void;
}

interface Insight {
  title: string;
  text: string;
}

/** Insights 100% determinísticos calculados a partir das séries exibidas. */
function buildInsights(data: BiReportData, metric: BiMetricType, granularity: BiGranularityType, hide: boolean) {
  const money = (v: number) => (hide ? "••••" : formatCompactBRL(v));
  const summary = data.summaries.find((m) => m.id === metric);
  const change: Insight = {
    title: "Variação vs. Anterior",
    text:
      summary?.changePercent == null
        ? "Sem base de comparação no período anterior"
        : `${summary.changePercent > 0 ? "+" : summary.changePercent < 0 ? "-" : ""}${Math.abs(
            summary.changePercent
          ).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}${summary.changeSuffix ?? "%"} em ${data.period.label.toLowerCase()}`,
  };
  const peakOf = (points: { label: string; realizado: number }[]) =>
    points.reduce<{ label: string; realizado: number } | null>((best, p) => (!best || p.realizado > best.realizado ? p : best), null);

  if (metric === "funil") {
    const stages = data.funnelVelocity.stages;
    const slowest = [...stages].sort((a, b) => b.tempoHoras - a.tempoHoras)[0];
    const critical = stages.filter((s) => s.status === "critico").length;
    return [
      { title: "Etapa Mais Lenta", text: slowest && slowest.tempoHoras > 0 ? `${slowest.etapa}: ${slowest.tempoHoras}h em média` : "Sem leads abertos no funil" },
      { title: "Etapas Acima do SLA", text: `${critical} de ${stages.length} etapa(s)` },
      change,
    ];
  }
  if (metric === "roi") {
    const best = [...data.channels].filter((c) => c.vgv > 0).sort((a, b) => b.vgv - a.vgv)[0];
    const withSales = data.channels.filter((c) => c.vendas > 0).length;
    return [
      { title: "Canal com Maior VGV", text: best ? `${best.canal}: ${money(best.vgv)}` : "Nenhuma venda no período" },
      { title: "Canais com Vendas", text: `${withSales} de ${data.channels.length} origem(ns)` },
      change,
    ];
  }
  const series =
    metric === "vgv" ? data.vgvSeries[granularity] : metric === "conversao" ? data.conversionSeries : data.commissionSeries;
  const peak = peakOf(series);
  const total = series.reduce((acc, p) => acc + p.realizado, 0);
  const isRate = metric === "conversao";
  const fmt = (v: number) => (isRate ? `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : money(v));
  return [
    { title: "Pico da Série", text: peak && peak.realizado > 0 ? `${peak.label}: ${fmt(peak.realizado)}` : "Sem registros na série" },
    {
      title: isRate ? "Média da Série" : "Total da Série",
      text: isRate ? fmt(series.length ? total / series.length : 0) : fmt(total),
    },
    change,
  ];
}

export function BiHeroChartCanvas({
  data,
  activeMetric,
  granularity,
  onGranularityChange,
}: BiHeroChartCanvasProps) {
  const { hideValues } = useCrm();
  const [visualType, setVisualType] = useState<BiChartVisualType>("area");
  const [showComparison, setShowComparison] = useState<boolean>(true);

  const currentSummary = data.summaries.find((m) => m.id === activeMetric) || data.summaries[0];
  const insights = buildInsights(data, activeMetric, granularity, hideValues);
  const insightIcons = [
    <Sparkles key="a" className="w-3.5 h-3.5 text-platz-gold shrink-0 mt-0.5" />,
    <TrendingUp key="b" className="w-3.5 h-3.5 text-connect-blue shrink-0 mt-0.5" />,
    <Info key="c" className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />,
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Barra Superior do Canvas: Título + Seletores de Granulosidade e Visualização */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">{currentSummary?.title}</h3>
            <span className="text-[11px] font-semibold text-connect-blue bg-connect-blue/10 px-2 py-0.5 rounded-full border border-connect-blue/20">
              {currentSummary?.category}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{currentSummary?.sublabel}</p>
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
          {(activeMetric === "vgv" || activeMetric === "conversao") && (
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
            data,
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
        {insights.map((insight, idx) => (
          <div key={insight.title} className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60">
            {insightIcons[idx]}
            <div className="text-xs">
              <span className="font-bold text-foreground block">{insight.title}</span>
              <span className="text-[11px] text-muted-foreground">{insight.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
