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
}

export function LeadStatCards({
  totalLeads,
  activeLeads,
  salesCount,
  conversionRate,
  newLeadsCount,
  bolsaoCount,
}: LeadStatCardsProps) {
  // 5.4 Faixa de 6 StatCards compactos: Total de Leads · Leads Ativos · Vendas · Taxa de Conversão · Novos Leads · No Bolsão
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard
        label="TOTAL DE LEADS"
        value={totalLeads}
        icon={Users}
        trendValue="+12.5"
        isPositiveTrend={true}
        legend="Base cadastrada"
      />

      <StatCard
        label="LEADS ATIVOS"
        value={activeLeads}
        icon={UserCheck}
        trendValue="+8.2"
        isPositiveTrend={true}
        legend="Em atendimento"
      />

      <StatCard
        label="VENDAS"
        value={salesCount}
        icon={CheckCircle2}
        trendValue="+15"
        isPositiveTrend={true}
        legend="Fechamentos"
      />

      <StatCard
        label="TAXA DE CONVERSÃO"
        value={Number(conversionRate.toFixed(1))}
        suffix="%"
        decimals={1}
        icon={TrendingUp}
        trendValue="+2.1"
        isPositiveTrend={true}
        legend="Média da equipe"
      />

      <StatCard
        label="NOVOS LEADS"
        value={newLeadsCount}
        icon={Sparkles}
        trendValue="+24"
        isPositiveTrend={true}
        legend="Últimos 7 dias"
      />

      <StatCard
        label="NO BOLSÃO"
        value={bolsaoCount}
        icon={ShieldAlert}
        trendValue={bolsaoCount > 5 ? "+10" : "-5"}
        isPositiveTrend={bolsaoCount <= 5}
        legend="Aguardando corretor"
        iconColor={bolsaoCount > 0 ? "text-amber-500 bg-amber-500/10" : undefined}
      />
    </div>
  );
}
