"use client";

import React, { useMemo } from "react";
import { LineChart as LineChartIcon } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useCrm } from "@/components/crm/CrmContext";
import type { CashFlowItem } from "./CashFlowTable";
import { computeProjection } from "./cashFlowMetrics";

interface CashFlowProjectionProps {
  /** Lançamentos reais do Fluxo de Caixa (pagos e pendentes). */
  entries: CashFlowItem[];
}

export function CashFlowProjection({ entries }: CashFlowProjectionProps) {
  const { hideValues } = useCrm();
  const projectionData = useMemo(() => computeProjection(entries), [entries]);
  const money = (v: unknown) =>
    hideValues ? "••••••" : `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-foreground">Projeção de Fluxo de Caixa (90 Dias)</h3>
          <p className="text-xs text-muted-foreground">
            Saldo liquidado atual somado aos títulos pendentes (a receber e a pagar) por data de vencimento.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Receitas Previstas
          </span>
          <span className="flex items-center gap-1.5 text-red-500">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Despesas Previstas
          </span>
          <span className="flex items-center gap-1.5 text-platz-gold">
            <span className="w-2.5 h-2.5 rounded-full bg-platz-gold" />
            Saldo em Caixa
          </span>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
          <div className="p-3 rounded-full bg-connect-blue/10 text-connect-blue">
            <LineChartIcon className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-foreground">Sem lançamentos para projetar</span>
          <span className="text-xs">A projeção é calculada a partir das contas a pagar e a receber cadastradas.</span>
        </div>
      ) : (
      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projectionData}>
            <defs>
              <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D9BB4C" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D9BB4C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" stroke="#94A3B8" fontSize={11} />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickFormatter={(v) => (hideValues ? "•••" : `R$ ${(v / 1000).toFixed(0)}k`)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs space-y-1">
                      <span className="font-bold text-muted-foreground block border-b border-border/50 pb-1">{label}</span>
                      <div className="flex items-center justify-between gap-3 text-emerald-500 font-semibold">
                        <span>Receitas:</span>
                        <span>{money(payload.find((p) => p.dataKey === "receitas")?.value)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-red-500 font-semibold">
                        <span>Despesas:</span>
                        <span>{money(payload.find((p) => p.dataKey === "despesas")?.value)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-amber-500 dark:text-[#F8DA56] font-extrabold pt-1 border-t border-border/50">
                        <span>Saldo Líquido:</span>
                        <span>{money(payload.find((p) => p.dataKey === "saldo")?.value)}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="receitas"
              name="Receitas"
              stroke="#22C55E"
              strokeWidth={2}
              fill="url(#colorReceitas)"
            />
            <Area
              type="monotone"
              dataKey="despesas"
              name="Despesas"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#colorDespesas)"
            />
            <Area
              type="monotone"
              dataKey="saldo"
              name="Saldo Projetado (R$)"
              stroke="#D9BB4C"
              strokeWidth={2.5}
              fill="url(#colorSaldo)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
