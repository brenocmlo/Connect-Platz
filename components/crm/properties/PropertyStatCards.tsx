"use client";

import React from "react";
import { Building2, CheckCircle2, Briefcase, DollarSign } from "lucide-react";
import { StatCard } from "@/components/crm/primitives/StatCard";

interface PropertyStatCardsProps {
  totalEmpreendimentos: number;
  totalAtivos: number;
  totalConstrutoras: number;
  totalVgv: number;
}

export function PropertyStatCards({
  totalEmpreendimentos,
  totalAtivos,
  totalConstrutoras,
  totalVgv,
}: PropertyStatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total de Empreendimentos */}
      <StatCard
        label="TOTAL DE EMPREENDIMENTOS"
        value={totalEmpreendimentos}
        icon={Building2}
        iconColor="text-connect-blue bg-connect-blue/10"
        trendValue="+12%"
        isPositiveTrend={true}
        legend="Cadastrados no catálogo"
      />

      {/* 2. Empreendimentos Ativos */}
      <StatCard
        label="EMPREENDIMENTOS ATIVOS"
        value={totalAtivos}
        icon={CheckCircle2}
        iconColor="text-emerald-500 bg-emerald-500/10"
        trendValue="100%"
        isPositiveTrend={true}
        legend="Disponíveis para comercialização"
      />

      {/* 3. Construtoras Cadastradas */}
      <StatCard
        label="CONSTRUTORAS PARCEIRAS"
        value={totalConstrutoras}
        icon={Briefcase}
        iconColor="text-amber-500 bg-amber-500/10"
        trendValue="+4"
        isPositiveTrend={true}
        legend="Parcerias e incorporações"
      />

      {/* 4. VGV Total */}
      <StatCard
        label="VGV TOTAL DO CATÁLOGO"
        value={totalVgv}
        isCurrency={true}
        prefix="R$ "
        icon={DollarSign}
        iconColor="text-connect-blue bg-connect-blue/10"
        trendValue="+15%"
        isPositiveTrend={true}
        legend="Volume geral em carteira"
        sparklineData={[30, 45, 60, 50, 75, 90, 110]}
      />
    </div>
  );
}
