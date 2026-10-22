"use client";

import React, { useState } from "react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { KanbanColumn } from "./KanbanColumn";

export interface FunnelColumn {
  id: string;
  nome: string;
  posicao: number;
  cor: string;
  slaMinutes: number | null;
}

interface KanbanBoardProps {
  stages: FunnelColumn[];
  leads: LeadDetail[];
  onSelectLead: (lead: LeadDetail) => void;
  onDropLead: (leadId: string, targetStageId: string) => void | Promise<unknown>;
  onAdvanceStage?: (leadId: string) => void;
  onChangeStage?: (leadId: string, stageId: string) => void;
  onMoveToBolsao?: (leadId: string) => void;
  onDeleteLead?: (leadId: string) => void;
  onUpdateTags?: (leadId: string, tags: string[]) => void;
  onEditLead?: (lead: LeadDetail) => void;
  onScheduleVisit?: (lead: LeadDetail) => void;
  onOpenWhatsApp?: (lead: LeadDetail) => void;
}

export function KanbanBoard({
  stages,
  leads,
  onSelectLead,
  onDropLead,
  onAdvanceStage,
  onChangeStage,
  onMoveToBolsao,
  onDeleteLead,
  onUpdateTags,
  onEditLead,
  onScheduleVisit,
  onOpenWhatsApp,
}: KanbanBoardProps) {
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
    setDraggingLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggingLeadId(null);
  };

  // O toast "Lead atualizado com sucesso!" é exibido pelo handler da página somente após o PATCH confirmar
  const handleDropLead = (leadId: string, stageId: string) => {
    setDraggingLeadId(null);
    onDropLead(leadId, stageId);
  };

  return (
    <div className="relative">
      {/* Board com scroll horizontal fluido */}
      <div className="flex gap-4 items-start overflow-x-auto pb-4 pt-1 max-w-full min-w-full snap-x snap-mandatory sm:snap-none scroll-smooth">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stageId === stage.id);

          return (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              stages={stages}
              leads={stageLeads}
              draggingLeadId={draggingLeadId}
              onSelectLead={onSelectLead}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDropLead={handleDropLead}
              onAdvanceStage={onAdvanceStage}
              onChangeStage={onChangeStage}
              onMoveToBolsao={onMoveToBolsao}
              onDeleteLead={onDeleteLead}
              onUpdateTags={onUpdateTags}
              onEditLead={onEditLead}
              onScheduleVisit={onScheduleVisit}
              onOpenWhatsApp={onOpenWhatsApp}
            />
          );
        })}
      </div>
    </div>
  );
}
