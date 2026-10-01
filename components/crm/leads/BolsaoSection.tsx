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
    <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-[#1C2537]">
        <ShieldAlert className="w-6 h-6 text-amber-400" />
        <div>
          <h2 className="text-base font-bold text-white">Bolsão de Leads Compartilhado</h2>
          <p className="text-xs text-slate-400">
            Leads cujo corretor anterior não realizou contato no prazo de SLA. Qualquer corretor disponível pode assumi-los.
          </p>
        </div>
      </div>

      {bolsaoLeads.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs italic">
          Nenhum lead no bolsão no momento. Todos os atendimentos estão dentro do SLA!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bolsaoLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-[#0F1624] border border-amber-800/40 rounded-xl p-4 space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{lead.nome}</span>
                <span className="text-[10px] bg-red-950 text-red-400 font-bold px-2 py-0.5 rounded">
                  Transbordado
                </span>
              </div>

              <p className="text-xs text-slate-400 font-mono">{lead.telefone}</p>

              <button
                onClick={() => onTakeover(lead.id)}
                className="w-full bg-connect-blue hover:bg-[#0D478F] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
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
