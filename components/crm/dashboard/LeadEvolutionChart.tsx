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

const leadEvolutionData = [
  { data: "01/09", leads: 12, contatos: 10 },
  { data: "05/09", leads: 19, contatos: 16 },
  { data: "10/09", leads: 28, contatos: 24 },
  { data: "15/09", leads: 35, contatos: 31 },
  { data: "20/09", leads: 42, contatos: 38 },
  { data: "25/09", leads: 58, contatos: 52 },
  { data: "30/09", leads: 74, contatos: 68 },
];

export function LeadEvolutionChart() {
  return (
    <div className="lg:col-span-2 bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Evolução da Captação de Leads (Meta Ads & Portal)
          </h3>
          <p className="text-xs text-slate-400">Comparativo entre volume de leads captados vs. primeiros contatos</p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-connect-blue/15 text-blue-400 border border-connect-blue/30">
          Setembro / 2026
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={leadEvolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1266C7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#1266C7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorContatos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D9BB4C" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D9BB4C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="data" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0D131F",
                borderColor: "#1F2937",
                borderRadius: "0.75rem",
                color: "#F8FAFC",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="leads"
              name="Leads Captados"
              stroke="#1266C7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorLeads)"
            />
            <Area
              type="monotone"
              dataKey="contatos"
              name="Primeiros Contatos"
              stroke="#D9BB4C"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorContatos)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
