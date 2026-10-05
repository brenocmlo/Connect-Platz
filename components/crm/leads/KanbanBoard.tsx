"use client";

import React, { useState } from "react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { KanbanColumn } from "./KanbanColumn";
import { ToastFeedback } from "@/components/crm/primitives";

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
  onDropLead: (leadId: string, targetStageId: string) => void;
  onAdvanceStage?: (leadId: string) => void;
  onChangeStage?: (leadId: string, stageId: string) => void;
  onMoveToBolsao?: (leadId: string) => void;
  onDeleteLead?: (leadId: string) => void;
  onUpdateTags?: (leadId: string, tags: string[]) => void;
  onEditLead?: (lead: LeadDetail) => void;
  onScheduleVisit?: (lead: LeadDetail) => void;
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
}: KanbanBoardProps) {
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
    setDraggingLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggingLeadId(null);
  };

  const handleDropLead = (leadId: string, stageId: string) => {
    setDraggingLeadId(null);
    onDropLead(leadId, stageId);
    // 5.4 e 5.11 Toast discreto no canto inferior direito
    setToastMessage("Lead atualizado com sucesso!");
  };

  return (
    <div className="relative">
      {/* Board com scroll horizontal fluido */}
      <div className="flex gap-4 items-start overflow-x-auto pb-4 pt-1 max-w-full min-w-full">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => {
            // 1. Correspondência exata por stageId
            if (l.stageId === stage.id) return true;
            // 2. Correspondência por ID do objeto stage
            if ((l as any).stage?.id === stage.id) return true;
            // 3. Correspondência por posição ordinal (1..7)
            const leadPos = (l as any).stage?.posicao;
            if (leadPos !== undefined && leadPos === stage.posicao) return true;
            // 4. Correspondência entre stage-X e posicao X
            if (l.stageId === `stage-${stage.posicao}`) return true;
            if (stage.id === `stage-${leadPos}`) return true;
            // 5. Fallback para primeira etapa
            if (!l.stageId && stage.posicao === 1) return true;
            return false;
          });

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
            />
          );
        })}
      </div>

      {/* Toast Feedback de Movimentação */}
      <ToastFeedback
        message={toastMessage}
        type="success"
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
