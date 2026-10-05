"use client";

import React from "react";
import {
  ArrowRight,
  Edit,
  Calendar,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "@/components/crm/leads/KanbanBoard";
import { getNextStage, findLeadStageIndex } from "@/components/crm/leads/leadCalculations";

interface LeadDrawerActionsProps {
  lead: LeadDetail;
  stages: FunnelColumn[];
  onAdvanceStage?: (leadId: string) => void;
  onChangeStage?: (leadId: string, stageId: string) => void;
  onEditLead?: (lead: LeadDetail) => void;
  onScheduleAppointment?: (lead: LeadDetail) => void;
  onMoveToBolsao?: (leadId: string) => void;
  onTakeoverBolsao?: (leadId: string) => void;
  onDeleteLead?: (leadId: string) => void;
}

export function LeadDrawerActions({
  lead,
  stages,
  onAdvanceStage,
  onChangeStage,
  onEditLead,
  onScheduleAppointment,
  onMoveToBolsao,
  onTakeoverBolsao,
  onDeleteLead,
}: LeadDrawerActionsProps) {
  const nextStage = getNextStage(lead, stages);
  const currentStageIdx = findLeadStageIndex(lead, stages);
  const currentStage = stages[currentStageIdx];

  return (
    <div className="border-t border-border bg-card/95 backdrop-blur-md p-4 pb-6 sm:pb-4 space-y-2.5 shadow-lg">
      {/* 1. BOTÃO PRINCIPAL DE AVANÇAR ETAPA + SELETOR RÁPIDO DE ETAPA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {nextStage ? (
          <button
            onClick={() => onAdvanceStage && onAdvanceStage(lead.id)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-connect-blue/20 hover:scale-[1.01] active:scale-95 transition-all"
            title={`Avançar para etapa: ${nextStage.nome}`}
          >
            <span>Avançar para {nextStage.nome}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Lead na Etapa Final ({currentStage?.nome || "Concluído"})</span>
          </div>
        )}

        {/* Dropdown para pular para qualquer etapa */}
        {stages.length > 0 && (
          <select
            value={currentStage?.id || lead.stageId}
            onChange={(e) => onChangeStage && onChangeStage(lead.id, e.target.value)}
            className="py-2.5 px-3 bg-muted border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue cursor-pointer"
            title="Alterar etapa diretamente"
          >
            {stages.map((st) => (
              <option key={st.id} value={st.id}>
                Etapa: {st.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 2. BOTÕES SECUNDÁRIOS DE AÇÃO: EDITAR, AGENDAR, BOLSÃO */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {/* Editar Lead */}
        <button
          onClick={() => onEditLead && onEditLead(lead)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-semibold transition-all hover:scale-[1.01] active:scale-95"
        >
          <Edit className="w-3.5 h-3.5 text-connect-blue" />
          <span>Editar Lead</span>
        </button>

        {/* Agendar Visita / Compromisso */}
        <button
          onClick={() => onScheduleAppointment && onScheduleAppointment(lead)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-semibold transition-all hover:scale-[1.01] active:scale-95"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          <span>Agendar Visita</span>
        </button>

        {/* Mover para Bolsão ou Assumir */}
        {lead.isBolsao ? (
          <button
            onClick={() => onTakeoverBolsao && onTakeoverBolsao(lead.id)}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-connect-blue text-white font-bold transition-all hover:scale-[1.01] active:scale-95"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assumir Lead</span>
          </button>
        ) : (
          <button
            onClick={() => onMoveToBolsao && onMoveToBolsao(lead.id)}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border bg-background hover:bg-amber-500/10 text-amber-500 hover:border-amber-500/30 font-semibold transition-all hover:scale-[1.01] active:scale-95"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Mover p/ Bolsão</span>
          </button>
        )}
      </div>
    </div>
  );
}
