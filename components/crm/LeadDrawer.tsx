"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, Clock } from "lucide-react";
import { LeadDrawerHeader } from "./lead-drawer/LeadDrawerHeader";
import { LeadDetailsSections } from "./lead-drawer/LeadDetailsSections";
import { LeadHistoryTimeline } from "./lead-drawer/LeadHistoryTimeline";
import { LeadDrawerActions } from "./lead-drawer/LeadDrawerActions";
import { FunnelColumn } from "./leads/KanbanBoard";

export interface LeadDetail {
  id: string;
  nome: string;
  telefone: string;
  email?: string | null;
  cpf?: string | null;
  rg?: string | null;
  estadoCivil?: string | null;
  regimeCasamento?: string | null;
  profissao?: string | null;
  temperatura: "FRIO" | "MORNO" | "QUENTE";
  source: string;
  adId?: string | null;
  formId?: string | null;
  campaignName?: string | null;
  adName?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  stageId: string;
  slaDueAt?: string | null;
  slaBreached?: boolean;
  isBolsao?: boolean;
  tipoOcupacaoCredito?: "CLT" | "AUTONOMO" | "EMPRESARIO" | "OUTRO" | null;
  rendaDeclarada?: number | null;
  rendaEspecificaAutonomo?: number | null;
  faixaRenda?: string | null;
  bairrosInteresse?: string[];
  corretor?: { id: string; nome: string } | null;
  opportunityValue?: number | null;
  empreendimentoInteresse?: string | null;
  cidadeInteresse?: string | null;
  compromissosCount?: number | null;
  tags?: string[];
  createdAt?: string | null;
  score?: number | null;
}

interface LeadDrawerProps {
  lead: LeadDetail | null;
  stages?: FunnelColumn[];
  onClose: () => void;
  onUpdateLead?: (updated: LeadDetail) => void;
  onAdvanceStage?: (leadId: string) => void;
  onChangeStage?: (leadId: string, stageId: string) => void;
  onEditLead?: (lead: LeadDetail) => void;
  onTakeoverBolsao?: (leadId: string) => void;
  onMoveToBolsao?: (leadId: string) => void;
  onScheduleAppointment?: (lead: LeadDetail) => void;
  onDeleteLead?: (leadId: string) => void;
}

export function LeadDrawer({
  lead,
  stages = [],
  onClose,
  onAdvanceStage,
  onChangeStage,
  onEditLead,
  onTakeoverBolsao,
  onMoveToBolsao,
  onScheduleAppointment,
  onDeleteLead,
}: LeadDrawerProps) {
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Bloqueia scroll do body enquanto o drawer estiver aberto em mobile
    if (lead) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lead]);

  if (!lead || !mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* 1. OVERLAY ESCURECIDO GLOBAL */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
      />

      {/* 2. DRAWER LATERAL DIREITO (Full width no mobile, max-w-[440px] no desktop) */}
      <div className="relative w-full sm:max-w-[440px] bg-card border-l border-border h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        {/* Cabeçalho do Drawer com Fechar ✕, Prontuário, Nome e Contato */}
        <LeadDrawerHeader
          lead={lead}
          onClose={onClose}
          onTakeoverBolsao={onTakeoverBolsao}
        />

        {/* Navegação entre Detalhes e Histórico */}
        <div className="flex border-b border-border bg-muted/40 px-4 text-xs font-semibold select-none flex-shrink-0">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "details"
                ? "border-connect-blue text-connect-blue font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Detalhes & Oportunidades
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "history"
                ? "border-connect-blue text-connect-blue font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Histórico & Timeline
          </button>
        </div>

        {/* Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {activeTab === "details" ? (
            <LeadDetailsSections
              lead={lead}
              onScheduleAppointment={() => onScheduleAppointment && onScheduleAppointment(lead)}
            />
          ) : (
            <LeadHistoryTimeline leadName={lead.nome} leadId={lead.id} />
          )}
        </div>

        {/* BARRA DE AÇÕES FIXA NO RODAPÉ (Sticky Action Footer) */}
        <LeadDrawerActions
          lead={lead}
          stages={stages}
          onAdvanceStage={onAdvanceStage}
          onChangeStage={onChangeStage}
          onEditLead={onEditLead}
          onScheduleAppointment={onScheduleAppointment}
          onMoveToBolsao={onMoveToBolsao}
          onTakeoverBolsao={onTakeoverBolsao}
          onDeleteLead={onDeleteLead}
        />
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
