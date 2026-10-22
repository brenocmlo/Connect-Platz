// components/crm/dashboard/exportDashboard.ts
// Exportação da Dashboard (.xlsx) com os mesmos números exibidos na tela.

import * as XLSX from "xlsx";
import type { DashboardData } from "./types";

export function exportDashboardXlsx(data: DashboardData) {
  const { financial, operational, cashFlow } = data;
  const rows: { Indicador: string; Valor: number | string }[] = [
    { Indicador: "Período", Valor: data.period.label },
    { Indicador: "VGV Total (R$)", Valor: financial.vgvTotal },
    { Indicador: "Total de Vendas", Valor: financial.totalSales },
    { Indicador: "Ticket Médio (R$)", Valor: financial.averageTicket },
    { Indicador: "Comissão Recebida (R$)", Valor: financial.commissionReceived },
    ...(financial.commissionPaid !== null
      ? [{ Indicador: "Comissões Pagas (R$)", Valor: financial.commissionPaid }]
      : []),
    { Indicador: "Comissões Pendentes (R$)", Valor: financial.commissionPending },
    ...(cashFlow
      ? [
          { Indicador: "Entradas (R$)", Valor: cashFlow.inflow },
          { Indicador: "Saídas (R$)", Valor: cashFlow.outflow },
          { Indicador: "Saldo (R$)", Valor: cashFlow.balance },
        ]
      : []),
    { Indicador: "Leads Captados", Valor: operational.leads.captados },
    { Indicador: "Taxa de Conversão (%)", Valor: operational.conversion.rate },
    { Indicador: "Visitas (total)", Valor: operational.visits.total },
    { Indicador: "Visitas Realizadas", Valor: operational.visits.realizadas },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Resumo");
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      data.salesSeries.anual.map((p) => ({ Mês: p.label, "VGV (R$)": p.vgv, Vendas: p.vendas }))
    ),
    "Vendas no Ano"
  );
  const funnel = data.funnels[0];
  if (funnel) {
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        funnel.stages.map((s) => ({ Etapa: s.nome, Leads: s.count, "Conversão (%)": s.conversionPct }))
      ),
      "Funil"
    );
  }
  XLSX.writeFile(workbook, `Dashboard_Connect_Platz_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
