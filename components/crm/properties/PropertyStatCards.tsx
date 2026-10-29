"use client";

import React from "react";
import { Building2, CheckCircle2, Briefcase, DollarSign } from "lucide-react";
import { StatCard } from "@/components/crm/primitives/StatCard";

interface PropertyStatCardsProps {
  totalEmpreendimentos: number;
  totalAtivos: number;
  totalConstrutoras: number;
  totalVgv: number;
  isAluguel?: boolean;
}

export function PropertyStatCards({
  totalEmpreendimentos,
  totalAtivos,
  totalConstrutoras,
  totalVgv,
  isAluguel,
}: PropertyStatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total de Empreendimentos */}
      <StatCard
        label="TOTAL DE EMPREENDIMENTOS"
        value={totalEmpreendimentos}
        icon={Building2}
        iconColor="text-connect-blue bg-connect-blue/10"
        legend="Cadastrados no catálogo"
      />

      {/* 2. Empreendimentos Ativos */}
      <StatCard
        label="EMPREENDIMENTOS ATIVOS"
        value={totalAtivos}
        icon={CheckCircle2}
        iconColor="text-emerald-500 bg-emerald-500/10"
        legend="Publicados na vitrine pública"
      />

      {/* 3. Construtoras Cadastradas */}
      <StatCard
        label="CONSTRUTORAS PARCEIRAS"
        value={totalConstrutoras}
        icon={Briefcase}
        iconColor="text-amber-500 bg-amber-500/10"
        legend="Construtoras distintas no catálogo"
      />

      {/* 4. VGV Total ou Diárias */}
      <StatCard
        label={isAluguel ? "DIÁRIAS DO CATÁLOGO" : "VGV TOTAL DO CATÁLOGO"}
        value={totalVgv}
        isCurrency={true}
        prefix="R$ "
        icon={DollarSign}
        iconColor="text-connect-blue bg-connect-blue/10"
        legend={
          isAluguel
            ? "Soma das diárias de temporada cadastradas"
            : "Soma dos valores de venda cadastrados"
        }
      />
    </div>
  );
}
