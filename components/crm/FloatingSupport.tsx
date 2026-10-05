"use client";

import React, { useState } from "react";
import { HelpCircle, X, ExternalLink, MessageSquare, BookOpen, ShieldCheck } from "lucide-react";

export function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Popover de Suporte Rápido */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 mb-2 w-72 bg-card border border-border rounded-2xl shadow-2xl p-4 animate-fade-in-up">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-connect-blue/10 text-connect-blue flex items-center justify-center">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-foreground">Suporte Connect Platz</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              aria-label="Fechar suporte"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <a
              href="https://wa.me/558599999999?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20Connect%20Platz%20CRM"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-all group"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-[11px]">Suporte via WhatsApp</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
            </a>

            <a
              href="/crm/configuracoes"
              className="flex items-center justify-between p-2.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-all group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-connect-blue" />
                <span className="font-semibold text-[11px]">Manual de Operação</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">Docs</span>
            </a>

            <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-2 text-[10px] text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-connect-blue flex-shrink-0" />
              <span>SLA Operacional ativo em conformidade.</span>
            </div>
          </div>
        </div>
      )}

      {/* FAB circular primário (~40px) fixo no canto inferior direito (5.2) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-connect-blue hover:bg-connect-deep-blue text-white shadow-lg shadow-connect-blue/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Ajuda e Suporte"
        aria-label="Ajuda e Suporte"
      >
        {isOpen ? <X className="w-4 h-4" /> : <HelpCircle className="w-5 h-5" />}
      </button>
    </div>
  );
}
