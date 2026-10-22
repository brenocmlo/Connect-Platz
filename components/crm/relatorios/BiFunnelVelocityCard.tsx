"use client";

import React from "react";
import { Clock, AlertTriangle, CheckCircle2, Filter } from "lucide-react";
import { EmptyState } from "@/components/crm/primitives/EmptyState";
import type { BiFunnelStageMetric } from "./types";

interface BiFunnelVelocityCardProps {
  funil: string | null;
  stages: BiFunnelStageMetric[];
}

/** Velocidade do funil (dados reais de /api/relatorios): tempo médio na etapa x SLA e taxa de passagem. */
export function BiFunnelVelocityCard({ funil, stages }: BiFunnelVelocityCardProps) {
  const totalHorasCiclo = stages.reduce((acc, stage) => acc + stage.tempoHoras, 0);
  // Pior gargalo = etapa com maior excesso sobre o SLA configurado
  const bottleneck = stages
    .filter((s) => s.status === "critico" && s.slaHoras)
    .sort((a, b) => b.tempoHoras - (b.slaHoras || 0) - (a.tempoHoras - (a.slaHoras || 0)))[0];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Velocidade de Funil & Gargalos de SLA
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {funil ? `${funil} • tempo médio de permanência e taxa de avanço` : "Tempo médio de permanência e taxa de avanço"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl border border-border text-xs self-start sm:self-auto shrink-0">
          <span className="text-muted-foreground text-[11px]">Ciclo Total:</span>
          <strong className="text-foreground font-mono text-xs">
            {totalHorasCiclo.toFixed(1)}h (~{(totalHorasCiclo / 24).toFixed(1)} dias)
          </strong>
        </div>
      </div>

      {stages.length === 0 && (
        <EmptyState
          icon={Filter}
          title="Nenhum funil com leads no período"
          description="Cadastre etapas e capte leads para medir o tempo de permanência por etapa."
          className="flex-1"
        />
      )}

      {/* Grid 3x2: 3 colunas x 2 linhas para garantir leitura total sem truncamento */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1">
        {stages.map((stage, idx) => {
          const isBottleneck = stage.status === "critico";
          const isWarning = stage.status === "alerta";

          return (
            <div
              key={stage.etapa}
              className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                isBottleneck
                  ? "bg-red-500/5 border-red-500/40 shadow-xs"
                  : isWarning
                  ? "bg-amber-500/5 border-amber-500/40"
                  : "bg-muted/30 border-border/70"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.cor }} />
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  {isBottleneck ? (
                    <span className="flex items-center gap-1 text-[9px] font-extrabold text-red-500 uppercase bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20 animate-pulse">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Gargalo
                    </span>
                  ) : isWarning ? (
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                      Atenção
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                      Ideal
                    </span>
                  )}
                </div>

                {/* Nome completo da etapa — sem truncate */}
                <div className="font-bold text-foreground text-xs leading-tight">
                  {stage.etapa}
                </div>

                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="text-sm font-extrabold text-foreground font-mono">
                    {stage.tempoHoras}h
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {stage.slaHoras ? `/ SLA ${stage.slaHoras}h` : "/ sem SLA"}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {stage.leadsAbertos} {stage.leadsAbertos === 1 ? "lead aberto" : "leads abertos"}
                </div>
              </div>

              <div className="mt-2.5 pt-1.5 border-t border-border/50">
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full ${
                      isBottleneck ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-connect-blue"
                    }`}
                    style={{ width: `${Math.min(100, stage.taxaPassagem ?? 0)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Passagem</span>
                  <span className="font-semibold text-foreground font-mono">
                    {stage.taxaPassagem === null ? "—" : `${stage.taxaPassagem}%`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnóstico calculado (sem texto fixo) */}
      {bottleneck ? (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <div className="leading-tight">
            <strong>Gargalo Operacional:</strong> a etapa <strong>{bottleneck.etapa}</strong> excede o SLA em +
            {(bottleneck.tempoHoras - (bottleneck.slaHoras || 0)).toFixed(1)}h (média dos leads abertos).
          </div>
        </div>
      ) : stages.length > 0 ? (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <div className="leading-tight">Nenhuma etapa acima do SLA configurado.</div>
        </div>
      ) : null}
    </div>
  );
}
