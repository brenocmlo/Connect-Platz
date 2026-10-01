"use client";

import React from "react";
import { Clock } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { ExecutiveKpiCards } from "@/components/crm/dashboard/ExecutiveKpiCards";
import { LeadEvolutionChart } from "@/components/crm/dashboard/LeadEvolutionChart";
import { RegionDonutChart } from "@/components/crm/dashboard/RegionDonutChart";
import { HotLeadsPanel } from "@/components/crm/dashboard/HotLeadsPanel";
import { TopPropertiesPanel } from "@/components/crm/dashboard/TopPropertiesPanel";

export default function CrmDashboardPage() {
  const { user, selectedPeriod } = useCrm();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. CABEÇALHO BOAS-VINDAS & SLA BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0C1322] via-[#0E1729] to-[#0A0F1A] border border-[#1C2537] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-connect-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#D9BB4C] bg-[#D9BB4C]/10 border border-[#D9BB4C]/25 px-2.5 py-0.5 rounded-full">
              Visão Executiva • {selectedPeriod.toUpperCase()}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Atualizado em tempo real</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Olá, <span className="text-connect-blue">{user?.nome?.split(" ")[0] || "Gestor"}</span>! 👋
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Acompanhe o desempenho de VGV, captação de leads, reservas de veraneio e cumprimento rigoroso dos SLAs da equipe comercial.
          </p>
        </div>

        {/* Card Rápido de Aderência ao SLA */}
        <div className="relative z-10 flex items-center gap-3 bg-[#111827]/90 border border-[#1F2937] rounded-xl p-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-emerald-400">96.8%</span>
              <span className="text-[10px] text-emerald-500 font-bold bg-emerald-950 px-1 rounded">+2.4%</span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Aderência aos SLAs</p>
          </div>
        </div>
      </div>

      {/* 2. STATCARDS COM COUNT-UP NUMÉRICO */}
      <ExecutiveKpiCards />

      {/* 3. GRÁFICOS NO PADRÃO HABITUS CRM (EVOLUÇÃO + ROSCA DE REGIÕES) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LeadEvolutionChart />
        <RegionDonutChart />
      </div>

      {/* 4. PAINEL DE LEADS QUENTES (🔥) & EMPREENDIMENTOS DE MAIOR SAÍDA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HotLeadsPanel />
        <TopPropertiesPanel />
      </div>
    </div>
  );
}
