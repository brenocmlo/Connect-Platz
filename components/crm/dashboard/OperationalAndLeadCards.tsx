"use client";

import React from "react";
import { FileCheck, CalendarCheck, UserCheck, UserPlus, Target } from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { StatCard } from "@/components/crm/primitives/StatCard";

export function OperationalAndLeadCards() {
  return (
    <div className="space-y-4">
      {/* 1. SEÇÃO OPERACIONAL (3 CARDS) (5.3) */}
      <div>
        <SectionTitle className="mb-3">Operacional</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Análise de Docs */}
          <StatCard
            label="Análise de Docs"
            value={28}
            suffix=" processos"
            trendValue={12}
            isPositiveTrend={true}
            icon={FileCheck}
            iconColor="text-connect-blue bg-connect-blue/10"
            legend="24 aprovadas • 4 em análise"
          />

          {/* Card 2: Visitas com sub-métricas Agendadas | Realizadas */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Alta Aderência
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground block mb-0.5">
                Visitas aos Imóveis
              </span>
              <div className="text-xl font-extrabold text-foreground tracking-tight">
                32 Visitas
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                Agendadas: <strong className="text-foreground">18</strong>
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">
                Realizadas: <strong className="text-emerald-500">14</strong>
              </span>
            </div>
          </div>

          {/* Card 3: Corretores Ativos */}
          <StatCard
            label="Corretores Ativos"
            value={14}
            suffix=" corretores"
            icon={UserCheck}
            iconColor="text-[#D9BB4C] bg-[#D9BB4C]/10"
            legend="Ativos na Roleta Round-Robin"
          />
        </div>
      </div>

      {/* 2. SEÇÃO PERFORMANCE DE LEADS (2 CARDS) (5.3) */}
      <div>
        <SectionTitle className="mb-3">Performance de Leads</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card 1: Leads Captados ("Leads do dia: 8") */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue border border-connect-blue/20">
                ↗ +18.4%
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground block mb-0.5">
                Leads Captados
              </span>
              <div className="text-xl font-extrabold text-foreground tracking-tight">
                186 Leads
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
              Leads do dia: <strong className="text-connect-blue font-bold">8 novos contatos</strong>
            </div>
          </div>

          {/* Card 2: Taxa de Conversão */}
          <StatCard
            label="Taxa de Conversão"
            value={6.45}
            suffix="%"
            decimals={2}
            trendValue={1.2}
            isPositiveTrend={true}
            icon={Target}
            iconColor="text-emerald-500 bg-emerald-500/10"
            legend="Meta do mês: 5.5% (superada)"
          />
        </div>
      </div>
    </div>
  );
}
