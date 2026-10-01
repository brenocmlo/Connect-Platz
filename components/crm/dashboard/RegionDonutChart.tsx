"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const regionDistributionData = [
  { name: "Meireles & Beira-Mar", value: 42, color: "#1266C7" },
  { name: "Aldeota & Cocó", value: 28, color: "#0D478F" },
  { name: "Porto das Dunas (Veraneio)", value: 20, color: "#D9BB4C" },
  { name: "Eusébio / Alphaville", value: 10, color: "#8B5CF6" },
];

export function RegionDonutChart() {
  return (
    <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-white tracking-tight">Vendas por Região & Bairro</h3>
        <p className="text-xs text-slate-400 mb-4">Concentração geográfica do faturamento</p>
      </div>

      <div className="h-48 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={regionDistributionData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={5}
              dataKey="value"
            >
              {regionDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0D131F",
                borderColor: "#1F2937",
                borderRadius: "0.75rem",
                fontSize: "11px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1.5 mt-2">
        {regionDistributionData.map((r) => (
          <div key={r.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
              {r.name}
            </span>
            <span className="font-bold text-white">{r.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
