"use client";

import React, { useState } from "react";
import { AppointmentItem } from "@/components/crm/agenda/types";
import { AgendaHeader } from "@/components/crm/agenda/AgendaHeader";
import { AgendaDayView } from "@/components/crm/agenda/AgendaDayView";
import { AgendaWeekView } from "@/components/crm/agenda/AgendaWeekView";
import { AgendaMonthView } from "@/components/crm/agenda/AgendaMonthView";
import { NewAppointmentModal } from "@/components/crm/agenda/NewAppointmentModal";
import { VisitOutcomeModal } from "@/components/crm/agenda/VisitOutcomeModal";

const initialAppointments: AppointmentItem[] = [
  {
    id: "app-1",
    titulo: "Visita ao Decorado • Villa Platz Beach",
    tipo: "VISITA",
    dataInicio: "2026-10-01T14:30:00Z",
    dataFim: "2026-10-01T15:30:00Z",
    status: "AGENDADO",
    lead: { id: "l-1", nome: "Dr. Marcelo Cavalcante", telefone: "85998124455" },
    property: { id: "p-1", nome: "Villa Platz Beach", endereco: "Av. Beira-Mar, 1200", bairro: "Meireles" },
    observacoes: "Cliente busca 3 suítes frente mar, sol poente mitigado.",
    user: { id: "u-1", nome: "Carlos Eduardo" },
  },
  {
    id: "app-2",
    titulo: "Reunião de Alinhamento de Proposta",
    tipo: "PROPOSTA",
    dataInicio: "2026-10-01T16:00:00Z",
    dataFim: "2026-10-01T17:00:00Z",
    status: "AGENDADO",
    lead: { id: "l-2", nome: "Juliana Albuquerque", telefone: "85987332211" },
    property: { id: "p-2", nome: "Platz Oceanfront Residence", endereco: "Rua Dep. Moreira da Rocha, 450", bairro: "Meireles" },
    observacoes: "Análise de fluxo de pagamento durante as obras.",
    user: { id: "u-2", nome: "Ana Paula" },
  },
  {
    id: "app-3",
    titulo: "Coleta e Conferência de Documentação",
    tipo: "DOCUMENTACAO",
    dataInicio: "2026-10-02T10:00:00Z",
    dataFim: "2026-10-02T11:00:00Z",
    status: "AGENDADO",
    lead: { id: "l-3", nome: "Roberto Simões", telefone: "85991448899" },
    property: { id: "p-3", nome: "Residencial Aldeota Platz", endereco: "Rua Barbosa de Freitas, 880", bairro: "Aldeota" },
    user: { id: "u-1", nome: "Carlos Eduardo" },
  },
  {
    id: "app-4",
    titulo: "Retorno telefônico sobre proposta enviada",
    tipo: "RETORNO",
    dataInicio: "2026-10-03T11:30:00Z",
    dataFim: "2026-10-03T12:00:00Z",
    status: "AGENDADO",
    lead: { id: "l-4", nome: "Fernando Guimarães", telefone: "85992334455" },
    property: { id: "p-1", nome: "Villa Platz Beach" },
    user: { id: "u-3", nome: "Mariana Costa" },
  },
  {
    id: "app-5",
    titulo: "Lembrete: Enviar minuta contratual para cartório",
    tipo: "LEMBRETE",
    dataInicio: "2026-10-01T11:00:00Z",
    dataFim: "2026-10-01T11:30:00Z",
    status: "CONCLUIDO",
    lead: { id: "l-5", nome: "Beatriz Mota", telefone: "85994445566" },
    user: { id: "u-1", nome: "Carlos Eduardo" },
  },
];

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 1)); // 01 de Outubro de 2026
  const [viewMode, setViewMode] = useState<"dia" | "semana" | "mes">("semana");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedForOutcome, setSelectedForOutcome] = useState<AppointmentItem | null>(null);

  // Navigation handlers
  const handleNavigate = (direction: "prev" | "today" | "next") => {
    if (direction === "today") {
      setCurrentDate(new Date(2026, 9, 1));
      return;
    }

    const newDate = new Date(currentDate);
    const step = direction === "next" ? 1 : -1;

    if (viewMode === "dia") {
      newDate.setDate(newDate.getDate() + step);
    } else if (viewMode === "semana") {
      newDate.setDate(newDate.getDate() + step * 7);
    } else if (viewMode === "mes") {
      newDate.setMonth(newDate.getMonth() + step);
    }

    setCurrentDate(newDate);
  };

  const handleCreateAppointment = (newApp: AppointmentItem) => {
    setAppointments([newApp, ...appointments]);
  };

  const handleSaveOutcome = (
    appId: string,
    status: "CONCLUIDO" | "NAO_COMPARECEU",
    resultado: string
  ) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status, resultadoVisita: resultado } : a))
    );
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((app) => {
    if (selectedType !== "ALL" && app.tipo.toUpperCase() !== selectedType.toUpperCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header (Seção 5.7) */}
      <AgendaHeader
        currentDate={currentDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        onNavigate={handleNavigate}
        onNewAppointment={() => setIsNewModalOpen(true)}
      />

      {/* 2. Visual View: Dia | Semana | Mês */}
      {viewMode === "dia" && (
        <AgendaDayView
          appointments={filteredAppointments}
          currentDate={currentDate}
          onOpenOutcomeModal={setSelectedForOutcome}
          onNewAppointment={() => setIsNewModalOpen(true)}
        />
      )}

      {viewMode === "semana" && (
        <AgendaWeekView
          appointments={filteredAppointments}
          currentDate={currentDate}
          onOpenOutcomeModal={setSelectedForOutcome}
          onNewAppointment={() => setIsNewModalOpen(true)}
        />
      )}

      {viewMode === "mes" && (
        <AgendaMonthView
          appointments={filteredAppointments}
          currentDate={currentDate}
          onOpenOutcomeModal={setSelectedForOutcome}
          onSelectDate={(date) => {
            setCurrentDate(date);
            setViewMode("dia");
          }}
        />
      )}

      {/* 3. Modais */}
      <NewAppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateAppointment}
      />

      <VisitOutcomeModal
        app={selectedForOutcome}
        onClose={() => setSelectedForOutcome(null)}
        onSaveOutcome={handleSaveOutcome}
      />
    </div>
  );
}
