"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/components/crm/CrmContext";
import { LeadDrawer, LeadDetail } from "@/components/crm/LeadDrawer";
import { KanbanBoard, FunnelColumn } from "@/components/crm/leads/KanbanBoard";
import { LeadsTable } from "@/components/crm/leads/LeadsTable";
import { BolsaoSection } from "@/components/crm/leads/BolsaoSection";
import { NewLeadModal } from "@/components/crm/leads/NewLeadModal";
import { LeadStatCards } from "@/components/crm/leads/LeadStatCards";
import { LeadFilterSheet } from "@/components/crm/leads/LeadFilterSheet";
import { LeadsHeader } from "@/components/crm/leads/LeadsHeader";
import { LeadsSubBar } from "@/components/crm/leads/LeadsSubBar";
import { LeadsSearchBar } from "@/components/crm/leads/LeadsSearchBar";
import { EditLeadModal } from "@/components/crm/leads/EditLeadModal";
import { NewAppointmentModal } from "@/components/crm/agenda/NewAppointmentModal";
import { initialSampleLeads } from "@/components/crm/leads/sampleLeads";
import { useLeadsFilter } from "@/components/crm/leads/useLeadsFilter";
import { findLeadStageIndex, defaultStages } from "@/components/crm/leads/leadCalculations";
import { ToastFeedback } from "@/components/crm/primitives";

export default function LeadsPage() {
  const { token } = useCrm();
  const [viewMode, setViewMode] = useState<"kanban" | "table" | "bolsao">("kanban");
  const [selectedFunnel, setSelectedFunnel] = useState("Lançamentos de Médio & Alto Padrão");
  const [selectedMember, setSelectedMember] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [temperatureFilter, setTemperatureFilter] = useState<string>("TODAS");
  const [originFilter, setOriginFilter] = useState<string>("TODAS");
  const [slaFilter, setSlaFilter] = useState<string>("TODOS");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const [leads, setLeads] = useState<LeadDetail[]>(initialSampleLeads);
  const [stages, setStages] = useState<FunnelColumn[]>(defaultStages);
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);
  const [editingLead, setEditingLead] = useState<LeadDetail | null>(null);
  const [appointmentLead, setAppointmentLead] = useState<LeadDetail | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchLeads(token);
  }, [token]);

  const fetchLeads = async (authToken: string) => {
    try {
      const res = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stages && data.stages.length > 0) {
          setStages(data.stages);
        }
        if (data.leads && data.leads.length > 0) {
          const normalizedLeads: LeadDetail[] = data.leads.map((l: any) => ({
            ...l,
            rendaDeclarada: l.rendaDeclarada ? Number(l.rendaDeclarada) : null,
            score: l.score ?? (l.temperatura === "QUENTE" ? 85 : l.temperatura === "MORNO" ? 60 : 38),
            tags: l.tags || [
              l.temperatura === "QUENTE" ? "Cliente Quente" : "Potencial",
              l.source || "Meta Ads",
            ],
            compromissosCount: l.compromissosCount || 0,
          }));
          setLeads(normalizedLeads);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar leads:", err);
    }
  };

  const handleDropLead = async (leadId: string, targetStageId: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stageId: targetStageId } : l))
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, stageId: targetStageId } : null));
    }

    if (token) {
      try {
        const stageObj = stages.find((s) => s.id === targetStageId);
        const resolvedStageId = stageObj?.id || targetStageId;
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
  }) => {
    if (!token) {
      const newManualLead: LeadDetail = {
        id: `lead-${Date.now()}`,
        nome: leadData.nome,
        telefone: leadData.telefone,
        email: leadData.email,
        empreendimentoInteresse: leadData.empreendimentoInteresse || "Reserva Imperial",
        temperatura: leadData.temperatura || "MORNO",
        source: leadData.origem || "Manual / Corretor",
        rendaDeclarada: leadData.rendaDeclarada || null,
        stageId: leadData.stageId || "stage-1",
        score: leadData.temperatura === "QUENTE" ? 85 : leadData.temperatura === "MORNO" ? 60 : 38,
        tags: [
          leadData.temperatura === "QUENTE" ? "Cliente Quente" : "Potencial",
          leadData.origem || "Manual",
        ],
        createdAt: "Agora",
      };
      setLeads((prev) => [newManualLead, ...prev]);
      setToastMessage("Lead cadastrado com sucesso!");
      return;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: leadData.nome,
          telefone: leadData.telefone,
          email: leadData.email,
          empreendimentoInteresse: leadData.empreendimentoInteresse,
          temperatura: leadData.temperatura,
          rendaDeclarada: leadData.rendaDeclarada,
          source: leadData.origem || "MANUAL_CORRETOR",
          stageId: leadData.stageId || "stage-1",
        }),
      });
      if (res.ok) {
        fetchLeads(token);
        setToastMessage("Lead criado com sucesso!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const {
    filteredLeads,
    bolsaoCount,
    totalLeadsCount,
    activeLeadsCount,
    wonCount,
    convRate,
    hasActiveFilters,
  } = useLeadsFilter({
    leads,
    stages,
    searchQuery,
    temperatureFilter,
    originFilter,
    slaFilter,
    selectedMember,
    viewMode,
  });

  return (
    <div className="space-y-4 max-w-full">
      {/* 1. CABEÇALHO DA SEÇÃO DE LEADS (Seção 5.4) */}
      <LeadsHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenNewLead={() => setIsNewLeadModalOpen(true)}
      />

      {/* 2. SUB-BARRA: FUNIL, MEMBROS & BOLSÃO */}
      <LeadsSubBar
        selectedFunnel={selectedFunnel}
        setSelectedFunnel={setSelectedFunnel}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        viewMode={viewMode}
        setViewMode={setViewMode}
        bolsaoCount={bolsaoCount}
      />

      {/* 3. FAIXA DE 6 STATCARDS COMPACTOS (Seção 5.4) */}
      <LeadStatCards
        totalLeads={totalLeadsCount}
        activeLeads={activeLeadsCount}
        salesCount={wonCount}
        conversionRate={convRate}
        newLeadsCount={Math.max(1, Math.round(totalLeadsCount * 0.25))}
        bolsaoCount={bolsaoCount}
      />

      {/* 4. BUSCA FULL-WIDTH + BOTÃO FILTROS */}
      <LeadsSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenFilters={() => setIsFilterSheetOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 5. VISUALIZAÇÃO PRINCIPAL (KANBAN / TABELA / BOLSÃO) */}
      {viewMode === "kanban" && (
        <KanbanBoard
          stages={stages}
          leads={filteredLeads}
          onSelectLead={setSelectedLead}
          onDropLead={handleDropLead}
          onAdvanceStage={handleAdvanceStage}
          onChangeStage={handleChangeStage}
          onMoveToBolsao={handleMoveToBolsao}
          onDeleteLead={handleDeleteLead}
          onUpdateTags={handleUpdateTags}
          onEditLead={(lead) => setEditingLead(lead)}
          onScheduleVisit={(lead) => setAppointmentLead(lead)}
        />
      )}

      {viewMode === "table" && (
        <LeadsTable
          leads={filteredLeads}
          stages={stages}
          onSelectLead={setSelectedLead}
        />
      )}

      {viewMode === "bolsao" && (
        <BolsaoSection
          leads={leads}
          onTakeover={(leadId) => {
            setLeads((prev) =>
              prev.map((l) => (l.id === leadId ? { ...l, isBolsao: false } : l))
            );
            setToastMessage("Lead assumido com sucesso! SLA de 20 minutos iniciado.");
          }}
        />
      )}

      {/* 6. MODAIS E DRAWERS */}
      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSubmit={handleCreateManualLead}
        availableStages={stages}
      />

      <LeadDrawer
        lead={selectedLead}
        stages={stages}
        onClose={() => setSelectedLead(null)}
        onAdvanceStage={handleAdvanceStage}
        onChangeStage={handleChangeStage}
        onEditLead={(lead) => setEditingLead(lead)}
        onScheduleAppointment={(lead) => setAppointmentLead(lead)}
        onMoveToBolsao={handleMoveToBolsao}
        onTakeoverBolsao={(leadId) => {
          setLeads((prev) =>
            prev.map((l) =>
              l.id === leadId
                ? { ...l, isBolsao: false, corretor: { id: "user-robson-1", nome: "Robson Carvalho" } }
                : l
            )
          );
          if (selectedLead?.id === leadId) {
            setSelectedLead((prev) =>
              prev ? { ...prev, isBolsao: false, corretor: { id: "user-robson-1", nome: "Robson Carvalho" } } : null
            );
          }
          setToastMessage("Lead assumido com sucesso! SLA de 20 minutos iniciado.");
        }}
        onDeleteLead={handleDeleteLead}
      />

      <EditLeadModal
        isOpen={Boolean(editingLead)}
        lead={editingLead}
        stages={stages}
        onClose={() => setEditingLead(null)}
        onSave={(updated) => {
          setLeads((prev) =>
            prev.map((l) => (l.id === updated.id ? updated : l))
          );
          if (selectedLead?.id === updated.id) setSelectedLead(updated);
          setToastMessage("Lead atualizado com sucesso!");
        }}
      />

      <NewAppointmentModal
        isOpen={Boolean(appointmentLead)}
        initialLeadName={appointmentLead?.nome}
        initialProperty={appointmentLead?.empreendimentoInteresse || "Reserva Imperial"}
        onClose={() => setAppointmentLead(null)}
        onSubmit={(app) => {
          if (appointmentLead) {
            setLeads((prev) =>
              prev.map((l) =>
                l.id === appointmentLead.id
                  ? { ...l, compromissosCount: (l.compromissosCount || 0) + 1 }
                  : l
              )
            );
            if (selectedLead?.id === appointmentLead.id) {
              setSelectedLead((prev) =>
                prev ? { ...prev, compromissosCount: (prev.compromissosCount || 0) + 1 } : null
              );
            }
          }
          setToastMessage(`Compromisso agendado para ${app.lead?.nome || "cliente"}!`);
        }}
      />

      <LeadFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        selectedFunnel={selectedFunnel}
        setSelectedFunnel={setSelectedFunnel}
        temperatureFilter={temperatureFilter}
        setTemperatureFilter={setTemperatureFilter}
        originFilter={originFilter}
        setOriginFilter={setOriginFilter}
        slaFilter={slaFilter}
        setSlaFilter={setSlaFilter}
        onResetFilters={() => {
          setTemperatureFilter("TODAS");
          setOriginFilter("TODAS");
          setSlaFilter("TODOS");
          setSelectedMember("TODOS");
        }}
      />

      {/* Toast Feedback */}
      <ToastFeedback
        message={toastMessage}
        type="success"
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
