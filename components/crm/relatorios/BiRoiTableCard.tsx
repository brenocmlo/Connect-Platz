"use client";

import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Search,
  ArrowUpDown,
  TrendingUp,
} from "lucide-react";
import { CAMPAIGN_ROI_DATA } from "./biData";
import { useCrm } from "@/components/crm/CrmContext";

type SortField = "vgv" | "leads" | "investimento" | "roiMultiplicador" | "taxaConversao";

export function BiRoiTableCard() {
  const { hideValues, setActionMessage } = useCrm();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("vgv");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredData = useMemo(() => {
    return CAMPAIGN_ROI_DATA.filter((item) =>
      item.canal.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (sortOrder === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
  }, [searchTerm, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map((d) => ({
      Canal: d.canal,
      "Leads Recebidos": d.leads,
      "Investimento (R$)": d.investimento,
      "CPL (R$)": d.cpl,
      "VGV Gerado (R$)": d.vgv,
      "Ticket Médio (R$)": d.ticketMedio,
      "Conversão (%)": `${d.taxaConversao}%`,
      ROI: d.roi,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ROI de Mídia");
    XLSX.writeFile(workbook, "Relatorio_ROI_Connect_Platz_2026.xlsx");

    setActionMessage("Planilha Excel (.xlsx) exportada com sucesso!");
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
      {/* Cabeçalho da Tabela com Busca e Ação de Exportar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            ROI de Aquisição & Performance por Canal
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Comparativo de investimento, geração de valor e retorno sobre capital
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar canal..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
            />
          </div>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar XLSX</span>
          </button>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/60 text-[10px] text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
            <tr>
              <th className="py-3 px-4">Canal de Origem</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-foreground"
                onClick={() => handleSort("leads")}
              >
                <div className="flex items-center gap-1">
                  <span>Leads</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-foreground"
                onClick={() => handleSort("investimento")}
              >
                <div className="flex items-center gap-1">
                  <span>Custo Total</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">CPL</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-foreground"
                onClick={() => handleSort("vgv")}
              >
                <div className="flex items-center gap-1">
                  <span>VGV Gerado</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-foreground"
                onClick={() => handleSort("taxaConversao")}
              >
                <div className="flex items-center gap-1">
                  <span>Conversão</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-foreground"
                onClick={() => handleSort("roiMultiplicador")}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Retorno (ROI)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredData.map((c) => (
              <tr key={c.canal} className="hover:bg-connect-blue/5 transition-colors">
                <td className="py-3 px-4 font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: c.cor }}
                    />
                    <span>{c.canal}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-muted-foreground">
                  {c.leads} contatos
                </td>
                <td className="py-3 px-4 font-mono text-muted-foreground">
                  {hideValues
                    ? "••••"
                    : c.investimento.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                </td>
                <td className="py-3 px-4 font-mono text-muted-foreground">
                  {hideValues ? "••••" : `R$ ${c.cpl.toFixed(2)}`}
                </td>
                <td className="py-3 px-4 font-extrabold text-emerald-700 dark:text-emerald-400">
                  {hideValues
                    ? "••••••"
                    : c.vgv.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                </td>
                <td className="py-3 px-4 font-bold text-foreground">
                  {c.taxaConversao}%
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-xs font-bold text-connect-blue dark:text-blue-300 bg-connect-blue/10 px-2.5 py-0.5 rounded-full border border-connect-blue/20">
                    {c.roi}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
