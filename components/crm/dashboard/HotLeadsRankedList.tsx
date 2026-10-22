"use client";

import React, { useEffect, useState } from "react";
import { MessageCircle, ArrowRight, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { ScoreBadge } from "@/components/crm/primitives/ScoreBadge";
import { StatusPill } from "@/components/crm/primitives/StatusPill";
import { EmptyState } from "@/components/crm/primitives/EmptyState";
import { buildWhatsAppUrl, defaultLeadGreeting, normalizeBrPhone } from "@/lib/utils/phone";
import type { HotLeadItem } from "./types";
import { relativeTime } from "./format";

const PAGE_SIZE = 6;

const POTENTIAL_LABEL: Record<HotLeadItem["temperatura"], string> = {
  QUENTE: "Potencial Alto",
  MORNO: "Potencial Médio",
  FRIO: "Potencial Baixo",
};

interface HotLeadsRankedListProps {
  leads: HotLeadItem[];
}

/** Leads Quentes (5.3 item 7): ranking por score determinístico com atalho wa.me. */
export function HotLeadsRankedList({ leads }: HotLeadsRankedListProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(leads.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const pageItems = leads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Leads Quentes</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              🔥 Prioridade
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Leads abertos ordenados pelo score determinístico</p>
        </div>
        <a href="/crm/leads" className="text-xs text-connect-blue hover:underline font-semibold flex items-center gap-1">
          Ver todos <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="Nenhum lead pontuado"
          description="Os leads aparecem aqui assim que recebem score (telefone, renda, visitas, propostas…)."
          className="flex-1"
        />
      ) : (
        <>
          <div className="space-y-2.5 flex-1">
            {pageItems.map((lead, idx) => {
              const rank = (page - 1) * PAGE_SIZE + idx + 1;
              const hasPhone = normalizeBrPhone(lead.telefone).length >= 10;
              return (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/80 border border-border/50 hover:border-primary/40 transition-all gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-card border border-border text-[11px] font-bold text-muted-foreground flex items-center justify-center flex-shrink-0">
                      {rank}º
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">{lead.nome}</span>
                        <StatusPill color="blue" size="sm" dot={false} className="uppercase shrink-0 max-w-[110px] truncate">
                          {lead.etapa}
                        </StatusPill>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {lead.corretor || "Sem corretor"} • {relativeTime(lead.atualizadoEm)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <ScoreBadge score={lead.score} size="sm" showPoints={true} />
                      <span className="text-[9px] text-muted-foreground block mt-0.5">
                        {POTENTIAL_LABEL[lead.temperatura]}
                      </span>
                    </div>

                    {hasPhone && (
                      <a
                        href={buildWhatsAppUrl(lead.telefone, defaultLeadGreeting(lead.nome))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors"
                        title="Abrir conversa no WhatsApp"
                        aria-label={`Abrir conversa no WhatsApp com ${lead.nome}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <a
                      href={`/crm/leads?lead=${lead.id}`}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      title="Ver detalhes do lead"
                      aria-label={`Ver detalhes de ${lead.nome}`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Página {page} de {totalPages} ({leads.length} {leads.length === 1 ? "lead" : "leads"})
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded-md border border-border hover:bg-muted disabled:opacity-40 transition-colors"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1 rounded-md border border-border hover:bg-muted disabled:opacity-40 transition-colors"
                aria-label="Próxima página"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
