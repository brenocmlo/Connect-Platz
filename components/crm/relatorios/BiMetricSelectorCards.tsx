"use client";

import React from "react";
import {
  DollarSign,
  Clock,
  TrendingUp,
  Zap,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from "lucide-react";
import { BiMetricSummary, BiMetricType } from "./types";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { useCrm } from "@/components/crm/CrmContext";

interface BiMetricSelectorCardsProps {
  metrics: BiMetricSummary[];
  activeMetric: BiMetricType;
  onSelectMetric: (metric: BiMetricType) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  DollarSign,
  Clock,
  TrendingUp,
  Zap,
  PieChart,
};

export function BiMetricSelectorCards({
  metrics,
  activeMetric,
  onSelectMetric,
}: BiMetricSelectorCardsProps) {
  const { hideValues } = useCrm();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Selecione o Indicador para Visualização Detalhada
        </span>
        <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
          Clique em um card para alterar o gráfico principal
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {metrics.map((metric) => {
          const isActive = activeMetric === metric.id;
          const Icon = ICON_MAP[metric.iconName] || TrendingUp;
          const isMonetary = metric.prefix === "R$ ";

          return (
            <button
              key={metric.id}
              type="button"
              onClick={() => onSelectMetric(metric.id)}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-200 outline-none group ${
                isActive
                  ? "bg-card border-connect-blue ring-2 ring-connect-blue/20 shadow-md shadow-connect-blue/10 -translate-y-0.5"
                  : "bg-card border-border hover:border-connect-blue/40 hover:bg-muted/30 hover:-translate-y-0.5"
              }`}
            >
              {/* Badge de Selecionado */}
              {isActive && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-connect-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs animate-in fade-in zoom-in-95 duration-200">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Ativo</span>
                </div>
              )}

              {/* Cabeçalho do Card: Ícone e Delta */}
              <div className="flex items-center justify-between mb-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-connect-blue text-white shadow-xs"
                      : "bg-connect-blue/10 text-connect-blue group-hover:bg-connect-blue/20"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!isActive && metric.changePercent !== null && (
                  <div
                    className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      metric.changePositive
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10"
                        : "text-red-700 dark:text-red-400 bg-red-500/10"
                    }`}
                  >
                    {metric.changePercent >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>
                      {Math.abs(metric.changePercent).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
                      {metric.changeSuffix ?? "%"}
                    </span>
                  </div>
                )}
              </div>

              {/* Título do Card */}
              <div className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground truncate mb-1">
                {metric.shortLabel}
              </div>

              {/* Valor Numérico Grande com CountUp */}
              <div className="text-xl font-bold text-foreground tracking-tight">
                {metric.value === null ? (
                  <span className="text-muted-foreground" title="Sem base de cálculo no período">—</span>
                ) : isMonetary && hideValues ? (
                  <span className="text-muted-foreground font-mono">••••••</span>
                ) : (
                  <CountUpNumber
                    value={metric.value}
                    prefix={metric.prefix || ""}
                    suffix={metric.suffix || ""}
                    decimals={metric.decimals || 0}
                  />
                )}
              </div>

              {/* Subtítulo / Legenda */}
              <p className="text-[11px] text-muted-foreground truncate mt-1">
                {metric.sublabel}
              </p>

              {/* Barra inferior colorida no estado ativo */}
              {isActive && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-connect-blue to-platz-gold rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
