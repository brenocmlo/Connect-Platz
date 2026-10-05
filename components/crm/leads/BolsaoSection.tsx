"use client";

import React from "react";
import { ShieldAlert, UserCheck } from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";

interface BolsaoSectionProps {
  leads: LeadDetail[];
  onTakeover: (leadId: string) => void;
}

export function BolsaoSection({ leads, onTakeover }: BolsaoSectionProps) {
  const bolsaoLeads = leads.filter((l) => l.isBolsao);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Bolsão de Leads Compartilhado</h2>
          <p className="text-xs text-muted-foreground">
            Leads cujo corretor anterior não realizou contato no prazo de SLA. Qualquer corretor disponível pode assumi-los.
          </p>
        </div>
      </div>

      {bolsaoLeads.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-xs italic">
          Nenhum lead no bolsão no momento. Todos os atendimentos estão dentro do SLA!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bolsaoLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-background border border-amber-500/30 rounded-xl p-4 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{lead.nome}</span>
                <span className="text-[10px] bg-amber-500/15 text-amber-500 font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                  Transbordado
                </span>
              </div>

              <p className="text-xs text-muted-foreground font-mono">{lead.telefone}</p>

              <button
                onClick={() => onTakeover(lead.id)}
                className="w-full bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shadow-connect-blue/20"
              >
                <UserCheck className="w-4 h-4" />
                Assumir Lead do Bolsão
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
