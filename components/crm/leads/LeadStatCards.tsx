"use client";

import React from "react";
import { Users, UserCheck, CheckCircle2, TrendingUp, Sparkles, ShieldAlert } from "lucide-react";
import { StatCard } from "@/components/crm/primitives";

interface LeadStatCardsProps {
  totalLeads: number;
  activeLeads: number;
  salesCount: number;
  conversionRate: number;
  newLeadsCount: number;
  bolsaoCount: number;
  isLoading?: boolean;
}

export function LeadStatCards({
  totalLeads,
  activeLeads,
  salesCount,
  conversionRate,
  newLeadsCount,
  bolsaoCount,
  isLoading = false,
}: LeadStatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[104px] rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  // 5.4 Faixa de 6 StatCards compactos (valores reais; sem tendência fixa): Total de Leads · Leads Ativos · Vendas · Taxa de Conversão · Novos Leads · No Bolsão
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard
        label="TOTAL DE LEADS"
        value={totalLeads}
        icon={Users}
        legend="Base cadastrada"
      />

      <StatCard
        label="LEADS ATIVOS"
        value={activeLeads}
        icon={UserCheck}
        legend="Em atendimento"
      />

      <StatCard
        label="VENDAS"
        value={salesCount}
        icon={CheckCircle2}
        legend="Fechamentos"
      />

      <StatCard
        label="TAXA DE CONVERSÃO"
        value={Number(conversionRate.toFixed(1))}
        suffix="%"
        decimals={1}
        icon={TrendingUp}
        legend="Leads em etapa de ganho"
      />

      <StatCard
        label="NOVOS LEADS"
        value={newLeadsCount}
        icon={Sparkles}
        legend="Últimos 7 dias"
      />

      <StatCard
        label="NO BOLSÃO"
        value={bolsaoCount}
        icon={ShieldAlert}
        legend="Aguardando corretor"
        iconColor={bolsaoCount > 0 ? "text-amber-500 bg-amber-500/10" : undefined}
      />
    </div>
  );
}
