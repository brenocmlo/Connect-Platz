"use client";

import { Dispatch, SetStateAction } from "react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "@/components/crm/leads/KanbanBoard";
import { findLeadStageIndex } from "@/components/crm/leads/leadCalculations";

interface UseLeadsActionsParams {
  leads: LeadDetail[];
  setLeads: Dispatch<SetStateAction<LeadDetail[]>>;
  stages: FunnelColumn[];
  selectedLead: LeadDetail | null;
  setSelectedLead: Dispatch<SetStateAction<LeadDetail | null>>;
  token: string | null;
  setToastMessage: (msg: string | null) => void;
  setDiscardLeadTarget?: (lead: LeadDetail | null) => void;
}

export function useLeadsActions({
  leads,
  setLeads,
  stages,
  selectedLead,
  setSelectedLead,
  token,
  setToastMessage,
  setDiscardLeadTarget,
}: UseLeadsActionsParams) {
  const handleDropLead = async (leadId: string, targetStageId: string) => {
    const targetStage = stages.find((s) => s.id === targetStageId);
    const isClosing = targetStage?.nome?.toLowerCase().includes("encerrado");

    if (isClosing && setDiscardLeadTarget) {
      const targetLead = leads.find((l) => l.id === leadId);
      if (targetLead) {
        setDiscardLeadTarget(targetLead);
      }
    }

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stageId: targetStageId } : l))
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, stageId: targetStageId } : null));
    }

    if (token) {
      try {
        const resolvedStageId = targetStage?.id || targetStageId;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedStageId);

        if (isUuid) {
          await fetch(`/api/leads/${leadId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ stageId: resolvedStageId }),
          });
        }
      } catch (err) {
        console.error("Erro ao mover lead:", err);
      }
    }
  };

  const handleAdvanceStage = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const currentIdx = findLeadStageIndex(lead, stages);
    if (currentIdx < stages.length - 1) {
      const nextStage = stages[currentIdx + 1];
      handleDropLead(leadId, nextStage.id);
      setToastMessage(`Lead avançado para "${nextStage.nome}"!`);
    } else {
      setToastMessage("Lead já está na última etapa do funil!");
    }
  };

  const handleChangeStage = (leadId: string, targetStageId: string) => {
    handleDropLead(leadId, targetStageId);
    const targetStage = stages.find((s) => s.id === targetStageId);
    setToastMessage(`Etapa alterada para "${targetStage?.nome || "Nova etapa"}"!`);
  };

  const handleMoveToBolsao = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, isBolsao: true } : l))
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, isBolsao: true } : null));
    }
    setToastMessage("Lead transferido para o Bolsão de Oportunidades!");
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setToastMessage("Lead excluído com sucesso.");
  };

  const handleUpdateTags = (leadId: string, tags: string[]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, tags } : l))
    );
    setToastMessage("Etiquetas atualizadas!");
  };

  const handleCreateManualLead = async (leadData: {
    nome: string;
    telefone: string;
    email?: string;
    empreendimentoInteresse?: string;
    temperatura?: "FRIO" | "MORNO" | "QUENTE";
    origem?: string;
    rendaDeclarada?: number;
    stageId?: string;
    funil?: string;
    observacoes?: string;
  }) => {
    const leadId = `lead-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newManualLead: LeadDetail = {
      id: leadId,
      nome: leadData.nome,
      telefone: leadData.telefone,
      email: leadData.email,
      empreendimentoInteresse: leadData.empreendimentoInteresse || "Reserva Imperial",
      temperatura: leadData.temperatura || "MORNO",
      source: leadData.origem || "Manual / Corretor",
      rendaDeclarada: leadData.rendaDeclarada || null,
      stageId: leadData.stageId || stages[0]?.id || "stage-1",
      score: leadData.temperatura === "QUENTE" ? 85 : leadData.temperatura === "MORNO" ? 60 : 38,
      observacoes: leadData.observacoes || null,
      tags: [
        leadData.temperatura === "QUENTE" ? "Cliente Quente" : "Potencial",
        leadData.origem || "Manual",
      ],
      createdAt: nowIso,
    };

    setLeads((prev) => [newManualLead, ...prev]);
    setToastMessage("Lead cadastrado com sucesso!");

    // Se informou observações iniciais, grava no histórico de abordagens local
    if (leadData.observacoes && typeof window !== "undefined") {
      try {
        const storageKey = `connect_platz_lead_abordagens_${leadId}`;
        const now = new Date();
        const timeStr = `Hoje às ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        const initialObs = [
          {
            id: `obs-init-${Date.now()}`,
            canal: "anotacao",
            desfecho: "respondeu",
            conteudo: leadData.observacoes,
            corretorNome: "Corretor Responsável",
            dataHora: timeStr,
          },
        ];
        localStorage.setItem(storageKey, JSON.stringify(initialObs));
      } catch {}
    }

    if (token) {
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(leadData),
        });
      } catch (err) {
        console.error("Erro ao persistir lead:", err);
      }
    }
  };

  return {
    handleDropLead,
    handleAdvanceStage,
    handleChangeStage,
    handleMoveToBolsao,
    handleDeleteLead,
    handleUpdateTags,
    handleCreateManualLead,
  };
}
