"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { BiMetricType, BiGranularityType, BiChartVisualType, BiReportData } from "./types";
import { formatCompactBRL } from "@/components/crm/dashboard/format";

interface BiChartRendererProps {
  data: BiReportData;
  activeMetric: BiMetricType;
  granularity: BiGranularityType;
  visualType: BiChartVisualType;
  showComparison: boolean;
  hideValues: boolean;
}

export function BiChartTooltip({ active, payload, label, hideValues, isCurrency }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs space-y-1">
        <div className="font-bold text-foreground">{label}</div>
        {payload.map((item: any, idx: number) => {
          const val = isCurrency
            ? hideValues
              ? "••••••"
              : item.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            : `${item.value}${item.unit || ""}`;
          return (
            <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-muted-foreground">{item.name}:</span>
              <span className="font-bold" style={{ color: item.color || item.fill }}>
                {val}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}

const moneyTick = (hideValues: boolean) => (v: number) => (hideValues ? "•••" : formatCompactBRL(v));

/** Gráfico principal do BI a partir dos dados reais (sem séries de meta fictícias). */
export function renderMetricChart({
  data: report,
  activeMetric,
  granularity,
  visualType,
  showComparison,
  hideValues,
}: BiChartRendererProps) {
  switch (activeMetric) {
    case "vgv": {
      const data = report.vgvSeries[granularity] || report.vgvSeries.mensal;
      return visualType === "barras" ? (
        <BarChart data={data} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
          <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickFormatter={moneyTick(hideValues)}
          />
          <Tooltip content={<BiChartTooltip hideValues={hideValues} isCurrency={true} />} />
          <Bar dataKey="realizado" name="VGV Realizado" fill="#1266C7" radius={[6, 6, 0, 0]} />
          {showComparison && (
            <Bar dataKey="anterior" name="Período Anterior" fill="#64748B" opacity={0.4} radius={[6, 6, 0, 0]} />
          )}
        </BarChart>
      ) : (
        <AreaChart data={data} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="vgvGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1266C7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#1266C7" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
          <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickFormatter={moneyTick(hideValues)}
          />
          <Tooltip content={<BiChartTooltip hideValues={hideValues} isCurrency={true} />} />
          <Area
            type="monotone"
            dataKey="realizado"
            name="VGV Realizado"
            stroke="#1266C7"
            strokeWidth={2.5}
            fill="url(#vgvGrad)"
          />
          {showComparison && (
            <Line
              type="monotone"
              dataKey="anterior"
              name="Período Anterior"
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          )}
        </AreaChart>
      );
    }

    case "funil": {
      return (
        <ComposedChart data={report.funnelVelocity.stages} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
          <XAxis dataKey="etapa" stroke="#94A3B8" fontSize={11} />
          <YAxis stroke="#94A3B8" fontSize={11} unit="h" />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs space-y-1">
                    <div className="font-bold text-foreground">{label}</div>
                    <div className="text-connect-blue dark:text-blue-400 font-extrabold">
                      Tempo Médio: {d.tempoHoras} horas
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      SLA Alvo: {d.slaHoras ? `${d.slaHoras}h` : "não configurado"} • {d.leadsAbertos} abertos
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="tempoHoras" name="Horas na Etapa" radius={[6, 6, 0, 0]} fill="#1266C7" />
          <Line type="monotone" dataKey="slaHoras" name="SLA Limite" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" connectNulls />
        </ComposedChart>
      );
    }

    case "roi": {
      return (
        <BarChart data={report.channels.filter((c) => c.vgv > 0 || c.leads > 0)} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
          <XAxis dataKey="canal" stroke="#94A3B8" fontSize={10} tickFormatter={(v: string) => v.split(" ")[0]} />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickFormatter={moneyTick(hideValues)}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs space-y-1">
                    <div className="font-bold text-foreground">{d.canal}</div>
                    <div className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                      VGV: {hideValues ? "••••••" : d.vgv.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      {d.leads} leads • {d.vendas} vendas
                    </div>
                    {d.roiMultiplicador !== null && (
                      <div className="text-connect-blue dark:text-blue-300 font-bold">
                        ROI: {d.roiMultiplicador.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}x
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="vgv" name="VGV Gerado" fill="#1266C7" radius={[6, 6, 0, 0]} />
        </BarChart>
      );
    }

    case "conversao": {
      return (
        <AreaChart data={report.conversionSeries} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
          <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} />
          <YAxis stroke="#94A3B8" fontSize={11} unit="%" />
          <Tooltip content={<BiChartTooltip hideValues={hideValues} isCurrency={false} />} />
          <Area type="monotone" dataKey="realizado" name="Taxa de Conversão" unit="%" stroke="#22C55E" strokeWidth={2.5} fill="url(#convGrad)" />
          {showComparison && (
            <Line type="monotone" dataKey="anterior" name="Ano Anterior" unit="%" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          )}
        </AreaChart>
      );
    }

    case "comissoes": {
      return (
        <BarChart data={report.commissionSeries} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
          <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickFormatter={moneyTick(hideValues)}
          />
          <Tooltip content={<BiChartTooltip hideValues={hideValues} isCurrency={true} />} />
          <Bar
            dataKey="realizado"
            name={report.scope === "corretor" ? "Minhas Comissões" : "Comissão Bruta"}
            fill="#1266C7"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="auxiliar"
            name={report.scope === "corretor" ? "Comissões Pagas" : "Repasses Pagos"}
            fill="#D9BB4C"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      );
    }
  }
}
