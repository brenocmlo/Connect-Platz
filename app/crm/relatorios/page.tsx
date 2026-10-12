"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Download, FileText } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { generateBiExecutivePdf } from "@/lib/services/bi-pdf";
import { BiMetricType, BiGranularityType } from "@/components/crm/relatorios/types";
import {
  BI_METRIC_SUMMARIES,
  CAMPAIGN_ROI_DATA,
  CLOSED_LEADS_FOR_REMARKETING,
} from "@/components/crm/relatorios/biData";
import { BiMetricSelectorCards } from "@/components/crm/relatorios/BiMetricSelectorCards";
import { BiHeroChartCanvas } from "@/components/crm/relatorios/BiHeroChartCanvas";
import { BiChannelDistributionCard } from "@/components/crm/relatorios/BiChannelDistributionCard";
import { BiFunnelVelocityCard } from "@/components/crm/relatorios/BiFunnelVelocityCard";
import { BiRoiTableCard } from "@/components/crm/relatorios/BiRoiTableCard";
import { BiLgpdGovernanceCard } from "@/components/crm/relatorios/BiLgpdGovernanceCard";

export default function RelatoriosBiPage() {
  const { setActionMessage } = useCrm();
  const [activeMetric, setActiveMetric] = useState<BiMetricType>("vgv");
  const [granularity, setGranularity] = useState<BiGranularityType>("mensal");

  // Exportação geral consolidada
  const handleExportFullReport = () => {
    const workbook = XLSX.utils.book_new();

    // Aba 1: Resumo Métricas
    const metricsSheet = XLSX.utils.json_to_sheet(
      BI_METRIC_SUMMARIES.map((m) => ({
        Indicador: m.title,
        Categoria: m.category,
        Valor: m.value,
        "Variação (%)": `${m.changePercent}%`,
        Status: m.sublabel,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, metricsSheet, "Métricas Principais");

    // Aba 2: ROI Canais
    const roiSheet = XLSX.utils.json_to_sheet(
      CAMPAIGN_ROI_DATA.map((c) => ({
        Canal: c.canal,
        Leads: c.leads,
        Investimento: c.investimento,
        VGV: c.vgv,
        ROI: c.roi,
        "Taxa Conversão": `${c.taxaConversao}%`,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, roiSheet, "ROI de Canais");

    // Aba 3: LGPD
    const lgpdSheet = XLSX.utils.json_to_sheet(CLOSED_LEADS_FOR_REMARKETING);
    XLSX.utils.book_append_sheet(workbook, lgpdSheet, "Descarte LGPD");

    XLSX.writeFile(workbook, "Relatorio_BI_Consolidado_Connect_Platz.xlsx");
    setActionMessage("Relatório consolidado exportado com sucesso (.xlsx)!");
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleExportLgpd = () => {
    const worksheet = XLSX.utils.json_to_sheet(CLOSED_LEADS_FOR_REMARKETING);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads Encerrados LGPD");
    XLSX.writeFile(workbook, "Leads_Encerrados_Remarketing_LGPD.xlsx");
    setActionMessage("Exportação de contatos encerrados concluída com conformidade LGPD.");
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleExportPdf = () => {
    generateBiExecutivePdf();
    setActionMessage("Relatório Executivo (.pdf) gerado e baixado com sucesso!");
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. CABEÇALHO GLOBAL DA PÁGINA (Seção 5.2) */}
      <PageHeader
        title="Relatórios BI & Métricas Executivas"
        subtitle="Inteligência de vendas, eficiência operacional de funil, velocidade de SLA e ROI por canal de captação."
        showPeriodSelector={true}
        showExportButton={true}
        onExportClick={handleExportFullReport}
      >
        <button
          onClick={handleExportPdf}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors shadow-xs"
        >
          <FileText className="w-3.5 h-3.5 text-connect-blue" />
          <span>PDF Executivo</span>
        </button>

        <button
          onClick={handleExportLgpd}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-platz-gold" />
          <span>Exportar LGPD</span>
        </button>
      </PageHeader>

      {/* 2. SELETORES INTERATIVOS DE MÉTRICA (Inspirado no modelo Behance Finance Management) */}
      <BiMetricSelectorCards
        metrics={BI_METRIC_SUMMARIES}
        activeMetric={activeMetric}
        onSelectMetric={(metric) => setActiveMetric(metric)}
      />

      {/* 3. CANVAS PRINCIPAL DO GRÁFICO DINÂMICO (Atualiza conforme a métrica selecionada) */}
      <BiHeroChartCanvas
        activeMetric={activeMetric}
        granularity={granularity}
        onGranularityChange={setGranularity}
      />

      {/* 4. SEÇÃO COMPLEMENTAR: DISTRIBUIÇÃO POR CANAL & VELOCIDADE DE FUNIL */}
      <div className="space-y-3">
        <SectionTitle>Eficiência Operacional & Origem de Tráfego</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          <BiChannelDistributionCard />
          <BiFunnelVelocityCard />
        </div>
      </div>

      {/* 5. TABELA ANALÍTICA DE ROI & PERFORMANCE */}
      <div className="space-y-3">
        <SectionTitle>Auditoria Comercial de Canais</SectionTitle>
        <BiRoiTableCard />
      </div>

      {/* 6. GOVERNANÇA LGPD & REMARKETING */}
      <div className="space-y-3">
        <SectionTitle>Governança de Dados & Remarketing LGPD</SectionTitle>
        <BiLgpdGovernanceCard />
      </div>
    </div>
  );
}
