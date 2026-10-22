"use client";

import React from "react";
import { FileCheck, CalendarCheck, UserCheck, UserPlus, Target } from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { StatCard } from "@/components/crm/primitives/StatCard";
import { TrendBadge } from "@/components/crm/primitives/TrendBadge";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import type { DashboardData } from "./types";

interface OperationalAndLeadCardsProps {
  operational: DashboardData["operational"];
}

const orUndefined = (v: number | null) => (v === null ? undefined : v);

/** Operacional (3 cards) + Performance de Leads (2 cards) — 5.3 item 4. */
export function OperationalAndLeadCards({ operational }: OperationalAndLeadCardsProps) {
  const { docs, visits, brokers, leads, conversion } = operational;

  return (
    <div className="space-y-4">
      <div>
        <SectionTitle className="mb-3">Operacional</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <StatCard
            label="Análise de Docs"
            value={docs.total}
            suffix={docs.total === 1 ? " processo" : " processos"}
            icon={FileCheck}
            iconColor="text-connect-blue bg-connect-blue/10"
            legend={`${docs.aprovadas} aprovadas • ${docs.emAnalise} em análise`}
          />

          {/* Visitas com sub-métricas Agendadas | Realizadas */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              {visits.trend !== null && <TrendBadge value={visits.trend} />}
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground block mb-0.5">
                Visitas aos Imóveis
              </span>
              <div className="text-xl font-extrabold text-foreground tracking-tight">
                <CountUpNumber value={visits.total} suffix={visits.total === 1 ? " visita" : " visitas"} />
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                Agendadas: <strong className="text-foreground">{visits.agendadas}</strong>
              </span>
              <span className="text-muted-foreground" aria-hidden="true">|</span>
              <span className="text-muted-foreground">
                Realizadas: <strong className="text-emerald-600 dark:text-emerald-400">{visits.realizadas}</strong>
              </span>
            </div>
          </div>

          <StatCard
            label="Corretores Ativos"
            value={brokers.disponiveis}
            suffix={brokers.disponiveis === 1 ? " disponível" : " disponíveis"}
            icon={UserCheck}
            iconColor="text-platz-gold bg-platz-gold/10"
            legend={`de ${brokers.ativos} corretores ativos na roleta`}
          />
        </div>
      </div>

      <div>
        <SectionTitle className="mb-3">Performance de Leads</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Leads Captados ("Leads do dia: N") */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              {leads.trend !== null && <TrendBadge value={leads.trend} />}
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground block mb-0.5">
                Leads Captados
              </span>
              <div className="text-xl font-extrabold text-foreground tracking-tight">
                <CountUpNumber value={leads.captados} suffix={leads.captados === 1 ? " lead" : " leads"} />
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
              Leads do dia: <strong className="text-connect-blue font-bold">{leads.hoje}</strong>
            </div>
          </div>

          <StatCard
            label="Taxa de Conversão"
            value={conversion.rate}
            suffix="%"
            decimals={1}
            trendValue={orUndefined(conversion.trendPoints)}
            trendSuffix=" p.p."
            icon={Target}
            iconColor="text-emerald-500 bg-emerald-500/10"
            legend="Vendas ÷ leads captados no período"
          />
        </div>
      </div>
    </div>
  );
}
