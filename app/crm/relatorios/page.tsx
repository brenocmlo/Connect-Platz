"use client";

import React, { useState } from "react";
import { AlertTriangle, Download, FileText, RefreshCw } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { generateBiExecutivePdf } from "@/lib/services/bi-pdf";
import type { BiMetricType, BiGranularityType } from "@/components/crm/relatorios/types";
import { useBiReport } from "@/components/crm/relatorios/useBiReport";
import { exportBiReportXlsx, exportLgpdXlsx } from "@/components/crm/relatorios/biExport";
import { DashboardSkeleton } from "@/components/crm/dashboard/DashboardSkeleton";
import { BiMetricSelectorCards } from "@/components/crm/relatorios/BiMetricSelectorCards";
import { BiHeroChartCanvas } from "@/components/crm/relatorios/BiHeroChartCanvas";
import { BiChannelDistributionCard } from "@/components/crm/relatorios/BiChannelDistributionCard";
import { BiFunnelVelocityCard } from "@/components/crm/relatorios/BiFunnelVelocityCard";
import { BiRoiTableCard } from "@/components/crm/relatorios/BiRoiTableCard";
import { BiLgpdGovernanceCard } from "@/components/crm/relatorios/BiLgpdGovernanceCard";

const headerButton =
  "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 disabled:pointer-events-none";

export default function RelatoriosBiPage() {
  const { selectedPeriod, setActionMessage, user } = useCrm();
  const { data, loading, error, reload } = useBiReport(selectedPeriod);
  const [activeMetric, setActiveMetric] = useState<BiMetricType>("vgv");
  const [granularity, setGranularity] = useState<BiGranularityType>("mensal");

  const notify = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleExportFullReport = () => {
    if (!data) return;
    exportBiReportXlsx(data);
    notify("Relatório consolidado exportado com sucesso (.xlsx)!");
  };

  const handleExportLgpd = () => {
    if (!data || data.closedLeads.length === 0) return;
    exportLgpdXlsx(data.closedLeads);
    notify("Exportação de leads encerrados (LGPD) concluída.");
  };

  const handleExportPdf = () => {
    if (!data) return;
    generateBiExecutivePdf(data, user?.nome);
    notify("Relatório Executivo (.pdf) gerado e baixado com sucesso!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. CABEÇALHO GLOBAL DA PÁGINA (Seção 5.2) */}
      <PageHeader
        title="Relatórios BI & Métricas Executivas"
        subtitle={
          data?.scope === "corretor"
            ? "Seus indicadores de vendas, conversão, funil e origem dos seus leads."
            : "Inteligência de vendas, eficiência operacional de funil, velocidade de SLA e ROI por canal de captação."
        }
        showPeriodSelector={true}
        showExportButton={Boolean(data)}
        onExportClick={data ? handleExportFullReport : undefined}
      >
        <button onClick={handleExportPdf} disabled={!data} className={headerButton}>
          <FileText className="w-3.5 h-3.5 text-connect-blue" />
          <span>PDF Executivo</span>
        </button>

        <button
          onClick={handleExportLgpd}
          disabled={!data || data.closedLeads.length === 0}
          className={headerButton}
        >
          <Download className="w-3.5 h-3.5 text-platz-gold" />
          <span>Exportar LGPD</span>
        </button>
      </PageHeader>

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
          className={`space-y-6 transition-opacity duration-300 ${loading ? "opacity-70" : "opacity-100"}`}
          aria-busy={loading}
        >
          {/* 2. SELETORES INTERATIVOS DE MÉTRICA */}
          <BiMetricSelectorCards
            metrics={data.summaries}
            activeMetric={activeMetric}
            onSelectMetric={(metric) => setActiveMetric(metric)}
          />

          {/* 3. CANVAS PRINCIPAL DO GRÁFICO DINÂMICO (atualiza conforme a métrica selecionada) */}
          <BiHeroChartCanvas
            data={data}
            activeMetric={activeMetric}
            granularity={granularity}
            onGranularityChange={setGranularity}
          />

          {/* 4. DISTRIBUIÇÃO POR CANAL & VELOCIDADE DE FUNIL */}
          <div className="space-y-3">
            <SectionTitle>Eficiência Operacional & Origem de Tráfego</SectionTitle>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              <BiChannelDistributionCard channels={data.channels} />
              <BiFunnelVelocityCard funil={data.funnelVelocity.funil} stages={data.funnelVelocity.stages} />
            </div>
          </div>

          {/* 5. TABELA ANALÍTICA DE ROI & PERFORMANCE */}
          <div className="space-y-3">
            <SectionTitle>Auditoria Comercial de Canais</SectionTitle>
            <BiRoiTableCard
              channels={data.channels}
              campaigns={data.campaigns}
              investmentAvailable={data.investmentAvailable}
            />
          </div>

          {/* 6. GOVERNANÇA LGPD & REMARKETING */}
          <div className="space-y-3">
            <SectionTitle>Governança de Dados & Remarketing LGPD</SectionTitle>
            <BiLgpdGovernanceCard leads={data.closedLeads} />
          </div>
        </div>
      )}
    </div>
  );
}
