// lib/services/bi-pdf.ts
// PDF executivo dos Relatórios BI gerado a partir dos dados reais de GET /api/relatorios.
// Sem números fixos: diagnóstico e destaques são calculados deterministicamente dos próprios dados.

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { BiMetricSummary, BiReportData } from "@/components/crm/relatorios/types";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (v: number, decimals = 1) => v.toLocaleString("pt-BR", { maximumFractionDigits: decimals });

function formatMetricValue(m: BiMetricSummary): string {
  if (m.value === null) return "—";
  if (m.prefix === "R$ ") return brl(m.value);
  return `${m.prefix || ""}${num(m.value, m.decimals ?? 1)}${m.suffix || ""}`;
}

function formatChange(m: BiMetricSummary): string {
  if (m.changePercent === null) return "—";
  const sign = m.changePercent > 0 ? "+" : m.changePercent < 0 ? "-" : "";
  return `${sign}${num(Math.abs(m.changePercent))}${m.changeSuffix ?? "%"}`;
}

/** Diagnóstico textual calculado a partir do próprio relatório. */
function buildInsights(data: BiReportData): string[] {
  const insights: string[] = [];
  const leader = [...data.channels].filter((c) => c.vgv > 0).sort((a, b) => b.vgv - a.vgv)[0];
  const totalVgv = data.channels.reduce((acc, c) => acc + c.vgv, 0);
  if (leader && totalVgv > 0) {
    insights.push(
      `• Canal destaque: ${leader.canal} responde por ${num((leader.vgv / totalVgv) * 100)}% do VGV do período` +
        (leader.roiMultiplicador !== null ? ` (ROI ${num(leader.roiMultiplicador)}x).` : ".")
    );
  } else {
    insights.push("• Nenhuma venda registrada no período para atribuição por canal.");
  }

  const critical = data.funnelVelocity.stages
    .filter((s) => s.status === "critico" && s.slaHoras)
    .sort((a, b) => b.tempoHoras - (b.slaHoras || 0) - (a.tempoHoras - (a.slaHoras || 0)))[0];
  insights.push(
    critical
      ? `• Gargalo de SLA: a etapa "${critical.etapa}" excede o SLA em +${num(critical.tempoHoras - (critical.slaHoras || 0))}h (média dos leads abertos).`
      : "• Nenhuma etapa do funil acima do SLA configurado."
  );

  insights.push(`• Leads encerrados disponíveis para reativação/descarte (LGPD): ${data.closedLeads.length}.`);
  return insights;
}

function sectionTitle(doc: jsPDF, text: string, y: number) {
  doc.setTextColor(18, 102, 199); // #1266C7 (Connect Blue)
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(text, 14, y);
}

const lastY = (doc: jsPDF) => (doc as any).lastAutoTable.finalY as number;

export function generateBiExecutivePdf(data: BiReportData, emittedBy?: string) {
  const doc = new jsPDF();

  // 1. CABEÇALHO
  doc.setFillColor(8, 12, 20); // #080C14
  doc.rect(0, 0, 210, 42, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CONNECT PLATZ", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(217, 187, 76); // #D9BB4C (Platz Gold)
  doc.text("RELATÓRIO EXECUTIVO DE INTELIGÊNCIA COMERCIAL & BI", 14, 26);
  doc.setFontSize(8.5);
  doc.setTextColor(180, 190, 205);
  const now = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const scopeLabel = data.scope === "corretor" ? "Carteira individual" : "Organização";
  doc.text(`Período: ${data.period.label} | Escopo: ${scopeLabel}`, 14, 34);
  doc.text(`Emitido em: ${now}`, 150, 34);

  // 2. KPIs
  sectionTitle(doc, "1. Resumo Consolidado de Desempenho", 52);
  autoTable(doc, {
    startY: 56,
    theme: "striped",
    headStyles: { fillColor: [18, 102, 199], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    head: [["Indicador", "Categoria", "Valor Realizado", "Variação", "Observação"]],
    body: data.summaries.map((m) => [m.title, m.category, formatMetricValue(m), formatChange(m), m.sublabel]),
  });

  // 3. CANAIS
  const channelY = lastY(doc) + 10;
  sectionTitle(doc, "2. Desempenho por Canal de Aquisição", channelY);
  const withInvestment = data.investmentAvailable;
  autoTable(doc, {
    startY: channelY + 4,
    theme: "grid",
    headStyles: { fillColor: [217, 187, 76], textColor: [8, 12, 20], fontStyle: "bold", fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    head: [
      withInvestment
        ? ["Canal", "Leads", "Vendas", "Custo Total", "CPL", "VGV", "Conversão", "ROI"]
        : ["Canal", "Leads", "Vendas", "VGV", "Ticket Médio", "Conversão"],
    ],
    body: data.channels.length
      ? data.channels.map((c) =>
          withInvestment
            ? [
                c.canal,
                String(c.leads),
                String(c.vendas),
                c.investimento === null ? "—" : brl(c.investimento),
                c.cpl === null ? "—" : brl(c.cpl),
                brl(c.vgv),
                `${num(c.taxaConversao)}%`,
                c.roiMultiplicador === null ? "—" : `${num(c.roiMultiplicador)}x`,
              ]
            : [c.canal, String(c.leads), String(c.vendas), brl(c.vgv), brl(c.ticketMedio), `${num(c.taxaConversao)}%`]
        )
      : [[{ content: "Sem leads ou vendas no período.", colSpan: withInvestment ? 8 : 6 }]],
  });

  // 4. FUNIL
  const funnelY = lastY(doc) + 10;
  sectionTitle(
    doc,
    `3. Velocidade do Funil${data.funnelVelocity.funil ? ` — ${data.funnelVelocity.funil}` : ""}`,
    funnelY
  );
  autoTable(doc, {
    startY: funnelY + 4,
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    head: [["Etapa", "Leads Abertos", "Permanência Média", "SLA", "Diagnóstico", "Passagem"]],
    body: data.funnelVelocity.stages.length
      ? data.funnelVelocity.stages.map((s, idx) => [
          `${String(idx + 1).padStart(2, "0")} - ${s.etapa}`,
          String(s.leadsAbertos),
          `${num(s.tempoHoras)} h`,
          s.slaHoras ? `${num(s.slaHoras)} h` : "—",
          s.status === "critico" ? "Excede o SLA" : s.status === "alerta" ? "Atenção" : "Dentro do SLA",
          s.taxaPassagem === null ? "—" : `${num(s.taxaPassagem)}%`,
        ])
      : [[{ content: "Nenhum funil com leads no período.", colSpan: 6 }]],
  });

  // 5. DIAGNÓSTICO CALCULADO
  let insightsY = lastY(doc) + 10;
  if (insightsY > 250) {
    doc.addPage();
    insightsY = 20;
  }
  const lines = doc.splitTextToSize(buildInsights(data).join("\n"), 172) as string[];
  const boxHeight = 14 + lines.length * 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, insightsY, 182, boxHeight, 3, 3, "FD");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DIAGNÓSTICO DO PERÍODO", 18, insightsY + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);
  doc.text(lines, 18, insightsY + 14);

  // 6. RODAPÉ DE EMISSÃO
  const footY = insightsY + boxHeight + 10;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${emittedBy ? `Emitido por: ${emittedBy} • ` : ""}Connect Platz CRM — dados extraídos do sistema em ${now}`,
    14,
    Math.min(footY, 287)
  );

  doc.save(`Relatorio_Executivo_BI_Connect_Platz_${new Date().toISOString().slice(0, 10)}.pdf`);
}
