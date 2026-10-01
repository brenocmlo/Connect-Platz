"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import { SlaBadge } from "@/components/crm/SlaBadge";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "./KanbanBoard";

interface LeadsTableProps {
  leads: LeadDetail[];
  stages: FunnelColumn[];
  onSelectLead: (lead: LeadDetail) => void;
}

export function LeadsTable({ leads, stages, onSelectLead }: LeadsTableProps) {
  return (
    <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0F1624] border-b border-[#1C2537] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Nome do Lead</th>
              <th className="py-3.5 px-4">Telefone</th>
              <th className="py-3.5 px-4">Origem</th>
              <th className="py-3.5 px-4">Etapa Atual</th>
              <th className="py-3.5 px-4">Temperatura</th>
              <th className="py-3.5 px-4">SLA</th>
              <th className="py-3.5 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C2537]">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="hover:bg-[#0F1624] cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 font-bold text-white">{lead.nome}</td>
                <td className="py-3 px-4 font-mono text-slate-300">{lead.telefone}</td>
                <td className="py-3 px-4 text-blue-400 font-semibold">{lead.source}</td>
                <td className="py-3 px-4 text-slate-300">
                  {stages.find((s) => s.id === lead.stageId)?.nome || "Novo Lead"}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 ${
                      lead.temperatura === "QUENTE"
                        ? "bg-red-950 text-red-400 border border-red-800"
                        : lead.temperatura === "MORNO"
                        ? "bg-amber-950 text-amber-400 border border-amber-800"
                        : "bg-blue-950 text-blue-400 border border-blue-800"
                    }`}
                  >
                    {lead.temperatura}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <SlaBadge dueAt={lead.slaDueAt} breached={lead.slaBreached} />
                </td>
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`https://wa.me/55${lead.telefone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#16A34A]/15 hover:bg-[#16A34A]/25 border border-[#16A34A]/40 text-[#22C55E] text-[10px] font-bold py-1 px-2.5 rounded-lg inline-flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    WhatsApp
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
