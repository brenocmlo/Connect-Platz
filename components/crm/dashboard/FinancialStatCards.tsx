"use client";

import React from "react";
import {
  Building2,
  BadgePercent,
  Calculator,
  CheckCircle,
  Clock,
} from "lucide-react";
import { StatCard } from "@/components/crm/primitives/StatCard";

interface FinancialStatCardsProps {
  totalSales?: number;
  commissionReceived?: number;
  averageTicket?: number;
  commissionPaid?: number;
  commissionPending?: number;
}

export function FinancialStatCards({
  totalSales = 82,
  commissionReceived = 248500,
  averageTicket = 704166,
  commissionPaid = 186000,
  commissionPending = 62500,
}: FinancialStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Total de Vendas (com mini-sparkline) */}
      <StatCard
        label="Total de Vendas"
        value={totalSales}
        suffix=" vendas"
        trendValue={14}
        isPositiveTrend={true}
        icon={Building2}
        iconColor="text-connect-blue bg-connect-blue/10"
        legend="82 unidades no período"
        sparklineData={[8, 12, 10, 16, 22, 18, 25]}
      />

      {/* 2. Comissão Recebida */}
      <StatCard
        label="Comissão Recebida"
        value={commissionReceived}
        isCurrency={true}
        trendValue={22.4}
        isPositiveTrend={true}
        icon={BadgePercent}
        iconColor="text-emerald-500 bg-emerald-500/10"
        legend="Total creditado na conta"
      />

      {/* 3. Ticket Médio VGV */}
      <StatCard
        label="Ticket Médio VGV"
        value={averageTicket}
        isCurrency={true}
        trendValue={5.8}
        isPositiveTrend={true}
        icon={Calculator}
        iconColor="text-[#D9BB4C] bg-[#D9BB4C]/10"
        legend="Média por imóvel vendido"
      />

      {/* 4. Comissões Pagas */}
      <StatCard
        label="Comissões Pagas"
        value={commissionPaid}
        isCurrency={true}
        trendValue={18}
        isPositiveTrend={true}
        icon={CheckCircle}
        iconColor="text-sky-500 bg-sky-500/10"
        legend="Repasses a corretores e gerentes"
      />

      {/* 5. Comissões Pendentes */}
      <StatCard
        label="Comissões Pendentes"
        value={commissionPending}
        isCurrency={true}
        trendValue={-8.5}
        isPositiveTrend={false}
        icon={Clock}
        iconColor="text-amber-500 bg-amber-500/10"
        legend="Aguardando liberação de repasse"
      />
    </div>
  );
}
