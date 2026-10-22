"use client";

import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { SegmentedToggle } from "@/components/crm/primitives/SegmentedToggle";
import type { BiChannelRoiMetric } from "./types";

type SortField = "vgv" | "leads" | "investimento" | "roiMultiplicador" | "taxaConversao";
type RowMode = "canais" | "campanhas";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface BiRoiTableCardProps {
  channels: BiChannelRoiMetric[];
  campaigns: BiChannelRoiMetric[];
  /** false = usuário sem acesso ao investimento de mídia (corretor/gerente): custo, CPL e ROI ocultos */
  investmentAvailable: boolean;
}

/** Tabela analítica de ROI por canal/campanha (dados reais de /api/relatorios). */
export function BiRoiTableCard({ channels, campaigns, investmentAvailable }: BiRoiTableCardProps) {
  const { hideValues, setActionMessage } = useCrm();
  const [mode, setMode] = useState<RowMode>("canais");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("vgv");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredData = useMemo(() => {
    const rows = mode === "canais" ? channels : campaigns;
    const dir = sortOrder === "asc" ? 1 : -1;
    return rows
      .filter((item) => item.canal.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        // null (sem base de cálculo) sempre ao final; desempate determinístico pelo nome
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA === null && valB === null) return a.canal.localeCompare(b.canal);
        if (valA === null) return 1;
        if (valB === null) return -1;
        if (valA === valB) return a.canal.localeCompare(b.canal);
        return valA > valB ? dir : -dir;
      });
  }, [channels, campaigns, mode, searchTerm, sortField, sortOrder]);

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
      Vendas: d.vendas,
      ...(investmentAvailable
        ? { "Investimento (R$)": d.investimento ?? "", "CPL (R$)": d.cpl ?? "" }
        : {}),
      "VGV Gerado (R$)": d.vgv,
      "Ticket Médio (R$)": d.ticketMedio,
      "Conversão (%)": d.taxaConversao,
      ...(investmentAvailable ? { "ROI (x)": d.roiMultiplicador ?? "" } : {}),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, mode === "canais" ? "ROI por Canal" : "ROI por Campanha");
    XLSX.writeFile(workbook, `Relatorio_ROI_${mode}_Connect_Platz.xlsx`);

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
            {investmentAvailable
              ? "Investimento = despesas de mídia lançadas no Fluxo de Caixa do período"
              : "Leads, vendas e VGV por origem (investimento visível apenas para a Diretoria)"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <SegmentedToggle
            options={[
              { value: "canais", label: "Canais" },
              { value: "campanhas", label: "Campanhas" },
            ]}
            value={mode}
            onChange={(v) => setMode(v as RowMode)}
            size="sm"
          />
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
            disabled={filteredData.length === 0}
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
              {investmentAvailable && (
                <>
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
                </>
              )}
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
              {investmentAvailable && (
                <th
                  className="py-3 px-4 text-right cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("roiMultiplicador")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Retorno (ROI)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={investmentAvailable ? 7 : 4} className="py-8 px-4 text-center text-muted-foreground">
                  {searchTerm ? "Nenhum resultado para a busca." : "Sem leads ou vendas no período selecionado."}
                </td>
              </tr>
            )}
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
                  {c.leads} {c.leads === 1 ? "contato" : "contatos"}
                  <span className="block text-[10px]">
                    {c.vendas} {c.vendas === 1 ? "venda" : "vendas"}
                  </span>
                </td>
                {investmentAvailable && (
                  <>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {c.investimento === null ? "—" : hideValues ? "••••" : brl(c.investimento)}
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {c.cpl === null ? "—" : hideValues ? "••••" : brl(c.cpl)}
                    </td>
                  </>
                )}
                <td className="py-3 px-4 font-extrabold text-emerald-700 dark:text-emerald-400">
                  {hideValues ? "••••••" : brl(c.vgv)}
                </td>
                <td className="py-3 px-4 font-bold text-foreground">
                  {c.taxaConversao}%
                </td>
                {investmentAvailable && (
                  <td className="py-3 px-4 text-right">
                    {c.roiMultiplicador === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className="text-xs font-bold text-connect-blue dark:text-blue-300 bg-connect-blue/10 px-2.5 py-0.5 rounded-full border border-connect-blue/20">
                        {c.roiMultiplicador.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}x
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
