"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/components/crm/CrmContext";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { KanbanBoard, FunnelColumn } from "@/components/crm/leads/KanbanBoard";
import { LeadsTable } from "@/components/crm/leads/LeadsTable";
import { BolsaoSection } from "@/components/crm/leads/BolsaoSection";
import { NightQueueSection } from "@/components/crm/leads/NightQueueSection";
import { LeadStatCards } from "@/components/crm/leads/LeadStatCards";
import { LeadsHeader } from "@/components/crm/leads/LeadsHeader";
import { LeadsSubBar } from "@/components/crm/leads/LeadsSubBar";
import { LeadsSearchBar } from "@/components/crm/leads/LeadsSearchBar";
import { LeadsModalsContainer } from "@/components/crm/leads/LeadsModalsContainer";
import { initialSampleLeads } from "@/components/crm/leads/sampleLeads";
import { useLeadsFilter } from "@/components/crm/leads/useLeadsFilter";
import { useLeadsActions } from "@/components/crm/leads/useLeadsActions";
import { defaultStages } from "@/components/crm/leads/leadCalculations";
import { exportLeadsToCsv } from "@/lib/services/leads-csv";

export default function LeadsPage() {
  const { token, selectedPeriod } = useCrm();
  const [viewMode, setViewMode] = useState<"kanban" | "table" | "bolsao" | "nightQueue">("kanban");
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [discardLeadTarget, setDiscardLeadTarget] = useState<LeadDetail | null>(null);
  const [whatsAppLeadTarget, setWhatsAppLeadTarget] = useState<LeadDetail | null>(null);
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

  const {
    handleDropLead,
    handleAdvanceStage,
    handleChangeStage,
    handleMoveToBolsao,
    handleDeleteLead,
    handleUpdateTags,
    handleCreateManualLead,
  } = useLeadsActions({
    leads,
    setLeads,
    stages,
    selectedLead,
    setSelectedLead,
    token,
    setToastMessage,
    setDiscardLeadTarget,
  });

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
    selectedPeriod,
  });

  const handleConfirmDiscard = (leadId: string, motivo: string, obs?: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              statusLabel: `Encerrado: ${motivo}`,
            }
          : l
      )
    );
    setDiscardLeadTarget(null);
    setToastMessage(`Oportunidade encerrada (${motivo}).`);
  };

  const handleImportSuccess = (imported: LeadDetail[]) => {
    setLeads((prev) => [...imported, ...prev]);
    setToastMessage(`${imported.length} leads importados e distribuídos com sucesso!`);
  };

  const handleExportLeads = () => {
    try {
      exportLeadsToCsv(filteredLeads);
      setToastMessage("Planilha CSV de leads exportada com sucesso!");
    } catch (err: any) {
      setToastMessage(err.message || "Erro ao exportar leads.");
    }
  };

  const nightQueueCount = leads.filter((l) => l.isNightQueue).length;

  const handleDispatchNightQueue = () => {
    const nightLeads = leads.filter((l) => l.isNightQueue);
    if (nightLeads.length === 0) return;
    setLeads((prev) =>
      prev.map((l) =>
        l.isNightQueue
          ? {
              ...l,
              isNightQueue: false,
              corretor: { id: "user-1", nome: "Lucas Pinheiro" },
              slaDueAt: new Date(Date.now() + 20 * 60000).toISOString(),
            }
          : l
      )
    );
    setViewMode("kanban");
    setToastMessage(`${nightLeads.length} lead(s) da Fila Noturna liberados e distribuídos via Roleta!`);
  };

  return (
    <div className="space-y-4 max-w-full">
      {/* 1. CABEÇALHO DA SEÇÃO DE LEADS (Seção 5.4) */}
      <LeadsHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenNewLead={() => setIsNewLeadModalOpen(true)}
        onImport={() => setIsImportModalOpen(true)}
        onExport={handleExportLeads}
      />

      {/* 2. SUB-BARRA: FUNIL, MEMBROS, BOLSÃO & FILA NOTURNA */}
      <LeadsSubBar
        selectedFunnel={selectedFunnel}
        setSelectedFunnel={setSelectedFunnel}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        viewMode={viewMode}
        setViewMode={setViewMode}
        bolsaoCount={bolsaoCount}
        nightQueueCount={nightQueueCount}
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

      {/* 5. VISUALIZAÇÃO PRINCIPAL (KANBAN / TABELA / BOLSÃO / FILA NOTURNA) */}
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
          onOpenWhatsApp={(lead) => setWhatsAppLeadTarget(lead)}
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

      {viewMode === "nightQueue" && (
        <NightQueueSection
          leads={leads}
          onDispatchNightQueue={handleDispatchNightQueue}
          onSelectLead={setSelectedLead}
        />
      )}

      {/* 6. MODAIS E DRAWERS CENTRALIZADOS */}
      <LeadsModalsContainer
        isNewLeadModalOpen={isNewLeadModalOpen}
        onCloseNewLeadModal={() => setIsNewLeadModalOpen(false)}
        onCreateManualLead={handleCreateManualLead}
        availableStages={stages}
        isImportModalOpen={isImportModalOpen}
        onCloseImportModal={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        discardLeadTarget={discardLeadTarget}
        onCloseDiscardModal={() => setDiscardLeadTarget(null)}
        onConfirmDiscard={handleConfirmDiscard}
        whatsAppLeadTarget={whatsAppLeadTarget}
        onCloseWhatsAppModal={() => setWhatsAppLeadTarget(null)}
        onOpenWhatsApp={(lead) => setWhatsAppLeadTarget(lead)}
        selectedLead={selectedLead}
        onCloseLeadDrawer={() => setSelectedLead(null)}
        onAdvanceStage={handleAdvanceStage}
        onChangeStage={handleChangeStage}
        onOpenEditLead={(lead) => setEditingLead(lead)}
        onOpenAppointmentModal={(lead) => setAppointmentLead(lead)}
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
        editingLead={editingLead}
        onCloseEditLead={() => setEditingLead(null)}
        onSaveEditLead={(updated) => {
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          if (selectedLead?.id === updated.id) setSelectedLead(updated);
          setToastMessage("Lead atualizado com sucesso!");

          // Registra no histórico se houve adição/edição de observação
          if (updated.observacoes && typeof window !== "undefined") {
            try {
              const storageKey = `connect_platz_lead_abordagens_${updated.id}`;
              const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
              const now = new Date();
              const timeStr = `Hoje às ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
              const newObsItem = {
                id: `obs-${Date.now()}`,
                canal: "anotacao",
                desfecho: "respondeu",
                conteudo: updated.observacoes,
                corretorNome: updated.corretor?.nome || "Corretor Responsável",
                dataHora: timeStr,
              };
              // Atualiza se a última nota for diferente
              if (!existing.some((e: any) => e.conteudo === updated.observacoes)) {
                localStorage.setItem(storageKey, JSON.stringify([newObsItem, ...existing]));
              }
            } catch {}
          }

          // Se tiver token, sincroniza via PATCH /api/leads/[id]
          if (token && updated.id) {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updated.id);
            if (isUuid) {
              fetch(`/api/leads/${updated.id}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  observacoes: updated.observacoes,
                  rendaDeclarada: updated.rendaDeclarada,
                  temperatura: updated.temperatura,
                }),
              }).catch((e) => console.warn("Erro ao salvar lead na API:", e));
            }
          }
        }}
        appointmentLead={appointmentLead}
        onCloseAppointmentModal={() => setAppointmentLead(null)}
        onSubmitAppointment={(app) => {
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
        isFilterSheetOpen={isFilterSheetOpen}
        onCloseFilterSheet={() => setIsFilterSheetOpen(false)}
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
        toastMessage={toastMessage}
        onCloseToast={() => setToastMessage(null)}
      />
    </div>
  );
}
