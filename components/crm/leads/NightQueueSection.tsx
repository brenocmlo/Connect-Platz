"use client";

import React from "react";
import { Moon, Clock, Play, CheckCircle2, ShieldCheck, User } from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { LeadTag } from "@/components/crm/primitives/LeadTag";
import { ScoreBadge } from "@/components/crm/primitives/ScoreBadge";

interface NightQueueSectionProps {
  leads: LeadDetail[];
  onDispatchNightQueue: () => void;
  onSelectLead: (lead: LeadDetail) => void;
}

export function NightQueueSection({
  leads,
  onDispatchNightQueue,
  onSelectLead,
}: NightQueueSectionProps) {
  const nightLeads = leads.filter((l) => l.isNightQueue);

  return (
    <div className="space-y-4">
      {/* Banner Explicativo */}
      <div className="p-5 bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-800/60 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                Fila de Espera Noturna (Plantão Comercial)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {nightLeads.length} leads retidos
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Leads captados fora do expediente comercial (após as 22h) ficam retidos nesta fila com SLA pausado, protegendo os corretores contra penalidades durante a noite. O despacho matinal ocorre automaticamente às 09:00 via Roleta Round-Robin, ou você pode liberá-los agora.
            </p>
          </div>
        </div>

        <button
          onClick={onDispatchNightQueue}
          disabled={nightLeads.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap self-end md:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Liberar na Roleta Agora</span>
        </button>
      </div>

      {/* Lista de Leads na Fila Noturna */}
      {nightLeads.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <h4 className="text-sm font-bold text-foreground">
            Nenhum lead retido na Fila Noturna
          </h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Todos os leads que entraram já foram distribuídos aos corretores ou encaminhados durante o horário de expediente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {nightLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className="bg-card border border-border hover:border-indigo-500/40 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {lead.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground truncate max-w-[150px]">
                      {lead.nome}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {lead.telefone}
                    </span>
                  </div>
                </div>

                <ScoreBadge score={lead.score ?? 50} size="sm" />
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>SLA Pausado</span>
                </div>
                <LeadTag variant="origin">{lead.source}</LeadTag>
              </div>

              <div className="text-[11px] text-muted-foreground">
                Interesse: <strong className="text-foreground">{lead.empreendimentoInteresse || "Lançamento"}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
