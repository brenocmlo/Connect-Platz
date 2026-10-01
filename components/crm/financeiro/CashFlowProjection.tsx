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
  { mes: "Hoje", saldo: 145000 },
  { mes: "+15 dias", saldo: 168000 },
  { mes: "+30 dias", saldo: 215000 },
  { mes: "+60 dias", saldo: 290000 },
  { mes: "+90 dias", saldo: 385000 },
];

export function CashFlowProjection() {
  return (
    <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl space-y-4">
      <div>
        <h3 className="text-base font-bold text-white">Projeção de Saldo de Caixa Futuro (90 Dias)</h3>
        <p className="text-xs text-slate-400">
          Projeção calculada com base nas parcelas vincendas de construtoras e despesas fixas da imobiliária.
        </p>
      </div>

      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projectionData}>
            <defs>
              <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D9BB4C" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D9BB4C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0D131F",
                borderColor: "#1F2937",
                borderRadius: "0.75rem",
                fontSize: "12px",
              }}
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
