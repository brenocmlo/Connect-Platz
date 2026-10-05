"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const projectionData = [
  { mes: "Hoje", saldo: 145000, receitas: 180000, despesas: 35000 },
  { mes: "+15 dias", saldo: 168000, receitas: 210000, despesas: 42000 },
  { mes: "+30 dias", saldo: 215000, receitas: 275000, despesas: 60000 },
  { mes: "+60 dias", saldo: 290000, receitas: 360000, despesas: 70000 },
  { mes: "+90 dias", saldo: 385000, receitas: 470000, despesas: 85000 },
];

export function CashFlowProjection() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-foreground">Projeção de Fluxo de Caixa (90 Dias)</h3>
          <p className="text-xs text-muted-foreground">
            Evolução de faturamento, comissões de terceiros e saldo operacional líquido projetado.
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
              tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs space-y-1">
                      <span className="font-bold text-muted-foreground block border-b border-border/50 pb-1">{label}</span>
                      <div className="flex items-center justify-between gap-3 text-emerald-500 font-semibold">
                        <span>Receitas:</span>
                        <span>R$ {Number(payload.find(p => p.dataKey === 'receitas')?.value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-red-500 font-semibold">
                        <span>Despesas:</span>
                        <span>R$ {Number(payload.find(p => p.dataKey === 'despesas')?.value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-amber-500 dark:text-[#F8DA56] font-extrabold pt-1 border-t border-border/50">
                        <span>Saldo Líquido:</span>
                        <span>R$ {Number(payload.find(p => p.dataKey === 'saldo')?.value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
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
    </div>
  );
}
