"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Share2, ArrowUpRight } from "lucide-react";
import { EmptyState } from "@/components/crm/primitives/EmptyState";
import { useCrm } from "@/components/crm/CrmContext";
import { formatCompactBRL } from "@/components/crm/dashboard/format";
import type { BiChannelRoiMetric } from "./types";

const pct = (part: number, total: number) => (total > 0 ? ((part / total) * 100).toFixed(1) : "0.0");

/** Distribuição de leads/VGV por origem (dados reais de /api/relatorios). */
export function BiChannelDistributionCard({ channels }: { channels: BiChannelRoiMetric[] }) {
  const { hideValues } = useCrm();
  const [metricMode, setMetricMode] = useState<"vgv" | "leads">("vgv");

  const totalVgv = channels.reduce((acc, c) => acc + c.vgv, 0);
  const totalLeads = channels.reduce((acc, c) => acc + c.leads, 0);
  const totalActive = metricMode === "vgv" ? totalVgv : totalLeads;

  const pieData = channels
    .map((c) => ({
      name: c.canal,
      fullName: c.canal,
      value: metricMode === "vgv" ? c.vgv : c.leads,
      percent: metricMode === "vgv" ? pct(c.vgv, totalVgv) : pct(c.leads, totalLeads),
      color: c.cor,
      vgv: c.vgv,
      leads: c.leads,
      roi: c.roiMultiplicador,
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
  const leader = pieData[0];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-connect-blue/10 flex items-center justify-center text-connect-blue shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Distribuição por Canal</h3>
            <p className="text-[11px] text-muted-foreground">Origem das captações e conversões</p>
          </div>
        </div>

        {/* Toggle VGV vs Leads */}
        <div className="flex items-center bg-muted/70 p-1 rounded-xl border border-border text-xs self-start sm:self-auto shrink-0">
          <button
            onClick={() => setMetricMode("vgv")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              metricMode === "vgv"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Por VGV
          </button>
          <button
            onClick={() => setMetricMode("leads")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              metricMode === "leads"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Por Leads
          </button>
        </div>
      </div>

      {totalActive === 0 && (
        <EmptyState
          icon={Share2}
          title={metricMode === "vgv" ? "Sem vendas no período" : "Sem leads captados no período"}
          description="A distribuição por origem aparece assim que houver captações ou vendas registradas."
          className="flex-1"
        />
      )}

      {/* Grid: Gráfico de Rosca à esquerda, lista de canais à direita */}
      {totalActive > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1">
        <div className="md:col-span-5 h-48 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-xl p-2.5 shadow-xl text-xs space-y-1">
                        <div className="font-bold text-foreground">{d.fullName}</div>
                        <div className="text-muted-foreground text-[11px]">
                          Participação: <strong className="text-foreground">{d.percent}%</strong>
                        </div>
                        <div className="text-connect-blue dark:text-blue-300 font-extrabold text-[11px]">
                          {metricMode === "vgv"
                            ? hideValues
                              ? "••••••"
                              : d.vgv.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                            : `${d.leads} leads`}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Rótulo Central no Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Total {metricMode === "vgv" ? "VGV" : "Leads"}
            </span>
            <span className="text-xs font-extrabold text-foreground">
              {metricMode === "vgv"
                ? hideValues
                  ? "••••"
                  : formatCompactBRL(totalVgv)
                : `${totalLeads} contatos`}
            </span>
          </div>
        </div>

        {/* Lista de Canais sem corte de texto */}
        <div className="md:col-span-7 space-y-2.5">
          {pieData.map((channel) => (
            <div key={channel.name} className="space-y-1 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: channel.color }}
                  />
                  <span className="font-semibold text-foreground text-xs whitespace-nowrap">
                    {channel.fullName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
                  <span className="font-bold text-foreground">
                    {metricMode === "vgv"
                      ? hideValues
                        ? "••••"
                        : formatCompactBRL(channel.vgv)
                      : `${channel.leads} un`}
                  </span>
                  <span className="text-muted-foreground text-[11px]">({channel.percent}%)</span>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${channel.percent}%`,
                    backgroundColor: channel.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Resumo Rodapé: Canal Líder (calculado) */}
      {leader && (
        <div className="p-2.5 rounded-xl bg-connect-blue/10 border border-connect-blue/20 flex items-center justify-between gap-2 text-xs text-connect-blue dark:text-blue-300">
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Canal Líder:</strong> {leader.fullName} responde por <strong>{leader.percent}%</strong>{" "}
              {metricMode === "vgv" ? "do VGV do período." : "dos leads do período."}
            </span>
          </div>
          {leader.roi !== null && (
            <span className="font-bold font-mono text-[11px] hidden sm:inline-block">
              ROI {leader.roi.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}x
            </span>
          )}
        </div>
      )}
    </div>
  );
}
