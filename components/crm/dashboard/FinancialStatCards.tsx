"use client";

import React from "react";
import { Building2, BadgePercent, Calculator, CheckCircle, Clock } from "lucide-react";
import { StatCard } from "@/components/crm/primitives/StatCard";
import type { DashboardData, DashboardScope } from "./types";

interface FinancialStatCardsProps {
  financial: DashboardData["financial"];
  scope: DashboardScope;
  /** Quantidade de vendas por janela do gráfico (mini-sparkline do 1º card) */
  salesSparkline?: number[];
}

const orUndefined = (v: number | null) => (v === null ? undefined : v);

/** Linha de StatCards financeiros (5.3 item 3). Corretor vê apenas as próprias comissões. */
export function FinancialStatCards({ financial, scope, salesSparkline }: FinancialStatCardsProps) {
  const isBroker = scope === "corretor";
  const { trends } = financial;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 ${isBroker ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}>
      <StatCard
        label="Total de Vendas"
        value={financial.totalSales}
        suffix={financial.totalSales === 1 ? " venda" : " vendas"}
        trendValue={orUndefined(trends.totalSales)}
        icon={Building2}
        iconColor="text-connect-blue bg-connect-blue/10"
        legend={isBroker ? "Vendas em que você é o titular" : "Vendas válidas no período"}
        sparklineData={salesSparkline && salesSparkline.some((v) => v > 0) ? salesSparkline : undefined}
      />

      <StatCard
        label="Comissão Recebida"
        value={financial.commissionReceived}
        isCurrency={true}
        trendValue={orUndefined(trends.commissionReceived)}
        icon={BadgePercent}
        iconColor="text-emerald-500 bg-emerald-500/10"
        legend={isBroker ? "Suas parcelas de comissão já pagas" : "Comissão bruta das vendas do período"}
      />

      <StatCard
        label="Ticket Médio VGV"
        value={financial.averageTicket}
        isCurrency={true}
        trendValue={orUndefined(trends.averageTicket)}
        icon={Calculator}
        iconColor="text-platz-gold bg-platz-gold/10"
        legend="Média por imóvel vendido"
      />

      {!isBroker && financial.commissionPaid !== null && (
        <StatCard
          label="Comissões Pagas"
          value={financial.commissionPaid}
          isCurrency={true}
          trendValue={orUndefined(trends.commissionPaid)}
          icon={CheckCircle}
          iconColor="text-sky-500 bg-sky-500/10"
          legend="Repasses a corretores e gerentes"
        />
      )}

      <StatCard
        label="Comissões Pendentes"
        value={financial.commissionPending}
        isCurrency={true}
        trendValue={orUndefined(trends.commissionPending)}
        icon={Clock}
        iconColor="text-amber-500 bg-amber-500/10"
        legend={isBroker ? "Suas parcelas aguardando pagamento" : "Aguardando liberação de repasse"}
      />
    </div>
  );
}
