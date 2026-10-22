"use client";

import React, { useState } from "react";
import { ShieldCheck, Download, UserX } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { EmptyState } from "@/components/crm/primitives/EmptyState";
import { exportLgpdXlsx } from "./biExport";
import type { BiLgpdClosedLead } from "./types";

/** Leads encerrados (dados reais de /api/relatorios) para reativação/descarte conforme LGPD. */
export function BiLgpdGovernanceCard({ leads }: { leads: BiLgpdClosedLead[] }) {
  const { setActionMessage } = useCrm();
  const [selectedReason, setSelectedReason] = useState<string>("all");

  const reasons = Array.from(new Set(leads.map((l) => l.motivo)));

  const filteredLeads = selectedReason === "all" ? leads : leads.filter((l) => l.motivo === selectedReason);

  const handleExportLgpd = () => {
    if (filteredLeads.length === 0) return;
    exportLgpdXlsx(filteredLeads);
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
              Leads encerrados disponíveis para reativação ou descarte
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
            <option value="all">Todos os Motivos ({leads.length})</option>
            {reasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportLgpd}
            disabled={filteredLeads.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-platz-gold" />
            <span>Exportar LGPD</span>
          </button>
        </div>
      </div>

      {filteredLeads.length === 0 && (
        <EmptyState
          icon={UserX}
          title="Nenhum lead encerrado"
          description="Leads marcados como perdidos/encerrados aparecerão aqui para reativação ou descarte."
        />
      )}

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

            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground font-mono">
              <span className="shrink-0">{lead.telefone || "—"}</span>
              <span className="truncate" title={lead.email}>{lead.email}</span>
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
