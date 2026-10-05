"use client";

import React from "react";
import { X, MessageSquare, Phone, AlertTriangle, UserCheck, Flame } from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { SlaBadge } from "@/components/crm/SlaBadge";

interface LeadDrawerHeaderProps {
  lead: LeadDetail;
  onClose: () => void;
  onTakeoverBolsao?: (leadId: string) => void;
}

export function LeadDrawerHeader({
  lead,
  onClose,
  onTakeoverBolsao,
}: LeadDrawerHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("");
  };

  const rawPhone = lead.telefone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/55${rawPhone}`;

  return (
    <div className="p-5 border-b border-border bg-card">
      {/* Topo do Header: Prontuário 360°, SLA Badge e Botão Fechar ✕ */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-connect-blue/15 text-connect-blue border border-connect-blue/30 uppercase tracking-wider">
            Prontuário 360°
          </span>
          <SlaBadge dueAt={lead.slaDueAt} breached={lead.slaBreached} />
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted bg-muted/60 border border-border transition-colors shadow-xs"
          aria-label="Fechar prontuário"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Identificação do Lead: Avatar, Nome, Telefone, Ligar e WhatsApp Direto */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-connect-blue text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">
            {getInitials(lead.nome)}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-foreground truncate tracking-tight flex items-center gap-1.5">
              {lead.nome}
              {lead.temperatura === "QUENTE" && (
                <Flame className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              )}
            </h2>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {lead.telefone}
            </p>
          </div>
        </div>

        {/* Ações Rápidas: Ligar + WhatsApp Web */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <a
            href={`tel:${rawPhone}`}
            className="p-2 rounded-xl border border-border bg-background hover:bg-connect-blue/10 text-connect-blue transition-colors shadow-xs"
            title="Ligar para o lead"
            aria-label="Ligar para o lead"
          >
            <Phone className="w-4 h-4" />
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Banner de Bolsão (se aplicável) */}
      {lead.isBolsao && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-600 font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Lead no Bolsão Compartilhado por estouro de SLA.</span>
          </div>

          <button
            onClick={() => {
              if (onTakeoverBolsao) onTakeoverBolsao(lead.id);
            }}
            className="bg-connect-blue hover:bg-connect-deep-blue text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 flex-shrink-0"
          >
            <UserCheck className="w-3 h-3" />
            Assumir
          </button>
        </div>
      )}
    </div>
  );
}
