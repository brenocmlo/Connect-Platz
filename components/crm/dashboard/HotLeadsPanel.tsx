"use client";

import React from "react";
import { Flame, MessageSquare, Phone, ChevronRight } from "lucide-react";
import { SlaBadge } from "@/components/crm/SlaBadge";

interface LeadQuente {
  id: string;
  nome: string;
  telefone: string;
  empreendimento: string;
  valorPotencial: string;
  temperatura: "QUENTE";
  stage: string;
  slaDueAt: string;
}

const mockHotLeads: LeadQuente[] = [
  {
    id: "lead-1",
    nome: "Dr. Marcelo Cavalcante",
    telefone: "85998124455",
    empreendimento: "Villa Platz Beach Residence",
    valorPotencial: "R$ 1.850.000",
    temperatura: "QUENTE",
    stage: "Proposta Enviada",
    slaDueAt: new Date(Date.now() + 1000 * 60 * 25).toISOString(),
  },
  {
    id: "lead-2",
    nome: "Juliana Albuquerque",
    telefone: "85987332211",
    empreendimento: "Platz Oceanfront Residence",
    valorPotencial: "R$ 2.400.000",
    temperatura: "QUENTE",
    stage: "Análise de Crédito",
    slaDueAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
  },
  {
    id: "lead-3",
    nome: "Rogério Prado & Família",
    telefone: "85991448899",
    empreendimento: "Residencial Aldeota Platz",
    valorPotencial: "R$ 980.000",
    temperatura: "QUENTE",
    stage: "Visita Agendada",
    slaDueAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

export function HotLeadsPanel() {
  return (
    <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-red-950/80 border border-red-800 text-red-400">
            <Flame className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Leads de Alta Prioridade (Quentes)</h3>
            <p className="text-[11px] text-slate-400">Maior probabilidade de fechamento imediato</p>
          </div>
        </div>
        <a
          href="/crm/leads"
          className="text-xs text-connect-blue hover:underline font-semibold flex items-center gap-1"
        >
          Ver Funil Completo <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="space-y-3">
        {mockHotLeads.map((lead) => (
          <div
            key={lead.id}
            className="bg-[#0D131F] hover:bg-[#121A2B] border border-[#1F2937] hover:border-connect-blue/50 rounded-xl p-3.5 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white">{lead.nome}</span>
                <SlaBadge dueAt={lead.slaDueAt} />
              </div>
              <p className="text-[11px] text-slate-400">{lead.empreendimento}</p>
              <p className="text-xs font-extrabold text-[#D9BB4C] mt-0.5">{lead.valorPotencial}</p>
            </div>

            {/* Botões de Ação Rápida */}
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/55${lead.telefone}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#16A34A]/15 hover:bg-[#16A34A]/25 border border-[#16A34A]/40 text-[#22C55E] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <a
                href={`tel:${lead.telefone}`}
                className="p-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-slate-300 hover:text-white hover:bg-connect-blue/30 transition-colors"
                title="Ligar para o cliente"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
