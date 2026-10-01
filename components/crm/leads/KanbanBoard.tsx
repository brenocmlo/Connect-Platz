"use client";

import React from "react";
import { Clock, Flame, Phone, MessageSquare } from "lucide-react";
import { SlaBadge } from "@/components/crm/SlaBadge";
import { LeadDetail } from "@/components/crm/LeadDrawer";

export interface FunnelColumn {
  id: string;
  nome: string;
  posicao: number;
  cor: string;
  slaMinutes: number | null;
}

interface KanbanBoardProps {
  stages: FunnelColumn[];
  leads: LeadDetail[];
  onSelectLead: (lead: LeadDetail) => void;
  onDropLead: (leadId: string, targetStageId: string) => void;
}

export function KanbanBoard({ stages, leads, onSelectLead, onDropLead }: KanbanBoardProps) {
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (leadId) onDropLead(leadId, stageId);
  };

  return (
    <div className="flex gap-4 items-start overflow-x-auto pb-4 min-w-[1300px]">
      {stages.map((stage) => {
        const stageLeads = leads.filter(
          (l) => l.stageId === stage.id || (!l.stageId && stage.posicao === 1)
        );

        return (
          <div
            key={stage.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
            className="w-80 bg-[#0A0E17] border border-[#1C2537] rounded-2xl flex flex-col max-h-[calc(100vh-210px)] shadow-xl flex-shrink-0"
          >
            {/* Header da Coluna com Indicador de SLA */}
            <div
              className="p-3.5 border-b border-[#1C2537] flex items-center justify-between rounded-t-2xl"
              style={{ borderTop: `3px solid ${stage.cor}` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight">{stage.nome}</span>
                <span className="text-[10px] bg-[#111827] text-slate-300 px-2 py-0.5 rounded-full font-bold">
                  {stageLeads.length}
                </span>
              </div>

              {stage.slaMinutes && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  SLA {stage.slaMinutes}m
                </span>
              )}
            </div>

            {/* Lista de Cards da Etapa */}
            <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 min-h-[150px]">
              {stageLeads.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-600 italic">
                  Nenhum lead nesta coluna
                </div>
              ) : (
                stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onClick={() => onSelectLead(lead)}
                    className="bg-[#0F1624] hover:bg-[#141E30] border border-[#1C2537] hover:border-connect-blue/50 rounded-xl p-3.5 cursor-grab active:cursor-grabbing transition-all shadow-md group relative"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-connect-blue transition-colors">
                        {lead.nome}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                          lead.temperatura === "QUENTE"
                            ? "bg-red-950/80 text-red-400 border border-red-800"
                            : lead.temperatura === "MORNO"
                            ? "bg-amber-950/80 text-amber-400 border border-amber-800"
                            : "bg-blue-950/80 text-blue-400 border border-blue-800"
                        }`}
                      >
                        <Flame className="w-2.5 h-2.5" />
                        {lead.temperatura}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {lead.telefone}
                      </span>
                      <SlaBadge dueAt={lead.slaDueAt} breached={lead.slaBreached} />
                    </div>

                    {/* Origem e Corretor Responsável */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-[#1C2537] pt-2 mt-2">
                      <span className="text-blue-400 font-semibold">{lead.source}</span>
                      <span className="text-slate-300">
                        {lead.corretor?.nome ? `👤 ${lead.corretor.nome.split(" ")[0]}` : "⚡ Bolsão"}
                      </span>
                    </div>

                    {/* Botão Externo WhatsApp Web (wa.me) */}
                    <div className="mt-2.5">
                      <a
                        href={`https://wa.me/55${lead.telefone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-[#16A34A]/15 hover:bg-[#16A34A]/25 border border-[#16A34A]/40 text-[#22C55E] text-[10px] font-bold py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Chamar no WhatsApp Web
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
