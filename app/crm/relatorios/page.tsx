"use client";

import React from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Download,
  ShieldCheck,
  TrendingUp,
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
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";

const funnelEfficiencyData = [
  { etapa: "Novo Lead", tempoHoras: 0.3 },
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. CABEÇALHO PADRÃO SEÇÃO 5.2 */}
      <PageHeader
        title="Relatórios BI & Métricas"
        subtitle="Eficiência de funil, velocidade de conversão, ROI de canais e governança de dados."
        showPeriodSelector={true}
        showExportButton={true}
        onExportClick={handleExportExcel}
      >
        <button
          onClick={handleExportClosedLeads}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-platz-gold" />
          <span>Exportar LGPD</span>
        </button>
      </PageHeader>

      {/* 2. GRÁFICO: EFICIÊNCIA DE FUNIL */}
      <div className="space-y-3">
        <SectionTitle>Eficiência de Funil & Permanência Média</SectionTitle>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Tempo Médio em Horas por Estágio</h3>
            <p className="text-xs text-muted-foreground">
              Média de horas que um lead permanece em cada etapa até o próximo avanço ou desfecho.
            </p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelEfficiencyData}>
                <XAxis dataKey="etapa" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} unit="h" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs">
                          <span className="font-bold text-muted-foreground block mb-1">{label}</span>
                          <span className="font-extrabold text-connect-blue dark:text-blue-400">
                            Tempo Médio: {payload[0].value} horas
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="tempoHoras" fill="#1266C7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. TABELA DE ROI POR CANAL */}
      <div className="space-y-3">
        <SectionTitle>ROI de Aquisição por Canal</SectionTitle>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/60 text-[10px] text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">Canal de Origem</th>
                  <th className="py-3 px-4">Leads Recebidos</th>
                  <th className="py-3 px-4">VGV Comercial Gerado</th>
                  <th className="py-3 px-4 text-right">Retorno Sobre Investimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {campaignRoiData.map((c) => (
                  <tr key={c.canal} className="hover:bg-connect-blue/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-foreground">{c.canal}</td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground">{c.leads} contatos</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {c.vgv.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
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
      </div>

      {/* 4. GOVERNANÇA LGPD */}
      <div className="space-y-3">
        <SectionTitle>Governança de Dados & Remarketing LGPD</SectionTitle>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-connect-blue/10 text-connect-blue">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Contatos Encerrados por Inatividade</h3>
              <p className="text-xs text-muted-foreground">
                Leads sem interação há mais de 14 dias arquivados com histórico para listas de remarketing consentido.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {closedLeadsForRemarketing.map((lead) => (
              <div key={lead.nome} className="bg-muted/50 border border-border/80 p-3.5 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-foreground block">{lead.nome}</span>
                <span className="text-[11px] text-muted-foreground font-mono block">{lead.telefone}</span>
                <span className="text-[10px] text-red-500 font-semibold block">{lead.motivo}</span>
                <span className="text-[10px] text-muted-foreground block">Interesse: {lead.interesse}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
