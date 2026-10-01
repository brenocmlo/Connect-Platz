"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { AppointmentCard, AppointmentItem } from "@/components/crm/agenda/AppointmentCard";
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
  },
  {
    id: "app-2",
    titulo: "Reunião de Alinhamento de Proposta",
    tipo: "REUNIAO",
    dataInicio: "2026-10-01T16:00:00Z",
    dataFim: "2026-10-01T17:00:00Z",
    status: "AGENDADO",
    lead: { id: "l-2", nome: "Juliana Albuquerque", telefone: "85987332211" },
    property: { id: "p-2", nome: "Platz Oceanfront Residence", endereco: "Rua Dep. Moreira da Rocha, 450", bairro: "Meireles" },
    observacoes: "Análise de fluxo de pagamento durante as obras.",
  },
  {
    id: "app-3",
    titulo: "Vistoria Técnica de Entrega de Chaves",
    tipo: "ENTREGA_CHAVES",
    dataInicio: "2026-10-02T10:00:00Z",
    dataFim: "2026-10-02T11:00:00Z",
    status: "AGENDADO",
    lead: { id: "l-3", nome: "Roberto Simões", telefone: "85991448899" },
    property: { id: "p-3", nome: "Residencial Aldeota Platz", endereco: "Rua Barbosa de Freitas, 880", bairro: "Aldeota" },
  },
];

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);
  const [viewMode, setViewMode] = useState<"mes" | "semana" | "dia">("semana");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedForOutcome, setSelectedForOutcome] = useState<AppointmentItem | null>(null);

  const handleCreateAppointment = (newApp: AppointmentItem) => {
    setAppointments([newApp, ...appointments]);
  };

  const handleSaveOutcome = (appId: string, status: "CONCLUIDO" | "NAO_COMPARECEU", resultado: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status, resultadoVisita: resultado } : a))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOPBAR DA AGENDA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-connect-blue/15 border border-connect-blue/30 text-connect-blue">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">Agenda do Corretor & Visitas</h2>
            <p className="text-xs text-slate-400">Compromissos vinculados a leads e empreendimentos com registro de desfecho.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#080C14] border border-[#1F2937] rounded-xl p-1 text-xs font-semibold">
            {(["dia", "semana", "mes"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  viewMode === mode
                    ? "bg-connect-blue text-white shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-[#D9BB4C] hover:bg-[#C5A73D] text-black font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#D9BB4C]/15 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Novo Compromisso
          </button>
        </div>
      </div>

      {/* 2. GRADE DE COMPROMISSOS MODULARIZADA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((app) => (
          <AppointmentCard
            key={app.id}
            app={app}
            onOpenOutcomeModal={setSelectedForOutcome}
          />
        ))}
      </div>

      {/* 3. MODAIS */}
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
