"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { SegmentedToggle, ToggleOption } from "@/components/crm/primitives/SegmentedToggle";
import { useCrm } from "@/components/crm/CrmContext";

type SalesPeriod = "anual" | "mensal" | "semanal";

const salesPeriodOptions: ToggleOption<SalesPeriod>[] = [
  { value: "anual", label: "Anual" },
  { value: "mensal", label: "Mensal" },
  { value: "semanal", label: "Semanal" },
];

const annualData = [
  { label: "Jan", vendas: 4200000, unidades: 6 },
  { label: "Fev", vendas: 5100000, unidades: 7 },
  { label: "Mar", vendas: 4800000, unidades: 6 },
  { label: "Abr", vendas: 6200000, unidades: 9 },
  { label: "Mai", vendas: 5900000, unidades: 8 },
  { label: "Jun", vendas: 7400000, unidades: 11 },
  { label: "Jul", vendas: 6800000, unidades: 10 },
  { label: "Ago", vendas: 7900000, unidades: 12 },
  { label: "Set", vendas: 8450000, unidades: 12 },
  { label: "Out", vendas: 8900000, unidades: 13 },
  { label: "Nov", vendas: 9200000, unidades: 14 },
  { label: "Dez", vendas: 10500000, unidades: 16 },
];

const monthlyData = [
  { label: "Sem 1", vendas: 1850000, unidades: 3 },
  { label: "Sem 2", vendas: 2400000, unidades: 4 },
  { label: "Sem 3", vendas: 1980000, unidades: 3 },
  { label: "Sem 4", vendas: 2220000, unidades: 2 },
];

const weeklyData = [
  { label: "Seg", vendas: 450000, unidades: 1 },
  { label: "Ter", vendas: 680000, unidades: 1 },
  { label: "Qua", vendas: 0, unidades: 0 },
  { label: "Qui", vendas: 920000, unidades: 1 },
  { label: "Sex", vendas: 1100000, unidades: 2 },
  { label: "Sáb", vendas: 540000, unidades: 1 },
  { label: "Dom", vendas: 0, unidades: 0 },
];

export function MonthlySalesChart() {
  const [period, setPeriod] = useState<SalesPeriod>("anual");
  const { hideValues } = useCrm();

  const currentData =
    period === "anual" ? annualData : period === "mensal" ? monthlyData : weeklyData;

  const totalVgv = currentData.reduce((acc, curr) => acc + curr.vendas, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      {/* 1. CABEÇALHO DO GRÁFICO COM TOGGLE SEGMENTADO (5.3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Vendas Mensais (VGV)</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue border border-connect-blue/20">
              {hideValues ? "••••" : `Total: R$ ${(totalVgv / 1000000).toFixed(1)}M`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Evolução do faturamento comercial no período selecionado
          </p>
        </div>

        {/* Toggle segmentado Anual | Mensal | Semanal com pílula ativa primária (5.3) */}
        <SegmentedToggle
          options={salesPeriodOptions}
          value={period}
          onChange={setPeriod}
          variant="primary"
          size="sm"
        />
      </div>

      {/* 2. GRÁFICO RECHARTS DE LINHA COM PONTOS (5.3) */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesVgvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1266C7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1266C7" stopOpacity={0} />
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
              tickFormatter={(v) => (hideValues ? "•••" : `R$ ${(v / 1000000).toFixed(0)}M`)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs space-y-1">
                      <p className="font-bold text-foreground">{label}</p>
                      <p className="text-connect-blue font-extrabold">
                        VGV: {hideValues ? "••••••••" : `R$ ${(data.vendas).toLocaleString("pt-BR")}`}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        Unidades: {data.unidades}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="vendas"
              stroke="#1266C7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#salesVgvGradient)"
              dot={{ r: 4, fill: "#1266C7", stroke: "#FFFFFF", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#D9BB4C", stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
