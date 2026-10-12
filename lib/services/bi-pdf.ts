import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BI_METRIC_SUMMARIES,
  CAMPAIGN_ROI_DATA,
  FUNNEL_EFFICIENCY_DATA,
} from "@/components/crm/relatorios/biData";

export function generateBiExecutivePdf(periodLabel: string = "Mês Atual (Outubro 2026)") {
  const doc = new jsPDF();

  // 1. CABEÇALHO TIMBRADO OFICIAL CONNECT PLATZ
  doc.setFillColor(10, 14, 23); // #0A0E17
  doc.rect(0, 0, 210, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CONNECT PLATZ IMOBILIÁRIA", 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(217, 187, 76); // #D9BB4C (Platz Gold)
  doc.text("RELATÓRIO EXECUTIVO DE INTELIGÊNCIA COMERCIAL & BI", 14, 26);

  doc.setFontSize(8.5);
  doc.setTextColor(180, 190, 205);
  const now = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Período de Análise: ${periodLabel}`, 14, 34);
  doc.text(`Emitido em: ${now} | Governança Oficial`, 130, 34);

  // 2. SUMÁRIO DE INDICADORES PRINCIPAIS (KPIs)
  doc.setTextColor(18, 102, 199); // #1266C7 (Connect Blue)
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("1. Resumo Consolidado de Desempenho", 14, 52);

  const kpiRows = BI_METRIC_SUMMARIES.map((m) => [
    m.title,
    m.category,
    m.prefix === "R$ "
      ? m.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : `${m.value}${m.suffix || ""}`,
    `${m.changePercent >= 0 ? "+" : ""}${m.changePercent}%`,
    m.sublabel,
  ]);

  autoTable(doc, {
    startY: 56,
    theme: "striped",
    headStyles: { fillColor: [18, 102, 199], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    head: [["Indicador", "Categoria", "Valor Realizado", "Variação", "Observação"]],
    body: kpiRows,
  });

  // 3. AUDITORIA DE CANAIS & ROI DE MÍDIA
  const nextY = (doc as any).lastAutoTable.finalY + 10;
  doc.setTextColor(18, 102, 199);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("2. Desempenho por Canal de Aquisição & ROI", 14, nextY);

  const channelRows = CAMPAIGN_ROI_DATA.map((c) => [
    c.canal,
    `${c.leads} contatos`,
    c.investimento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    `R$ ${c.cpl.toFixed(2)}`,
    c.vgv.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    `${c.taxaConversao}%`,
    c.roi,
  ]);

  autoTable(doc, {
    startY: nextY + 4,
    theme: "grid",
    headStyles: { fillColor: [217, 187, 76], textColor: [10, 14, 23], fontStyle: "bold", fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    head: [["Canal", "Leads", "Custo Total", "CPL", "VGV Comercial", "Conversão", "ROI"]],
    body: channelRows,
  });

  // 4. VELOCIDADE DE FUNIL & EFICIÊNCIA DE SLA
  const funnelY = (doc as any).lastAutoTable.finalY + 10;
  doc.setTextColor(18, 102, 199);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("3. Eficiência Operacional & Análise de Gargalos de Funil", 14, funnelY);

  const funnelRows = FUNNEL_EFFICIENCY_DATA.map((s, idx) => [
    `0${idx + 1} - ${s.etapa}`,
    `${s.tempoHoras} horas`,
    `${s.slaHoras} horas`,
    s.status === "critico" ? "GARGALO (Excede SLA)" : s.status === "alerta" ? "ATENÇÃO" : "DENTRO DO SLA",
    `${s.taxaPassagem}%`,
  ]);

  autoTable(doc, {
    startY: funnelY + 4,
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    head: [["Etapa do Pipeline", "Permanência Média", "SLA Alvo", "Diagnóstico Operacional", "Taxa de Avanço"]],
    body: funnelRows,
  });

  // 5. INSIGHTS E RECOMENDAÇÕES EXECUTIVAS
  const insightsY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, insightsY, 182, 30, 3, 3, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DIAGNÓSTICO E RECOMENDAÇÕES DA DIRETORIA COMERCIAL:", 18, insightsY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);
  const recomendacao =
    "• Canal Destaque: Meta Ads lidera a geração de VGV (41.9%), com excelente CPL de R$ 75,00. Manter investimento.\n" +
    "• Ponto Crítico de SLA: A etapa de Análise de Crédito excede o prazo limite em +18h por pendências de documentação bancária. Ação recomendada: instituir pré-validação documental obrigatória antes da emissão da minuta contratual.\n" +
    "• Governança: Todos os contatos inativos foram exportados e mantidos sob política estrita de conformidade com a LGPD.";
  doc.text(recomendacao, 18, insightsY + 14);

  // 6. ASSINATURA & VALIDAÇÃO
  const signY = insightsY + 40;
  doc.setDrawColor(180, 180, 180);
  doc.line(14, signY + 12, 95, signY + 12);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Robson Carvalho — Diretor Comercial", 14, signY + 17);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Connect Platz CRM Imobiliário", 14, signY + 21);

  doc.line(105, signY + 12, 196, signY + 12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Controladoria & Auditoria de Dados", 105, signY + 17);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Certificação de Integridade Determinística", 105, signY + 21);

  // DOWNLOAD DO ARQUIVO
  const filename = `Relatorio_Executivo_BI_Connect_Platz_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
