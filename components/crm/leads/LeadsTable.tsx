"use client";

import React from "react";
import { MessageSquare, Phone } from "lucide-react";
import { SlaBadge } from "@/components/crm/SlaBadge";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "./KanbanBoard";
import { ScoreBadge, LeadTag } from "@/components/crm/primitives";

interface LeadsTableProps {
  leads: LeadDetail[];
  stages: FunnelColumn[];
  onSelectLead: (lead: LeadDetail) => void;
}

export function LeadsTable({ leads, stages, onSelectLead }: LeadsTableProps) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Nome do Lead</th>
              <th className="py-3 px-4">Telefone</th>
              <th className="py-3 px-4">Origem</th>
              <th className="py-3 px-4">Etapa Atual</th>
              <th className="py-3 px-4">Score / Potencial</th>
              <th className="py-3 px-4">SLA</th>
              <th className="py-3 px-4 text-right">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground italic">
                  Nenhum lead encontrado com os filtros selecionados
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const scoreValue =
                  lead.score ??
                  (lead.temperatura === "QUENTE" ? 85 : lead.temperatura === "MORNO" ? 60 : 38);
                const rawPhone = lead.telefone.replace(/\D/g, "");

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="hover:bg-connect-blue/5 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-connect-blue text-white flex items-center justify-center text-[10px] font-bold">
                          {lead.nome[0]?.toUpperCase()}
                        </div>
                        <span className="truncate max-w-[180px]">{lead.nome}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">{lead.telefone}</td>
                    <td className="py-3 px-4">
                      <LeadTag variant="origin">{lead.source}</LeadTag>
                    </td>
                    <td className="py-3 px-4 text-foreground font-medium">
                      {stages.find((s) => s.id === lead.stageId)?.nome || "Novo Lead"}
                    </td>
                    <td className="py-3 px-4">
                      <ScoreBadge score={scoreValue} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <SlaBadge dueAt={lead.slaDueAt} breached={lead.slaBreached} />
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`tel:${rawPhone}`}
                          className="p-1 rounded-md text-connect-blue hover:bg-connect-blue/10 transition-colors"
                          title="Ligar"
                          aria-label="Ligar para lead"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/55${rawPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#22C55E]/15 hover:bg-[#22C55E]/25 border border-[#22C55E]/30 text-[#22C55E] text-[10px] font-bold py-1 px-2.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
