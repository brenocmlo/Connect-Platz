"use client";

import React from "react";
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { HeroMetricCard } from "@/components/crm/primitives/HeroMetricCard";
import { CashFlowSummaryCard } from "@/components/crm/dashboard/CashFlowSummaryCard";
import { FinancialStatCards } from "@/components/crm/dashboard/FinancialStatCards";
import { OperationalAndLeadCards } from "@/components/crm/dashboard/OperationalAndLeadCards";
import { MonthlySalesChart } from "@/components/crm/dashboard/MonthlySalesChart";
import { SalesFunnelBarChart } from "@/components/crm/dashboard/SalesFunnelBarChart";
import { HotLeadsRankedList } from "@/components/crm/dashboard/HotLeadsRankedList";
import { UpcomingAppointmentsTimeline } from "@/components/crm/dashboard/UpcomingAppointmentsTimeline";
import { TeamPerformanceAndActivity } from "@/components/crm/dashboard/TeamPerformanceAndActivity";

export default function CrmDashboardPage() {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        // Fallback gracioso com valores padrão já nos componentes
      }
    }
    loadDashboard();
  }, []);

  const vgv = data?.financial?.vgvTotal || 35396000;
  const cashFlow = data?.financial?.cashFlow || { balance: 1480000, inflow: 2150000, outflow: 670000 };
  const financial = data?.financial || {};
  const operational = data?.operational || {};

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-12">
      {/* 1. CABEÇALHO PADRÃO SEÇÃO 5.2 */}
      <PageHeader
        title="Dashboard"
        subtitle="Visão executiva de VGV, vendas, fluxo de caixa e aderência aos SLAs"
        actionLabel="Novo Lead"
        actionHref="/crm/leads"
        showPeriodSelector={true}
        showExportButton={true}
      />

      {/* 2. RESUMO FINANCEIRO (5.3 itens 1, 2 e 3) */}
      <div className="space-y-4">
        <SectionTitle>Resumo Financeiro</SectionTitle>

        {/* Hero VGV Total (50%) + Card Fluxo de Caixa (50%) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HeroMetricCard
            label="VGV TOTAL"
            value={vgv}
            subtitle="Soma das vendas fechadas no período"
            trendText="+100%"
            sparklineData={[15, 22, 18, 30, 42, 36, 52, 48, 65]}
          />
          <CashFlowSummaryCard
            balance={cashFlow.balance}
            inflow={cashFlow.inflow}
            outflow={cashFlow.outflow}
          />
        </div>

        {/* Linha de 5 StatCards */}
        <FinancialStatCards
          totalSales={financial.totalSales}
          commissionReceived={financial.commissionReceived}
          averageTicket={financial.averageTicket}
          commissionPaid={financial.commissionPaid}
          commissionPending={financial.commissionPending}
        />
      </div>

      {/* 3. OPERACIONAL & PERFORMANCE DE LEADS (5.3 item 4) */}
      <OperationalAndLeadCards
        activeBrokers={operational.activeBrokers}
        leadsToday={operational.leadsToday}
        totalLeads={operational.totalLeads}
        conversionRate={operational.conversionRate}
      />

      {/* 4. VENDAS MENSAIS & FUNIL DE VENDAS (5.3 itens 5 e 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MonthlySalesChart />
        <SalesFunnelBarChart />
      </div>

      {/* 5. LEADS QUENTES & COMPROMISSOS (5.3 itens 7 e 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HotLeadsRankedList />
        <UpcomingAppointmentsTimeline />
      </div>

      {/* 6. PERFORMANCE DA EQUIPE & ATIVIDADES RECENTES (5.3 item 9) */}
      <TeamPerformanceAndActivity />
    </div>
  );
}

