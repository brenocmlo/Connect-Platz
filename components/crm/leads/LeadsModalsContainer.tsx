"use client";

import React from "react";
import { LeadDetail, LeadDrawer } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "@/components/crm/leads/KanbanBoard";
import { NewLeadModal, NewLeadFormData } from "@/components/crm/leads/NewLeadModal";
import { EditLeadModal } from "@/components/crm/leads/EditLeadModal";
import { NewAppointmentModal } from "@/components/crm/agenda/NewAppointmentModal";
import { LeadFilterSheet } from "@/components/crm/leads/LeadFilterSheet";
import { ImportLeadsModal } from "@/components/crm/leads/ImportLeadsModal";
import { DiscardLeadModal } from "@/components/crm/leads/DiscardLeadModal";
import { WhatsAppTemplatesModal } from "@/components/crm/leads/WhatsAppTemplatesModal";
import { ToastFeedback } from "@/components/crm/primitives";

interface LeadsModalsContainerProps {
  isNewLeadModalOpen: boolean;
  onCloseNewLeadModal: () => void;
  onCreateManualLead: (formData: NewLeadFormData) => void;
  availableStages: FunnelColumn[];

  isImportModalOpen: boolean;
  onCloseImportModal: () => void;
  onImportSuccess: (imported: LeadDetail[]) => void;

  discardLeadTarget: LeadDetail | null;
  onCloseDiscardModal: () => void;
  onConfirmDiscard: (leadId: string, motivo: string, obs?: string) => void;

  whatsAppLeadTarget?: LeadDetail | null;
  onCloseWhatsAppModal?: () => void;
  onOpenWhatsApp?: (lead: LeadDetail) => void;

  selectedLead: LeadDetail | null;
  onCloseLeadDrawer: () => void;
  onAdvanceStage: (leadId: string) => void;
  onChangeStage: (leadId: string, stageId: string) => void;
  onOpenEditLead: (lead: LeadDetail) => void;
  onOpenAppointmentModal: (lead: LeadDetail) => void;
  onMoveToBolsao: (leadId: string) => void;
  onTakeoverBolsao: (leadId: string) => void;
  onDeleteLead: (leadId: string) => void;

  editingLead: LeadDetail | null;
  onCloseEditLead: () => void;
  onSaveEditLead: (updated: LeadDetail) => void;

  appointmentLead: LeadDetail | null;
  onCloseAppointmentModal: () => void;
  onSubmitAppointment: (app: any) => void;

  isFilterSheetOpen: boolean;
  onCloseFilterSheet: () => void;
  selectedFunnel: string;
  setSelectedFunnel: (f: string) => void;
  temperatureFilter: string;
  setTemperatureFilter: (t: string) => void;
  originFilter: string;
  setOriginFilter: (o: string) => void;
  slaFilter: string;
  setSlaFilter: (s: string) => void;
  onResetFilters: () => void;

  toastMessage: string | null;
  onCloseToast: () => void;
}

export function LeadsModalsContainer({
  isNewLeadModalOpen,
  onCloseNewLeadModal,
  onCreateManualLead,
  availableStages,
  isImportModalOpen,
  onCloseImportModal,
  onImportSuccess,
  discardLeadTarget,
  onCloseDiscardModal,
  onConfirmDiscard,
  whatsAppLeadTarget,
  onCloseWhatsAppModal,
  onOpenWhatsApp,
  selectedLead,
  onCloseLeadDrawer,
  onAdvanceStage,
  onChangeStage,
  onOpenEditLead,
  onOpenAppointmentModal,
  onMoveToBolsao,
  onTakeoverBolsao,
  onDeleteLead,
  editingLead,
  onCloseEditLead,
  onSaveEditLead,
  appointmentLead,
  onCloseAppointmentModal,
  onSubmitAppointment,
  isFilterSheetOpen,
  onCloseFilterSheet,
  selectedFunnel,
  setSelectedFunnel,
  temperatureFilter,
  setTemperatureFilter,
  originFilter,
  setOriginFilter,
  slaFilter,
  setSlaFilter,
  onResetFilters,
  toastMessage,
  onCloseToast,
}: LeadsModalsContainerProps) {
  return (
    <>
      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={onCloseNewLeadModal}
        onSubmit={onCreateManualLead}
        availableStages={availableStages}
        currentFunnel={selectedFunnel}
      />

      <ImportLeadsModal
        isOpen={isImportModalOpen}
        onClose={onCloseImportModal}
        onImportSuccess={onImportSuccess}
        availableStages={availableStages}
      />

      <DiscardLeadModal
        isOpen={Boolean(discardLeadTarget)}
        lead={discardLeadTarget}
        onClose={onCloseDiscardModal}
        onConfirmDiscard={onConfirmDiscard}
      />

      <WhatsAppTemplatesModal
        isOpen={Boolean(whatsAppLeadTarget)}
        lead={whatsAppLeadTarget || null}
        onClose={onCloseWhatsAppModal || (() => {})}
      />

      <LeadDrawer
        lead={selectedLead}
        stages={availableStages}
        onClose={onCloseLeadDrawer}
        onAdvanceStage={onAdvanceStage}
        onChangeStage={onChangeStage}
        onEditLead={onOpenEditLead}
        onScheduleAppointment={onOpenAppointmentModal}
        onMoveToBolsao={onMoveToBolsao}
        onTakeoverBolsao={onTakeoverBolsao}
        onDeleteLead={onDeleteLead}
        onOpenWhatsApp={onOpenWhatsApp}
      />

      <EditLeadModal
        isOpen={Boolean(editingLead)}
        lead={editingLead}
        stages={availableStages}
        onClose={onCloseEditLead}
        onSave={onSaveEditLead}
      />

      <NewAppointmentModal
        isOpen={Boolean(appointmentLead)}
        initialLeadName={appointmentLead?.nome}
        initialProperty={appointmentLead?.empreendimentoInteresse || "Reserva Imperial"}
        onClose={onCloseAppointmentModal}
        onSubmit={onSubmitAppointment}
      />

      <LeadFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={onCloseFilterSheet}
        selectedFunnel={selectedFunnel}
        setSelectedFunnel={setSelectedFunnel}
        temperatureFilter={temperatureFilter}
        setTemperatureFilter={setTemperatureFilter}
        originFilter={originFilter}
        setOriginFilter={setOriginFilter}
        slaFilter={slaFilter}
        setSlaFilter={setSlaFilter}
        onResetFilters={onResetFilters}
      />

      <ToastFeedback
        message={toastMessage}
        type="success"
        onClose={onCloseToast}
      />
    </>
  );
}
