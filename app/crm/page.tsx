"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { useCrm } from "@/components/crm/CrmContext";
import { useDashboardData } from "@/components/crm/dashboard/useDashboardData";
import { DashboardSkeleton } from "@/components/crm/dashboard/DashboardSkeleton";
import { exportDashboardXlsx } from "@/components/crm/dashboard/exportDashboard";
import { VgvHeroCard } from "@/components/crm/dashboard/VgvHeroCard";
import { CashFlowSummaryCard } from "@/components/crm/dashboard/CashFlowSummaryCard";
import { FinancialStatCards } from "@/components/crm/dashboard/FinancialStatCards";
import { OperationalAndLeadCards } from "@/components/crm/dashboard/OperationalAndLeadCards";
import { MonthlySalesChart, granularityForPeriod } from "@/components/crm/dashboard/MonthlySalesChart";
import { SalesFunnelBarChart } from "@/components/crm/dashboard/SalesFunnelBarChart";
import { HotLeadsRankedList } from "@/components/crm/dashboard/HotLeadsRankedList";
import { UpcomingAppointmentsTimeline } from "@/components/crm/dashboard/UpcomingAppointmentsTimeline";
import { TeamPerformanceAndActivity } from "@/components/crm/dashboard/TeamPerformanceAndActivity";

export default function CrmDashboardPage() {
  const { selectedPeriod, setActionMessage } = useCrm();
  const { data, loading, error, reload } = useDashboardData(selectedPeriod);

  const handleExport = () => {
    if (!data) return;
    exportDashboardXlsx(data);
    setActionMessage("Resumo da dashboard exportado (.xlsx).");
    setTimeout(() => setActionMessage(null), 4000);
  };

  const sparkSeries = data ? data.salesSeries[granularityForPeriod(selectedPeriod)] : [];

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Dashboard"
        subtitle={
          data?.scope === "corretor"
            ? "Seus resultados: vendas, comissões, leads e agenda"
            : "Visão executiva de VGV, vendas, fluxo de caixa e funil comercial"
        }
        actionLabel="Novo Lead"
        actionHref="/crm/leads"
        showPeriodSelector={true}
        showExportButton={Boolean(data)}
        onExportClick={data ? handleExport : undefined}
      />

      {error && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-700 dark:text-rose-300">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </span>
          <button
            onClick={reload}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
          </button>
        </div>
      )}

      {!data ? (
        loading ? <DashboardSkeleton /> : null
      ) : (
        <div
          className={`space-y-7 transition-opacity duration-300 ${loading ? "opacity-70" : "opacity-100"}`}
          aria-busy={loading}
        >
          {/* RESUMO FINANCEIRO (5.3 itens 1, 2 e 3) */}
          <div className="space-y-4">
            <SectionTitle>Resumo Financeiro</SectionTitle>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <VgvHeroCard
                value={data.financial.vgvTotal}
                subtitle={`Soma das vendas • ${data.period.label}`}
                trend={data.financial.trends.vgvTotal}
                sparklineData={sparkSeries.map((p) => p.vgv)}
                className={data.cashFlow ? "" : "lg:col-span-2"}
              />
              {data.cashFlow && (
                <CashFlowSummaryCard
                  balance={data.cashFlow.balance}
                  inflow={data.cashFlow.inflow}
                  outflow={data.cashFlow.outflow}
                  balanceTrend={data.cashFlow.balanceTrend}
                />
              )}
            </div>
            <FinancialStatCards
              financial={data.financial}
              scope={data.scope}
              salesSparkline={sparkSeries.map((p) => p.vendas)}
            />
          </div>

          {/* OPERACIONAL & PERFORMANCE DE LEADS (5.3 item 4) */}
          <OperationalAndLeadCards operational={data.operational} />

          {/* VENDAS & FUNIL (5.3 itens 5 e 6) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MonthlySalesChart series={data.salesSeries} />
            <SalesFunnelBarChart funnels={data.funnels} />
          </div>

          {/* LEADS QUENTES & COMPROMISSOS (5.3 itens 7 e 8) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HotLeadsRankedList leads={data.hotLeads} />
            <UpcomingAppointmentsTimeline appointments={data.appointments} />
          </div>

          {/* PERFORMANCE DA EQUIPE & ATIVIDADES (5.3 item 9) */}
          <TeamPerformanceAndActivity team={data.team} activities={data.activities} periodLabel={data.period.label} />
        </div>
      )}
    </div>
  );
}
