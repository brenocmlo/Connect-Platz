"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  BarChart3,
  Download,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  CheckCircle2,
  PieChart as PieIcon,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useCrm } from "@/components/crm/CrmContext";

const funnelEfficiencyData = [
  { etapa: "Novo Lead", tempoHoras: 0.3 }, // 18 min
  { etapa: "1º Contato", tempoHoras: 1.5 },
  { etapa: "Visita Agendada", tempoHoras: 28.0 },
  { etapa: "Proposta", tempoHoras: 14.2 },
  { etapa: "Análise Crédito", tempoHoras: 42.0 },
  { etapa: "Fechamento", tempoHoras: 18.0 },
];

const campaignRoiData = [
  { canal: "Meta Ads (Instagram)", vgv: 4850000, leads: 120, roi: "8.4x" },
  { canal: "Google Ads (Pesquisa)", vgv: 2100000, leads: 42, roi: "6.2x" },
  { canal: "Indicações & Carteira", vgv: 1500000, leads: 18, roi: "Orgânico" },
  { canal: "Catálogo Site Oficial", vgv: 980000, leads: 24, roi: "Orgânico" },
];

const closedLeadsForRemarketing = [
  { nome: "Eduardo Silva", telefone: "85991122334", motivo: "Inatividade > 14 dias", dataEncerramento: "15/09/2026", interesse: "2 Quartos Meireles" },
  { nome: "Beatriz Nogueira", telefone: "85988223344", motivo: "Optou por aluguel", dataEncerramento: "20/09/2026", interesse: "Aldeota" },
  { nome: "Fernando Lima", telefone: "85999334455", motivo: "Sem resposta após proposta", dataEncerramento: "24/09/2026", interesse: "Villa Platz Beach" },
];

export default function RelatoriosBiPage() {
  const { setActionMessage } = useCrm();

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(campaignRoiData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ROI de Campanhas");
    XLSX.writeFile(workbook, "Relatorio_ROI_Connect_Platz_2026.xlsx");
    setActionMessage("Planilha Excel (.xlsx) exportada com sucesso!");
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleExportClosedLeads = () => {
    const worksheet = XLSX.utils.json_to_sheet(closedLeadsForRemarketing);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads Encerrados LGPD");
    XLSX.writeFile(workbook, "Leads_Encerrados_Remarketing_LGPD.xlsx");
    setActionMessage("Exportação de contatos encerrados concluída com conformidade LGPD.");
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOPBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-connect-blue/15 border border-connect-blue/30 text-connect-blue">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">BI & Relatórios Analíticos de Performance</h2>
            <p className="text-xs text-slate-400">
              Gargalos de funil, tempo médio por etapa, ROI de campanhas e governança LGPD.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="bg-[#0F1624] hover:bg-[#151F33] border border-[#1C2537] text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Exportar ROI (Excel)
          </button>

          <button
            onClick={handleExportClosedLeads}
            className="bg-[#D9BB4C] hover:bg-[#C5A73D] text-black text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#D9BB4C]/15 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            Exportar Contatos LGPD
          </button>
        </div>
      </div>

      {/* 2. GRÁFICO: TEMPO MÉDIO EM HORAS POR ETAPA DO FUNIL */}
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Eficiência de Funil • Tempo Médio de Permanência</h3>
          <p className="text-xs text-slate-400">
            Horas médias que um lead permanece em cada estágio até o avanço comercial.
          </p>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelEfficiencyData}>
              <XAxis dataKey="etapa" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} unit="h" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0D131F",
                  borderColor: "#1F2937",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="tempoHoras" name="Tempo Médio (Horas)" fill="#1266C7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. TABELA DE ROI DE CAMPANHAS E CANAIS */}
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-[#1C2537] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            ROI de Aquisição de Clientes por Canal
          </h3>
          <span className="text-xs text-slate-400">Atribuição por Parâmetros UTM</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-[#0F1624] text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-[#1C2537]">
            <tr>
              <th className="py-3 px-4">Canal de Origem</th>
              <th className="py-3 px-4">Leads Recebidos</th>
              <th className="py-3 px-4">VGV Comercial Gerado</th>
              <th className="py-3 px-4 text-right">Retorno Sobre Investimento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C2537]">
            {campaignRoiData.map((c) => (
              <tr key={c.canal} className="hover:bg-[#0D131F]">
                <td className="py-3.5 px-4 font-bold text-white">{c.canal}</td>
                <td className="py-3.5 px-4 font-mono text-slate-300">{c.leads} contatos</td>
                <td className="py-3.5 px-4 font-extrabold text-[#D9BB4C]">
                  {c.vgv.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {c.roi}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. MÓDULO DE GOVERNANÇA LGPD & CONTATOS ENCERRADOS */}
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-connect-blue" />
          <div>
            <h3 className="text-sm font-bold text-white">Contatos Encerrados por Caducidade (Governança LGPD)</h3>
            <p className="text-xs text-slate-400">
              Leads inativos sem avanço de etapa por mais de 14 dias arquivados com histórico para remarketing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {closedLeadsForRemarketing.map((lead) => (
            <div key={lead.nome} className="bg-[#0F1624] border border-[#1C2537] p-3.5 rounded-xl space-y-1 text-xs">
              <span className="font-bold text-white block">{lead.nome}</span>
              <span className="text-[11px] text-slate-400 font-mono block">{lead.telefone}</span>
              <span className="text-[10px] text-red-400 block font-semibold">{lead.motivo}</span>
              <span className="text-[10px] text-slate-500 block">Interesse: {lead.interesse}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
