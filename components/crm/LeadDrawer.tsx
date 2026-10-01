"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Clock,
  Flame,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  ExternalLink,
  FileText,
} from "lucide-react";
import { SlaBadge } from "./SlaBadge";
import { LeadInfoTab } from "./lead-drawer/LeadInfoTab";
import { LeadTimelineTab } from "./lead-drawer/LeadTimelineTab";
import { LeadTrackingTab } from "./lead-drawer/LeadTrackingTab";
import { LeadDocsTab } from "./lead-drawer/LeadDocsTab";

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
}

interface LeadDrawerProps {
  lead: LeadDetail | null;
  onClose: () => void;
  onUpdateLead?: (updated: LeadDetail) => void;
  onTakeoverBolsao?: (leadId: string) => void;
}

export function LeadDrawer({
  lead,
  onClose,
  onTakeoverBolsao,
}: LeadDrawerProps) {
  const [activeTab, setActiveTab] = useState<"info" | "timeline" | "tracking" | "docs">("info");

  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-fadeIn">
      {/* SHEET LATERAL DIREITO COM ANIMAÇÃO SLIDE-IN */}
      <div className="w-full max-w-2xl bg-[#0B101B] border-l border-[#1C2537] h-full flex flex-col shadow-2xl overflow-hidden animate-slideInRight">
        {/* 1. CABEÇALHO DA FICHA */}
        <div className="p-6 border-b border-[#1C2537] bg-[#070B12]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-connect-blue/20 text-blue-400 border border-connect-blue/30 uppercase tracking-wider">
                Prontuário Comercial 360°
              </span>
              <SlaBadge dueAt={lead.slaDueAt} breached={lead.slaBreached} />
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#151D2C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                {lead.nome}
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    lead.temperatura === "QUENTE"
                      ? "bg-red-950 text-red-400 border border-red-800"
                      : lead.temperatura === "MORNO"
                      ? "bg-amber-950 text-amber-400 border border-amber-800"
                      : "bg-blue-950 text-blue-400 border border-blue-800"
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  {lead.temperatura}
                </span>
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="font-mono text-slate-300">{lead.telefone}</span>
                {lead.email && <span>• {lead.email}</span>}
              </p>
            </div>

            {/* BOTÃO EXTERNO WHATSAPP WEB */}
            <a
              href={`https://wa.me/55${lead.telefone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              Chamar no WhatsApp Web
            </a>
          </div>

          {/* BANNER SE ESTIVER NO BOLSÃO */}
          {lead.isBolsao && (
            <div className="mt-4 p-3 bg-connect-blue/15 border border-connect-blue/40 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-blue-300">
                <AlertTriangle className="w-4 h-4 text-connect-blue" />
                <span>Este lead está no Bolsão Compartilhado por falta de atendimento no SLA.</span>
              </div>
              <button
                onClick={() => {
                  if (onTakeoverBolsao) onTakeoverBolsao(lead.id);
                  alert("Lead resgatado com sucesso! O temporizador de SLA de 20 minutos foi iniciado.");
                  onClose();
                }}
                className="bg-connect-blue hover:bg-[#0D478F] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Assumir Lead
              </button>
            </div>
          )}
        </div>

        {/* 2. ABAS DO DRAWER */}
        <div className="flex border-b border-[#1C2537] bg-[#0A0E17] px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "info"
                ? "border-connect-blue text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Dados & Crédito
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "timeline"
                ? "border-connect-blue text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Linha do Tempo & Voz
          </button>
          <button
            onClick={() => setActiveTab("tracking")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "tracking"
                ? "border-connect-blue text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Captação Meta Ads
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "docs"
                ? "border-connect-blue text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Anexos & Documentos
          </button>
        </div>

        {/* 3. CONTEÚDO DAS ABAS MODULARIZADAS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "info" && <LeadInfoTab lead={lead} />}
          {activeTab === "timeline" && <LeadTimelineTab />}
          {activeTab === "tracking" && <LeadTrackingTab lead={lead} />}
          {activeTab === "docs" && <LeadDocsTab />}
        </div>
      </div>
    </div>
  );
}
