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
import { ChangeBrokerModal } from "./ChangeBrokerModal";
import { NewSaleModal } from "@/components/crm/vendas/NewSaleModal";
import { RequestClosingModal } from "./RequestClosingModal";
import { NewBookingModal } from "@/components/crm/temporada/NewBookingModal";
import { LookupMember } from "@/components/crm/agenda/useCrmLookups";
import { useCrm } from "@/components/crm/CrmContext";

interface LeadsModalsContainerProps {
  isNewLeadModalOpen: boolean;
  onCloseNewLeadModal: () => void;
  onCreateManualLead: (formData: NewLeadFormData) => Promise<boolean>;
  availableStages: FunnelColumn[];

  isImportModalOpen: boolean;
  onCloseImportModal: () => void;
  onImportSuccess: (imported: LeadDetail[]) => void;
  funnelId: string | null;

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
  onSaveEditLead: (updated: LeadDetail) => Promise<boolean>;

  appointmentLead: LeadDetail | null;
  onCloseAppointmentModal: () => void;
  onSubmitAppointment: () => void;

  isFilterSheetOpen: boolean;
  onCloseFilterSheet: () => void;
  temperatureFilter: string;
  setTemperatureFilter: (t: string) => void;
  originFilter: string;
  setOriginFilter: (o: string) => void;
  slaFilter: string;
  setSlaFilter: (s: string) => void;
  onResetFilters: () => void;

  brokerChangeTarget?: LeadDetail | null;
  onCloseBrokerModal?: () => void;
  onConfirmTransferBroker?: (leadId: string, newBrokerId: string, newBrokerName: string) => Promise<void>;
  members?: LookupMember[];

  saleModalTarget?: LeadDetail | null;
  onCloseSaleModal?: () => void;
  onSubmitSale?: (sale: any) => void;

  isAdmin?: boolean;
  onChangeBroker?: (lead: LeadDetail) => void;
  onRegisterSale?: (lead: LeadDetail) => void;

  toastMessage: string | null;
  toastType?: "success" | "error" | "info";
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
  funnelId,
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
  temperatureFilter,
  setTemperatureFilter,
  originFilter,
  setOriginFilter,
  slaFilter,
  setSlaFilter,
  onResetFilters,
  brokerChangeTarget,
  onCloseBrokerModal,
  onConfirmTransferBroker,
  members = [],
  saleModalTarget,
  onCloseSaleModal,
  onSubmitSale,
  isAdmin = false,
  onChangeBroker,
  onRegisterSale,
  toastMessage,
  toastType = "success",
  onCloseToast,
}: LeadsModalsContainerProps) {
  const { user } = useCrm();
  const isBroker =
    user?.role === "CORRETOR_VENDA" ||
    user?.role === "CORRETOR_ALUGUEL" ||
    user?.role === "CORRETOR";
  const isRentalTarget =
    user?.role === "CORRETOR_ALUGUEL" ||
    user?.role === "FINANCEIRO_ALUGUEL" ||
    saleModalTarget?.modalidade === "ALUGUEL";

  return (
    <>
      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={onCloseNewLeadModal}
        onSubmit={onCreateManualLead}
        availableStages={availableStages}
      />

      <ImportLeadsModal
        isOpen={isImportModalOpen}
        onClose={onCloseImportModal}
        onImportSuccess={onImportSuccess}
        availableStages={availableStages}
        funnelId={funnelId}
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
        isAdmin={isAdmin}
        onChangeBroker={onChangeBroker}
        onRegisterSale={onRegisterSale}
      />

      <EditLeadModal
        isOpen={Boolean(editingLead)}
        lead={editingLead}
        stages={availableStages}
        members={members}
        isAdmin={isAdmin}
        onClose={onCloseEditLead}
        onSave={onSaveEditLead}
      />

      {brokerChangeTarget && onConfirmTransferBroker && onCloseBrokerModal && (
        <ChangeBrokerModal
          isOpen={Boolean(brokerChangeTarget)}
          lead={brokerChangeTarget}
          members={members}
          onClose={onCloseBrokerModal}
          onSuccess={onConfirmTransferBroker}
        />
      )}

      {saleModalTarget && onSubmitSale && onCloseSaleModal && (
        isRentalTarget ? (
          <NewBookingModal
            isOpen={Boolean(saleModalTarget)}
            preselectedLead={saleModalTarget}
            onClose={onCloseSaleModal}
            onSubmit={() => onSubmitSale(null)}
          />
        ) : isBroker ? (
          <RequestClosingModal
            isOpen={Boolean(saleModalTarget)}
            lead={saleModalTarget}
            onClose={onCloseSaleModal}
            onSuccess={() => onSubmitSale(null)}
          />
        ) : (
          <NewSaleModal
            isOpen={Boolean(saleModalTarget)}
            preselectedLead={saleModalTarget}
            onClose={onCloseSaleModal}
            onSubmit={onSubmitSale}
          />
        )
      )}

      <NewAppointmentModal
        isOpen={Boolean(appointmentLead)}
        initialLeadId={appointmentLead?.id}
        initialLeadName={appointmentLead?.nome}
        initialProperty={appointmentLead?.empreendimentoInteresse || undefined}
        onClose={onCloseAppointmentModal}
        onSubmit={onSubmitAppointment}
      />

      <LeadFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={onCloseFilterSheet}
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
        type={toastType}
        onClose={onCloseToast}
      />
    </>
  );
}
