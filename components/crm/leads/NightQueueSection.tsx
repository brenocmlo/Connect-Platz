"use client";

import React from "react";
import { Moon, Clock, ShieldCheck } from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { LeadTag } from "@/components/crm/primitives/LeadTag";
import { ScoreBadge } from "@/components/crm/primitives/ScoreBadge";

interface NightQueueSectionProps {
  leads: LeadDetail[];
  onSelectLead: (lead: LeadDetail) => void;
}

export function NightQueueSection({
  leads,
  onSelectLead,
}: NightQueueSectionProps) {
  const nightLeads = leads.filter((l) => l.isNightQueue);

  return (
    <div className="space-y-4">
      {/* Banner Explicativo */}
      <div className="p-5 bg-gradient-to-r from-connect-blue/10 to-connect-blue/5 border border-connect-blue/25 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-connect-blue/15 text-connect-blue flex items-center justify-center flex-shrink-0 mt-0.5">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                Fila de Espera Noturna (Plantão Comercial)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-connect-blue/15 text-connect-blue dark:text-sky-300 border border-connect-blue/30">
                {nightLeads.length} leads retidos
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Leads captados fora do expediente comercial (após as 22h) ficam retidos nesta fila com SLA pausado, protegendo os corretores contra penalidades durante a noite. O despacho ocorre automaticamente no início do expediente via Roleta Round-Robin.
            </p>
          </div>
        </div>
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
              className="bg-card border border-border hover:border-connect-blue/40 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-connect-blue text-white flex items-center justify-center font-bold text-xs">
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

                <ScoreBadge score={lead.score} size="sm" />
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3 h-3 text-connect-blue" />
                  <span>SLA Pausado</span>
                </div>
                <LeadTag variant="origin">{lead.sourceLabel || lead.source}</LeadTag>
              </div>

              {lead.empreendimentoInteresse && (
                <div className="text-[11px] text-muted-foreground">
                  Interesse: <strong className="text-foreground">{lead.empreendimentoInteresse}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
