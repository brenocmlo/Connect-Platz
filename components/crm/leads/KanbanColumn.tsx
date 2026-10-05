"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "./KanbanBoard";
import { LeadCard } from "./LeadCard";

interface KanbanColumnProps {
  stage: FunnelColumn;
  stages?: FunnelColumn[];
  leads: LeadDetail[];
  draggingLeadId: string | null;
  onSelectLead: (lead: LeadDetail) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragEnd: () => void;
  onDropLead: (leadId: string, stageId: string) => void;
  onAdvanceStage?: (leadId: string) => void;
  onChangeStage?: (leadId: string, stageId: string) => void;
  onMoveToBolsao?: (leadId: string) => void;
  onDeleteLead?: (leadId: string) => void;
  onUpdateTags?: (leadId: string, tags: string[]) => void;
  onEditLead?: (lead: LeadDetail) => void;
  onScheduleVisit?: (lead: LeadDetail) => void;
}

export function KanbanColumn({
  stage,
  stages = [],
  leads,
  draggingLeadId,
  onSelectLead,
  onDragStart,
  onDragEnd,
  onDropLead,
  onAdvanceStage,
  onChangeStage,
  onMoveToBolsao,
  onDeleteLead,
  onUpdateTags,
  onEditLead,
  onScheduleVisit,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const leadId = e.dataTransfer.getData("leadId") || draggingLeadId;
    if (leadId) {
      onDropLead(leadId, stage.id);
    }
  };

  const totalLeads = leads.length;
  const totalPages = Math.ceil(totalLeads / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const displayedLeads = leads.slice(startIndex, startIndex + pageSize);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-80 flex flex-col flex-shrink-0 rounded-2xl bg-card/60 backdrop-blur-xs border transition-all duration-200 ${
        isOver
          ? "border-connect-blue bg-connect-blue/5 ring-2 ring-connect-blue/20"
          : "border-border shadow-sm"
      }`}
    >
      {/* 1. CABEÇALHO DA COLUNA (Bolinha colorida + Nome + Contador em pílula cinza) */}
      <div className="p-3.5 border-b border-border/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0 shadow-xs"
            style={{ backgroundColor: stage.cor }}
          />
          <h3 className="text-xs font-bold text-foreground truncate tracking-tight">
            {stage.nome}
          </h3>
          <span className="text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full flex-shrink-0">
            {totalLeads}
          </span>
        </div>

        {stage.slaMinutes && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono flex-shrink-0">
            <Clock className="w-3 h-3 text-muted-foreground/80" />
            {stage.slaMinutes}m
          </span>
        )}
      </div>

      {/* 2. PAGINAÇÃO INTERNA DA PRIMEIRA COLUNA (Seção 5.4: ‹ 1–25 de 979 ›) */}
      {stage.posicao === 1 && totalLeads > pageSize && (
        <div className="px-3 py-1.5 bg-muted/40 border-b border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {startIndex + 1}–{Math.min(startIndex + pageSize, totalLeads)} de {totalLeads}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Próxima página"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. LISTA DE CARDS COM SCROLL VERTICAL PRÓPRIO */}
      <div className="p-2.5 overflow-y-auto space-y-2.5 max-h-[calc(100vh-280px)] min-h-[160px]">
        {displayedLeads.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground/60 italic flex flex-col items-center justify-center">
            <span>Nenhum lead nesta etapa</span>
          </div>
        ) : (
          displayedLeads.map((lead) => {
            const isDragging = draggingLeadId === lead.id;
            return (
              <LeadCard
                key={lead.id}
                lead={lead}
                stages={stages}
                isDragging={isDragging}
                isGhost={isDragging}
                onSelectLead={onSelectLead}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onAdvanceStage={onAdvanceStage}
                onChangeStage={onChangeStage}
                onMoveToBolsao={onMoveToBolsao}
                onDeleteLead={onDeleteLead}
                onUpdateTags={onUpdateTags}
                onEditLead={onEditLead}
                onScheduleVisit={onScheduleVisit}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
