"use client";

import React, { useState } from "react";
import { MessageSquare, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ScoreBadge } from "@/components/crm/primitives/ScoreBadge";
import { StatusPill } from "@/components/crm/primitives/StatusPill";

interface RankedHotLead {
  id: string;
  rank: number;
  name: string;
  phone: string;
  status: "NOVO" | "ATENDIMENTO" | "VISITA" | "PROPOSTA";
  broker: string;
  relativeTime: string;
  score: number;
  potentialLabel: string;
}

const mockRankedLeadsPage1: RankedHotLead[] = [
  {
    id: "lead-1",
    rank: 1,
    name: "Dr. Marcelo Cavalcante",
    phone: "85998124455",
    status: "PROPOSTA",
    broker: "Lucas Corretor",
    relativeTime: "há 20 minutos",
    score: 97,
    potentialLabel: "Potencial Alto",
  },
  {
    id: "lead-2",
    rank: 2,
    name: "Juliana Albuquerque",
    phone: "85987332211",
    status: "ATENDIMENTO",
    broker: "Ana Paula",
    relativeTime: "há 2 horas",
    score: 92,
    potentialLabel: "Potencial Alto",
  },
  {
    id: "lead-3",
    rank: 3,
    name: "Rogério Prado & Família",
    phone: "85991448899",
    status: "VISITA",
    broker: "Carlos Eduardo",
    relativeTime: "há 5 horas",
    score: 88,
    potentialLabel: "Potencial Alto",
  },
  {
    id: "lead-4",
    rank: 4,
    name: "Fernanda Montenegro",
    phone: "85988112233",
    status: "NOVO",
    broker: "Roleta Automática",
    relativeTime: "há 1 dia",
    score: 85,
    potentialLabel: "Potencial Alto",
  },
  {
    id: "lead-5",
    rank: 5,
    name: "Eduardo Matos",
    phone: "85997223344",
    status: "ATENDIMENTO",
    broker: "Lucas Corretor",
    relativeTime: "há 2 dias",
    score: 82,
    potentialLabel: "Potencial Alto",
  },
  {
    id: "lead-6",
    rank: 6,
    name: "Camila Vasconcelos",
    phone: "85996334455",
    status: "VISITA",
    broker: "Ana Paula",
    relativeTime: "há 3 dias",
    score: 79,
    potentialLabel: "Potencial Alto",
  },
];

const mockRankedLeadsPage2: RankedHotLead[] = [
  {
    id: "lead-7",
    rank: 7,
    name: "Bruno Magalhães",
    phone: "85995443322",
    status: "ATENDIMENTO",
    broker: "Carlos Eduardo",
    relativeTime: "há 4 dias",
    score: 78,
    potentialLabel: "Potencial Alto",
  },
  {
    id: "lead-8",
    rank: 8,
    name: "Patrícia Linhares",
    phone: "85994556677",
    status: "PROPOSTA",
    broker: "Lucas Corretor",
    relativeTime: "há 5 dias",
    score: 76,
    potentialLabel: "Potencial Alto",
  },
  {
    id: "lead-9",
    rank: 9,
    name: "Gustavo Siqueira",
    phone: "85993667788",
    status: "NOVO",
    broker: "Roleta Automática",
    relativeTime: "há 1 semana",
    score: 75,
    potentialLabel: "Potencial Alto",
  },
  {
    id: "lead-10",
    rank: 10,
    name: "Renata Bezerra",
    phone: "85992778899",
    status: "VISITA",
    broker: "Ana Paula",
    relativeTime: "há 1 semana",
    score: 74,
    potentialLabel: "Potencial Alto",
  },
  {
    id: "lead-11",
    rank: 11,
    name: "Thiago Fontes",
    phone: "85991889900",
    status: "ATENDIMENTO",
    broker: "Carlos Eduardo",
    relativeTime: "há 2 semanas",
    score: 72,
    potentialLabel: "Potencial Alto",
  },
  {
    id: "lead-12",
    rank: 12,
    name: "Larissa Holanda",
    phone: "85990990011",
    status: "PROPOSTA",
    broker: "Lucas Corretor",
    relativeTime: "há 2 semanas",
    score: 70,
    potentialLabel: "Potencial Alto",
  },
];

export function HotLeadsRankedList() {
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);

  const leads = currentPage === 1 ? mockRankedLeadsPage1 : mockRankedLeadsPage2;

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      {/* 1. CABEÇALHO */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Leads Quentes</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
              🔥 Prioridade Alta
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Classificados deterministicamente por pontuação e score
          </p>
        </div>

        <a
          href="/crm/leads"
          className="text-xs text-connect-blue hover:underline font-semibold flex items-center gap-1"
        >
          Ver todos <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 2. LISTA RANQUEADA 1º...6º NO PADRÃO HABITUS (5.3) */}
      <div className="space-y-2.5">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/80 border border-border/50 hover:border-primary/40 transition-all gap-3"
          >
            {/* Esquerda: Círculo de Rank + Nome + Meta */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-6 h-6 rounded-full bg-card border border-border text-[11px] font-bold text-muted-foreground flex items-center justify-center flex-shrink-0 shadow-xs">
                {lead.rank}º
              </span>

              <div className="truncate">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-foreground truncate">{lead.name}</span>
                  <StatusPill
                    color={
                      lead.status === "NOVO"
                        ? "blue"
                        : lead.status === "PROPOSTA"
                        ? "green"
                        : "amber"
                    }
                    size="sm"
                    dot={false}
                  >
                    {lead.status}
                  </StatusPill>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {lead.broker} • {lead.relativeTime}
                </p>
              </div>
            </div>

            {/* Direita: Score Badge + Botão WhatsApp em círculo verde + Seta */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <ScoreBadge score={lead.score} size="sm" showPoints={true} />
                <span className="text-[9px] text-muted-foreground block mt-0.5">
                  {lead.potentialLabel}
                </span>
              </div>

              {/* Botão WhatsApp (ícone verde em círculo — link wa.me direto) */}
              <a
                href={`https://wa.me/55${lead.phone}?text=Ol%C3%A1%20${encodeURIComponent(
                  lead.name
                )}%2C%20sou%20seu%20consultor%20Connect%20Platz!`}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                title="Conversar no WhatsApp Web"
                aria-label={`Conversar no WhatsApp com ${lead.name}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </a>

              <a
                href={`/crm/leads?lead=${lead.id}`}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Ver detalhes do lead"
                aria-label="Ver detalhes do lead"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* 3. PAGINAÇÃO "PÁGINA 1 DE 2 (12 LEADS)" (5.3) */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Página {currentPage} de 2 (12 leads)</span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md border border-border hover:bg-muted disabled:opacity-40 transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            disabled={currentPage === 2}
            className="p-1 rounded-md border border-border hover:bg-muted disabled:opacity-40 transition-colors"
            aria-label="Próxima página"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
