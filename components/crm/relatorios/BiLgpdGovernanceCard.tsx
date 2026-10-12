"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  ShieldCheck,
  Download,
  Filter,
  UserX,
} from "lucide-react";
import { CLOSED_LEADS_FOR_REMARKETING } from "./biData";
import { useCrm } from "@/components/crm/CrmContext";

export function BiLgpdGovernanceCard() {
  const { setActionMessage } = useCrm();
  const [selectedReason, setSelectedReason] = useState<string>("all");

  const reasons = Array.from(
    new Set(CLOSED_LEADS_FOR_REMARKETING.map((l) => l.motivo))
  );

  const filteredLeads =
    selectedReason === "all"
      ? CLOSED_LEADS_FOR_REMARKETING
      : CLOSED_LEADS_FOR_REMARKETING.filter((l) => l.motivo === selectedReason);

  const handleExportLgpd = () => {
    const exportData = filteredLeads.map((l) => ({
      Nome: l.nome,
      Telefone: l.telefone,
      Email: l.email,
      Motivo: l.motivo,
      "Data Encerramento": l.dataEncerramento,
      "Empreendimento de Interesse": l.interesse,
      "Último Corretor": l.corretorUltimo,
      "Dias Inativo": l.diasInativo,
      "Consentimento LGPD": "Opt-in Base de Descarte",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads LGPD");
    XLSX.writeFile(workbook, "Leads_Descarte_Remarketing_LGPD.xlsx");

    setActionMessage("Exportação LGPD concluída com sucesso!");
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-connect-blue/10 flex items-center justify-center text-connect-blue">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Governança LGPD & Remarketing de Descarte
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Leads encerrados com consentimento para futuras campanhas de reativação
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Motivo */}
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="text-xs bg-muted/60 border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none"
          >
            <option value="all">Todos os Motivos ({CLOSED_LEADS_FOR_REMARKETING.length})</option>
            {reasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportLgpd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-platz-gold" />
            <span>Exportar LGPD</span>
          </button>
        </div>
      </div>

      {/* Grid de Cards de Contatos Encerrados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="bg-muted/40 border border-border/70 p-3.5 rounded-xl space-y-2 text-xs hover:border-connect-blue/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground truncate">{lead.nome}</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {lead.dataEncerramento}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span>{lead.telefone}</span>
              <span>{lead.email}</span>
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
              <span className="text-red-700 dark:text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded-full text-[10px]">
                {lead.motivo}
              </span>
              <span className="text-muted-foreground truncate max-w-[120px]" title={lead.interesse}>
                {lead.interesse}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
