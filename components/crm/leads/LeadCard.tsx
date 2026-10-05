"use client";

import React from "react";
import {
  Mail,
  Phone,
  Banknote,
  Megaphone,
  Building2,
  Calendar,
  Bell,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { ScoreBadge, LeadTag } from "@/components/crm/primitives";
import { LeadCardMenu } from "./LeadCardMenu";
import { useCrm } from "@/components/crm/CrmContext";
import { FunnelColumn } from "./KanbanBoard";
import { getNextStage, findLeadStageIndex } from "./leadCalculations";

interface LeadCardProps {
  lead: LeadDetail;
  stages?: FunnelColumn[];
  isDragging?: boolean;
  isGhost?: boolean;
  onSelectLead: (lead: LeadDetail) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragEnd?: () => void;
  onAdvanceStage?: (leadId: string) => void;
  onChangeStage?: (leadId: string, stageId: string) => void;
  onMoveToBolsao?: (leadId: string) => void;
  onDeleteLead?: (leadId: string) => void;
  onUpdateTags?: (leadId: string, tags: string[]) => void;
  onEditLead?: (lead: LeadDetail) => void;
  onScheduleVisit?: (lead: LeadDetail) => void;
}

export function LeadCard({
  lead,
  stages = [],
  isDragging = false,
  isGhost = false,
  onSelectLead,
  onDragStart,
  onDragEnd,
  onAdvanceStage,
  onChangeStage,
  onMoveToBolsao,
  onDeleteLead,
  onUpdateTags,
  onEditLead,
  onScheduleVisit,
}: LeadCardProps) {
  const { hideValues, formatMoney } = useCrm();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("");
  };

  const getRelativeTime = (dateStr?: string | null) => {
    if (!dateStr) return "há 12 min";
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      if (diffMinutes < 60) return `há ${diffMinutes || 1} min`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `há ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      return `há ${diffDays}d`;
    } catch {
      return "recente";
    }
  };

  const rawPhone = lead.telefone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/55${rawPhone}`;

  // Score determinístico
  const scoreValue =
    lead.score ??
    (lead.temperatura === "QUENTE" ? 85 : lead.temperatura === "MORNO" ? 60 : 38);

  const opportunityValueFormatted = lead.opportunityValue
    ? formatMoney(lead.opportunityValue)
    : "R$ 380.000,00";

  const nextStage = getNextStage(lead, stages);
  const currentStageIdx = findLeadStageIndex(lead, stages);
  const currentStage = stages[currentStageIdx];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onDragEnd={onDragEnd}
      onClick={() => onSelectLead(lead)}
      className={`group relative bg-card rounded-xl border p-3 transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
        isGhost
          ? "opacity-40 border-dashed border-primary"
          : isDragging
          ? "border-connect-blue shadow-2xl scale-[1.02] rotate-1 z-30"
          : "border-border hover:border-connect-blue/50 hover:shadow-md"
      }`}
    >
      {/* 1. TOPO: Avatar com iniciais + Nome em negrito + tempo + menu ⋮ */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-connect-blue text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 shadow-sm">
            {getInitials(lead.nome)}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-foreground truncate group-hover:text-connect-blue transition-colors">
              {lead.nome}
            </h4>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">
              {getRelativeTime(lead.createdAt)}
            </span>
          </div>
        </div>

        <LeadCardMenu
          lead={lead}
          onOpenDetails={() => onSelectLead(lead)}
          onEdit={() => (onEditLead ? onEditLead(lead) : onSelectLead(lead))}
          onAdvanceStage={() => onAdvanceStage && onAdvanceStage(lead.id)}
          onAddReminder={() => alert(`Lembrete adicionado para ${lead.nome}`)}
          onScheduleVisit={() => (onScheduleVisit ? onScheduleVisit(lead) : onSelectLead(lead))}
          onMoveToBolsao={() => onMoveToBolsao && onMoveToBolsao(lead.id)}
          onDelete={() => onDeleteLead && onDeleteLead(lead.id)}
          onUpdateTags={(tags) => onUpdateTags && onUpdateTags(lead.id, tags)}
        />
      </div>

      {/* 2. LINHAS DE META COM ÍCONES LUCIDE 12-14px */}
      <div className="space-y-1.5 text-[11px] text-muted-foreground mb-3 font-sans">
        {/* Email */}
        {lead.email && (
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}

        {/* Telefone + Ações Rápidas (Discar + WhatsApp wa.me) */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 truncate">
            <Phone className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0" />
            <span className="font-mono text-xs">{lead.telefone}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <a
              href={`tel:${rawPhone}`}
              className="p-1 rounded-md text-connect-blue hover:bg-connect-blue/10 transition-colors"
              title="Ligar"
              aria-label="Ligar para lead"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded-md text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors"
              title="Abrir WhatsApp Web"
              aria-label="Chamar no WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Renda */}
        {lead.rendaDeclarada && (
          <div className="flex items-center gap-1.5">
            <Banknote className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0" />
            <span>
              Renda:{" "}
              <strong className="text-foreground">
                {hideValues ? "••••" : formatMoney(lead.rendaDeclarada)}
              </strong>
            </span>
          </div>
        )}

        {/* Oportunidade */}
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0" />
          <span className="truncate">
            Oportunidade:{" "}
            <strong className="text-foreground font-bold">
              {hideValues ? "••••" : opportunityValueFormatted}
            </strong>
          </span>
        </div>

        {/* Campanha */}
        {lead.campaignName && (
          <div className="flex items-center gap-1.5 truncate">
            <Megaphone className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0" />
            <span className="truncate">{lead.campaignName}</span>
          </div>
        )}

        {/* Empreendimento + Cidade */}
        {(lead.empreendimentoInteresse || lead.bairrosInteresse?.[0]) && (
          <div className="flex items-center gap-1.5 truncate text-[10px]">
            <Building2 className="w-3 h-3 text-muted-foreground/70 flex-shrink-0" />
            <span className="truncate">
              {lead.empreendimentoInteresse || "Reserva dos Lagos"} •{" "}
              {lead.cidadeInteresse || lead.bairrosInteresse?.[0] || "Centro"}
            </span>
          </div>
        )}

        {/* Data de captação */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <Calendar className="w-3 h-3 text-muted-foreground/70 flex-shrink-0" />
          <span>Captado em: {new Date(lead.createdAt || Date.now()).toLocaleDateString("pt-BR")}</span>
        </div>
      </div>

      {/* 3. TAGS & SCORE (Pílulas sólidas com texto branco 11px) */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
        {/* Corretor responsável */}
        {lead.corretor?.nome && (
          <LeadTag variant="responsible">
            {lead.corretor.nome.split(" ")[0]}
          </LeadTag>
        )}

        {/* Status de prioridade / temperatura */}
        {lead.temperatura === "QUENTE" && <LeadTag variant="hot">Cliente Quente</LeadTag>}
        {lead.slaBreached && <LeadTag variant="urgent">Urgente</LeadTag>}

        {/* Tags personalizadas */}
        {lead.tags?.slice(0, 2).map((t) => (
          <LeadTag key={t} variant="followup">
            {t}
          </LeadTag>
        ))}

        {/* Origem */}
        <LeadTag variant="origin">{lead.source}</LeadTag>
      </div>

      {/* 4. SCORE BADGE & COMPROMISSOS */}
      <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs">
        <ScoreBadge score={scoreValue} size="sm" />

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
          <Bell className="w-3 h-3 text-muted-foreground/80" />
          <span>Compromissos ({lead.compromissosCount || 1})</span>
        </div>
      </div>

      {/* 5. AÇÕES RÁPIDAS NO CARD (Mobile Friendly: Avançar Etapa + Mudar Etapa) */}
      <div
        className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {nextStage ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onAdvanceStage) onAdvanceStage(lead.id);
            }}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-connect-blue/10 hover:bg-connect-blue text-connect-blue hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
            title={`Avançar para: ${nextStage.nome}`}
          >
            <span>Avançar Etapa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex-1 py-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Etapa Final</span>
          </div>
        )}

        {stages && stages.length > 0 && (
          <select
            value={currentStage?.id || lead.stageId}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              if (onChangeStage) onChangeStage(lead.id, e.target.value);
            }}
            className="text-[10px] bg-background border border-border rounded-lg px-2 py-1.5 text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-connect-blue cursor-pointer max-w-[125px] truncate"
            title="Alterar etapa diretamente"
          >
            {stages.map((st) => (
              <option key={st.id} value={st.id}>
                {st.nome}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
