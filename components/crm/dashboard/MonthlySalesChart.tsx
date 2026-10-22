"use client";

import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useReducedMotion } from "framer-motion";
import { LineChart as LineChartIcon } from "lucide-react";
import { SegmentedToggle, ToggleOption } from "@/components/crm/primitives/SegmentedToggle";
import { EmptyState } from "@/components/crm/primitives/EmptyState";
import { useCrm, PeriodFilter } from "@/components/crm/CrmContext";
import type { DashboardData } from "./types";
import { formatBRL, formatCompactBRL } from "./format";

type SalesGranularity = "anual" | "mensal" | "semanal";

const granularityOptions: ToggleOption<SalesGranularity>[] = [
  { value: "anual", label: "Anual" },
  { value: "mensal", label: "Mensal" },
  { value: "semanal", label: "Semanal" },
];

const GRANULARITY_SUBTITLE: Record<SalesGranularity, string> = {
  anual: "VGV por mês no ano corrente",
  mensal: "VGV por semana do mês corrente",
  semanal: "VGV por dia nos últimos 7 dias",
};

/** Granularidade sugerida conforme o filtro global de período. */
export function granularityForPeriod(period: PeriodFilter): SalesGranularity {
  if (period === "hoje" || period === "7d") return "semanal";
  if (period === "mes" || period === "30d") return "mensal";
  return "anual";
}

interface MonthlySalesChartProps {
  series: DashboardData["salesSeries"];
}

/** Vendas Mensais (5.3 item 5) — linha com pontos e área em gradiente translúcido. */
export function MonthlySalesChart({ series }: MonthlySalesChartProps) {
  const { hideValues, selectedPeriod } = useCrm();
  const reduceMotion = useReducedMotion();
  const [granularity, setGranularity] = useState<SalesGranularity>(granularityForPeriod(selectedPeriod));

  // Acompanha o filtro global: ao trocar o período, a granularidade sugerida é aplicada
  useEffect(() => {
    setGranularity(granularityForPeriod(selectedPeriod));
  }, [selectedPeriod]);

  const data = series[granularity] || [];
  const totalVgv = data.reduce((acc, p) => acc + p.vgv, 0);
  const totalSales = data.reduce((acc, p) => acc + p.vendas, 0);
  const isEmpty = totalSales === 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-foreground">Vendas Mensais (VGV)</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue border border-connect-blue/20">
              {hideValues ? "••••" : `Total: ${formatCompactBRL(totalVgv)}`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{GRANULARITY_SUBTITLE[granularity]}</p>
        </div>

        <SegmentedToggle
          options={granularityOptions}
          value={granularity}
          onChange={setGranularity}
          variant="primary"
          size="sm"
        />
      </div>

      <div className="h-64 w-full">
        {isEmpty ? (
          <EmptyState
            icon={LineChartIcon}
            title="Nenhuma venda nesta janela"
            description="Assim que vendas forem registradas, a evolução do VGV aparecerá aqui."
            className="h-full"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesVgvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1266C7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#1266C7" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="currentColor"
                className="text-muted-foreground"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="currentColor"
                className="text-muted-foreground"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(v) => (hideValues ? "•••" : formatCompactBRL(Number(v)))}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const point = payload[0].payload as { vgv: number; vendas: number };
                  return (
                    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs space-y-1">
                      <p className="font-bold text-foreground">{label}</p>
                      <p className="text-connect-blue font-extrabold">
                        VGV: {hideValues ? "••••••••" : formatBRL(point.vgv)}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {point.vendas} {point.vendas === 1 ? "venda" : "vendas"}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="vgv"
                stroke="#1266C7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#salesVgvGradient)"
                dot={{ r: 4, fill: "#1266C7", stroke: "hsl(var(--card))", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#D9BB4C", stroke: "hsl(var(--card))", strokeWidth: 2 }}
                isAnimationActive={!reduceMotion}
                animationDuration={600}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
