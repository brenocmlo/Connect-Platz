"use client";

// Ações do módulo de Leads persistidas via API. Atualizações otimistas são desfeitas em caso de falha,
// e o toast de sucesso só aparece depois da confirmação do servidor.

import { Dispatch, SetStateAction } from "react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "@/components/crm/leads/KanbanBoard";
import { NewLeadFormData } from "@/components/crm/leads/NewLeadModal";
import { findLeadStageIndex } from "@/components/crm/leads/leadCalculations";
import { createLead, patchLead, deleteLead, addTimelineEntry } from "./leadsApi";

export type NotifyFn = (message: string, type?: "success" | "error" | "info") => void;

interface UseLeadsActionsParams {
  leads: LeadDetail[];
  setLeads: Dispatch<SetStateAction<LeadDetail[]>>;
  stages: FunnelColumn[];
  funnelId: string | null;
  selectedLead: LeadDetail | null;
  setSelectedLead: Dispatch<SetStateAction<LeadDetail | null>>;
  replaceLead: (lead: LeadDetail) => void;
  notify: NotifyFn;
  setDiscardLeadTarget?: (lead: LeadDetail | null) => void;
}

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

export function useLeadsActions({
  leads,
  setLeads,
  stages,
  funnelId,
  selectedLead,
  setSelectedLead,
  replaceLead,
  notify,
  setDiscardLeadTarget,
}: UseLeadsActionsParams) {
  /** Aplica um patch local (otimista) e devolve a função que desfaz. */
  const applyLocal = (leadId: string, patch: Partial<LeadDetail>) => {
    const previous = leads.find((l) => l.id === leadId);
    replaceLead({ ...(previous as LeadDetail), ...patch, id: leadId });
    return () => previous && replaceLead(previous);
  };

  const moveToStage = async (leadId: string, targetStageId: string, successMessage: string) => {
    const lead = leads.find((l) => l.id === leadId);
    const targetStage = stages.find((s) => s.id === targetStageId);
    if (!lead || !targetStage || lead.stageId === targetStageId) return false;

    const undo = applyLocal(leadId, {
      stageId: targetStageId,
      stage: { id: targetStage.id, nome: targetStage.nome, cor: targetStage.cor },
    });
    try {
      const updated = await patchLead(leadId, { stageId: targetStageId });
      replaceLead(updated);
      notify(successMessage);
      if (targetStage.nome.toLowerCase().includes("encerrado") && setDiscardLeadTarget) {
        setDiscardLeadTarget(updated);
      }
      return true;
    } catch (err) {
      undo();
      notify(errorMessage(err, "Não foi possível mover o lead."), "error");
      return false;
    }
  };

  const handleDropLead = (leadId: string, targetStageId: string) =>
    moveToStage(leadId, targetStageId, "Lead atualizado com sucesso!");

  const handleAdvanceStage = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const currentIdx = findLeadStageIndex(lead, stages);
    if (currentIdx >= stages.length - 1) {
      notify("Lead já está na última etapa do funil!", "info");
      return;
    }
    const nextStage = stages[currentIdx + 1];
    moveToStage(leadId, nextStage.id, `Lead avançado para "${nextStage.nome}"!`);
  };

  const handleChangeStage = (leadId: string, targetStageId: string) => {
    const targetStage = stages.find((s) => s.id === targetStageId);
    moveToStage(leadId, targetStageId, `Etapa alterada para "${targetStage?.nome || "nova etapa"}"!`);
  };

  const runAction = async (leadId: string, body: Record<string, unknown>, success: string, fallback: string) => {
    try {
      const updated = await patchLead(leadId, body);
      replaceLead(updated);
      notify(success);
      return true;
    } catch (err) {
      notify(errorMessage(err, fallback), "error");
      return false;
    }
  };

  const handleMoveToBolsao = (leadId: string) =>
    runAction(leadId, { action: "MOVER_BOLSAO" }, "Lead transferido para o Bolsão de Oportunidades!", "Não foi possível mover o lead para o bolsão.");

  const handleTakeoverBolsao = (leadId: string) =>
    runAction(leadId, { action: "ASSUMIR_BOLSAO" }, "Lead assumido com sucesso! SLA de 20 minutos iniciado.", "Não foi possível assumir o lead.");

  const handleDeleteLead = async (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (typeof window !== "undefined" && !window.confirm(`Excluir definitivamente o lead "${lead?.nome || ""}"?`)) return;
    try {
      await deleteLead(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      if (selectedLead?.id === leadId) setSelectedLead(null);
      notify("Lead excluído com sucesso.");
    } catch (err) {
      notify(errorMessage(err, "Não foi possível excluir o lead."), "error");
    }
  };

  const handleUpdateTags = async (leadId: string, tags: string[]) => {
    const undo = applyLocal(leadId, { tags });
    try {
      replaceLead(await patchLead(leadId, { tags }));
      notify("Etiquetas atualizadas!");
    } catch (err) {
      undo();
      notify(errorMessage(err, "Não foi possível salvar as etiquetas."), "error");
    }
  };

  const handleCreateManualLead = async (form: NewLeadFormData): Promise<boolean> => {
    try {
      const created = await createLead({
        nome: form.nome,
        telefone: form.telefone,
        email: form.email,
        cpf: form.cpf,
        bairro: form.bairro,
        cidade: form.cidade,
        empreendimentoInteresse: form.empreendimentoInteresse,
        origem: form.origem,
        renda: form.rendaDeclarada,
        etapaId: form.stageId,
        funnelId,
        observacoes: form.observacoes,
      });
      setLeads((prev) => [created, ...prev]);
      notify("Lead cadastrado com sucesso!");
      return true;
    } catch (err) {
      notify(errorMessage(err, "Não foi possível cadastrar o lead."), "error");
      return false;
    }
  };

  const handleSaveEditLead = async (original: LeadDetail, updated: LeadDetail): Promise<boolean> => {
    try {
      const saved = await patchLead(updated.id, {
        nome: updated.nome,
        telefone: updated.telefone,
        email: updated.email || "",
        cpf: updated.cpf || "",
        rg: updated.rg || "",
        estadoCivil: updated.estadoCivil || "",
        profissao: updated.profissao || "",
        rendaDeclarada: updated.rendaDeclarada ?? undefined,
        origem: updated.source !== original.source ? updated.source : undefined,
        observacoes: updated.observacoes || "",
        bairrosInteresse: updated.bairrosInteresse,
        ...(updated.stageId !== original.stageId ? { stageId: updated.stageId } : {}),
      });
      replaceLead(saved);
      notify("Lead atualizado com sucesso!");
      return true;
    } catch (err) {
      notify(errorMessage(err, "Não foi possível salvar o lead."), "error");
      return false;
    }
  };

  const handleConfirmDiscard = async (leadId: string, motivo: string, obs?: string) => {
    try {
      await addTimelineEntry(leadId, {
        tipo: "descarte",
        motivo,
        conteudo: `Oportunidade encerrada. Motivo: ${motivo}${obs ? ` — ${obs}` : ""}`,
      });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, statusLabel: `Encerrado: ${motivo}` } : l)));
      setDiscardLeadTarget?.(null);
      notify(`Oportunidade encerrada (${motivo}).`);
    } catch (err) {
      notify(errorMessage(err, "Não foi possível registrar o motivo do encerramento."), "error");
    }
  };

  return {
    handleDropLead,
    handleAdvanceStage,
    handleChangeStage,
    handleMoveToBolsao,
    handleTakeoverBolsao,
    handleDeleteLead,
    handleUpdateTags,
    handleCreateManualLead,
    handleSaveEditLead,
    handleConfirmDiscard,
  };
}
