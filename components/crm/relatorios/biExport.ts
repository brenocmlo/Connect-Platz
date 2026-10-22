// components/crm/relatorios/biExport.ts
// Exportações XLSX dos Relatórios BI (dados reais de /api/relatorios).

import * as XLSX from "xlsx";
import type { BiLgpdClosedLead, BiReportData } from "./types";

function lgpdRows(leads: BiLgpdClosedLead[]) {
  return leads.map((l) => ({
    Nome: l.nome,
    Telefone: l.telefone,
    Email: l.email,
    Motivo: l.motivo,
    "Data Encerramento": l.dataEncerramento,
    Interesse: l.interesse,
    "Último Corretor": l.corretorUltimo,
    "Dias Inativo": l.diasInativo,
  }));
}

export function exportLgpdXlsx(leads: BiLgpdClosedLead[]) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(lgpdRows(leads)), "Leads Encerrados LGPD");
  XLSX.writeFile(workbook, "Leads_Encerrados_LGPD_Connect_Platz.xlsx");
}

/** Relatório consolidado: métricas, canais, campanhas, funil e leads encerrados. */
export function exportBiReportXlsx(data: BiReportData) {
  const workbook = XLSX.utils.book_new();
  const append = (rows: object[], name: string) =>
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows.length ? rows : [{ Info: "Sem dados no período" }]), name);

  append(
    data.summaries.map((m) => ({
      Indicador: m.title,
      Categoria: m.category,
      Valor: m.value ?? "",
      Unidade: m.prefix === "R$ " ? "R$" : (m.suffix || "").trim(),
      Variação: m.changePercent ?? "",
      "Unidade Variação": m.changePercent === null ? "" : (m.changeSuffix ?? "%").trim(),
      Observação: m.sublabel,
    })),
    "Métricas Principais"
  );

  const roiRows = (rows: BiReportData["channels"]) =>
    rows.map((c) => ({
      Origem: c.canal,
      Leads: c.leads,
      Vendas: c.vendas,
      ...(data.investmentAvailable
        ? { "Investimento (R$)": c.investimento ?? "", "CPL (R$)": c.cpl ?? "", "ROI (x)": c.roiMultiplicador ?? "" }
        : {}),
      "VGV (R$)": c.vgv,
      "Ticket Médio (R$)": c.ticketMedio,
      "Conversão (%)": c.taxaConversao,
    }));
  append(roiRows(data.channels), "Canais");
  append(roiRows(data.campaigns), "Campanhas");

  append(
    data.funnelVelocity.stages.map((s) => ({
      Etapa: s.etapa,
      "Leads Abertos": s.leadsAbertos,
      "Leads que Chegaram": s.leadsEntraram,
      "Permanência Média (h)": s.tempoHoras,
      "SLA (h)": s.slaHoras ?? "",
      "Passagem (%)": s.taxaPassagem ?? "",
    })),
    "Velocidade do Funil"
  );

  append(lgpdRows(data.closedLeads), "Leads Encerrados LGPD");
  XLSX.writeFile(workbook, `Relatorio_BI_Connect_Platz_${data.period.key}.xlsx`);
}
