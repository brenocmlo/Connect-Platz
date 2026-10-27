"use client";

import React, { useCallback, useMemo, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { KanbanBoard } from "@/components/crm/leads/KanbanBoard";
import { LeadsTable } from "@/components/crm/leads/LeadsTable";
import { BolsaoSection } from "@/components/crm/leads/BolsaoSection";
import { NightQueueSection } from "@/components/crm/leads/NightQueueSection";
import { LeadStatCards } from "@/components/crm/leads/LeadStatCards";
import { LeadsHeader } from "@/components/crm/leads/LeadsHeader";
import { LeadsSubBar } from "@/components/crm/leads/LeadsSubBar";
import { LeadsSearchBar } from "@/components/crm/leads/LeadsSearchBar";
import { LeadsModalsContainer } from "@/components/crm/leads/LeadsModalsContainer";
import { useLeadsFilter } from "@/components/crm/leads/useLeadsFilter";
import { useLeadsActions, NotifyFn } from "@/components/crm/leads/useLeadsActions";
import { useLeadsData } from "@/components/crm/leads/useLeadsData";
import { exportLeadsToCsv } from "@/lib/services/leads-csv";
import { useCrmLookups } from "@/components/crm/agenda/useCrmLookups";
import { patchLead } from "@/components/crm/leads/leadsApi";

type ToastState = { message: string; type: "success" | "error" | "info" } | null;

export default function LeadsPage() {
  const { token, selectedPeriod, user } = useCrm();
  const isAdmin = user?.role === "ADMINISTRADOR";
  const { members: lookupMembers } = useCrmLookups({ enabled: true, members: true, leads: false, properties: false });

  const [viewMode, setViewMode] = useState<"kanban" | "table" | "bolsao" | "nightQueue">("kanban");
  const [selectedMember, setSelectedMember] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [temperatureFilter, setTemperatureFilter] = useState<string>("TODAS");
  const [originFilter, setOriginFilter] = useState<string>("TODAS");
  const [slaFilter, setSlaFilter] = useState<string>("TODOS");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const [editingLead, setEditingLead] = useState<LeadDetail | null>(null);
  const [appointmentLead, setAppointmentLead] = useState<LeadDetail | null>(null);
  const [brokerTarget, setBrokerTarget] = useState<LeadDetail | null>(null);
  const [saleTarget, setSaleTarget] = useState<LeadDetail | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [discardLeadTarget, setDiscardLeadTarget] = useState<LeadDetail | null>(null);
  const [whatsAppLeadTarget, setWhatsAppLeadTarget] = useState<LeadDetail | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const notify: NotifyFn = useCallback((message, type = "success") => setToast({ message, type }), []);
  const closeToast = useCallback(() => setToast(null), []);

  const {
    leads,
    setLeads,
    stages,
    funnels,
    funnelId,
    isLoading,
    loadError,
    reload,
    replaceLead,
    selectedLead,
    setSelectedLead,
  } = useLeadsData(Boolean(token));

  const actions = useLeadsActions({
    leads,
    setLeads,
    stages,
    funnelId,
    selectedLead,
    setSelectedLead,
    replaceLead,
    notify,
    setDiscardLeadTarget,
    onPromptSale: (lead) => setSaleTarget(lead),
    onPromptAppointment: (lead) => setAppointmentLead(lead),
  });

  const handleTransferBroker = async (leadId: string, newBrokerId: string, newBrokerName: string) => {
    try {
      const updated = await patchLead(leadId, { corretorId: newBrokerId });
      replaceLead(updated);
      notify(`Lead transferido com sucesso para ${newBrokerName}!`);
    } catch (err: any) {
      notify(err?.message || "Erro ao transferir corretor.", "error");
      throw err;
    }
  };

  const handleSaleSuccess = () => {
    setSaleTarget(null);
    reload();
    notify("Venda registrada com sucesso! Lead atualizado no funil.", "success");
  };

  const { filteredLeads, bolsaoCount, totalLeadsCount, activeLeadsCount, wonCount, convRate, newLeadsCount, hasActiveFilters } =
    useLeadsFilter({
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

  // Membros do filtro derivados dos corretores reais presentes nos leads
  const members = useMemo(() => {
    const names = new Set<string>();
    leads.forEach((l) => l.corretor?.nome && names.add(l.corretor.nome));
    return Array.from(names).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [leads]);

  const nightQueueCount = leads.filter((l) => l.isNightQueue).length;

  const handleImportSuccess = (imported: LeadDetail[]) => {
    setLeads((prev) => [...imported, ...prev]);
    notify(`${imported.length} lead(s) importado(s) com sucesso!`);
  };

  const handleExportLeads = () => {
    try {
      exportLeadsToCsv(filteredLeads);
      notify("Planilha CSV de leads exportada com sucesso!");
    } catch (err: any) {
      notify(err.message || "Erro ao exportar leads.", "error");
    }
  };

  const handleSubmitAppointment = () => {
    if (!appointmentLead) return;
    const bump = (l: LeadDetail) => ({ ...l, compromissosCount: (l.compromissosCount || 0) + 1 });
    const current = leads.find((l) => l.id === appointmentLead.id);
    if (current) replaceLead(bump(current));
    notify(`Compromisso agendado para ${appointmentLead.nome}!`);
  };

  const renderMainView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-connect-blue" />
          <span className="text-xs">Carregando leads…</span>
        </div>
      );
    }
    if (loadError) {
      return (
        <div className="bg-card border border-border rounded-2xl p-10 text-center space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
          <p className="text-sm font-semibold text-foreground">{loadError}</p>
          <button
            onClick={() => reload(funnelId)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold shadow-lg shadow-connect-blue/20 transition-all hover:scale-[1.02]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
          </button>
        </div>
      );
    }
    if (viewMode === "kanban") {
      return (
        <KanbanBoard
          stages={stages}
          leads={filteredLeads}
          onSelectLead={setSelectedLead}
          onDropLead={actions.handleDropLead}
          onAdvanceStage={actions.handleAdvanceStage}
          onChangeStage={actions.handleChangeStage}
          onMoveToBolsao={actions.handleMoveToBolsao}
          onDeleteLead={actions.handleDeleteLead}
          onUpdateTags={actions.handleUpdateTags}
          onEditLead={(lead) => setEditingLead(lead)}
          onScheduleVisit={(lead) => setAppointmentLead(lead)}
          onOpenWhatsApp={(lead) => setWhatsAppLeadTarget(lead)}
          isAdmin={isAdmin}
          onChangeBroker={(lead) => setBrokerTarget(lead)}
          onRegisterSale={(lead) => setSaleTarget(lead)}
        />
      );
    }
    if (viewMode === "table") {
      return <LeadsTable leads={filteredLeads} stages={stages} onSelectLead={setSelectedLead} />;
    }
    if (viewMode === "bolsao") {
      return <BolsaoSection leads={leads} onTakeover={actions.handleTakeoverBolsao} />;
    }
    return <NightQueueSection leads={leads} onSelectLead={setSelectedLead} />;
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
        funnels={funnels}
        selectedFunnelId={funnelId}
        onSelectFunnel={(id) => reload(id)}
        members={members}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        viewMode={viewMode}
        setViewMode={setViewMode}
        bolsaoCount={bolsaoCount}
        nightQueueCount={nightQueueCount}
      />

      {/* 3. FAIXA DE 6 STATCARDS COMPACTOS (Seção 5.4) — calculados dos leads reais */}
      <LeadStatCards
        totalLeads={totalLeadsCount}
        activeLeads={activeLeadsCount}
        salesCount={wonCount}
        conversionRate={convRate}
        newLeadsCount={newLeadsCount}
        bolsaoCount={bolsaoCount}
        isLoading={isLoading}
      />

      {/* 4. BUSCA FULL-WIDTH + BOTÃO FILTROS */}
      <LeadsSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenFilters={() => setIsFilterSheetOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 5. VISUALIZAÇÃO PRINCIPAL (KANBAN / TABELA / BOLSÃO / FILA NOTURNA) */}
      {renderMainView()}

      {/* 6. MODAIS E DRAWERS CENTRALIZADOS */}
      <LeadsModalsContainer
        isNewLeadModalOpen={isNewLeadModalOpen}
        onCloseNewLeadModal={() => setIsNewLeadModalOpen(false)}
        onCreateManualLead={actions.handleCreateManualLead}
        availableStages={stages}
        isImportModalOpen={isImportModalOpen}
        onCloseImportModal={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        funnelId={funnelId}
        discardLeadTarget={discardLeadTarget}
        onCloseDiscardModal={() => setDiscardLeadTarget(null)}
        onConfirmDiscard={actions.handleConfirmDiscard}
        whatsAppLeadTarget={whatsAppLeadTarget}
        onCloseWhatsAppModal={() => setWhatsAppLeadTarget(null)}
        onOpenWhatsApp={(lead) => setWhatsAppLeadTarget(lead)}
        selectedLead={selectedLead}
        onCloseLeadDrawer={() => setSelectedLead(null)}
        onAdvanceStage={actions.handleAdvanceStage}
        onChangeStage={actions.handleChangeStage}
        onOpenEditLead={(lead) => setEditingLead(lead)}
        onOpenAppointmentModal={(lead) => setAppointmentLead(lead)}
        onMoveToBolsao={actions.handleMoveToBolsao}
        onTakeoverBolsao={actions.handleTakeoverBolsao}
        onDeleteLead={actions.handleDeleteLead}
        editingLead={editingLead}
        onCloseEditLead={() => setEditingLead(null)}
        onSaveEditLead={(updated) => (editingLead ? actions.handleSaveEditLead(editingLead, updated) : Promise.resolve(false))}
        appointmentLead={appointmentLead}
        onCloseAppointmentModal={() => setAppointmentLead(null)}
        onSubmitAppointment={handleSubmitAppointment}
        brokerChangeTarget={brokerTarget}
        onCloseBrokerModal={() => setBrokerTarget(null)}
        onConfirmTransferBroker={handleTransferBroker}
        members={lookupMembers}
        saleModalTarget={saleTarget}
        onCloseSaleModal={() => setSaleTarget(null)}
        onSubmitSale={handleSaleSuccess}
        isAdmin={isAdmin}
        onChangeBroker={(lead) => setBrokerTarget(lead)}
        onRegisterSale={(lead) => setSaleTarget(lead)}
        isFilterSheetOpen={isFilterSheetOpen}
        onCloseFilterSheet={() => setIsFilterSheetOpen(false)}
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
        toastMessage={toast?.message || null}
        toastType={toast?.type || "success"}
        onCloseToast={closeToast}
      />
    </div>
  );
}
