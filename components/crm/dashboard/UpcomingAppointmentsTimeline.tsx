"use client";

import React, { useState } from "react";
import { SegmentedToggle, ToggleOption } from "@/components/crm/primitives/SegmentedToggle";
import { StatusPill } from "@/components/crm/primitives/StatusPill";

type AppointmentPeriod = "dia" | "semanal" | "15dias";

const appointmentPeriodOptions: ToggleOption<AppointmentPeriod>[] = [
  { value: "dia", label: "Dia" },
  { value: "semanal", label: "Semanal" },
  { value: "15dias", label: "15 Dias" },
];

interface AppointmentItem {
  id: string;
  type: "Visita" | "Lembrete" | "Documentação" | "Proposta";
  title: string;
  client: string;
  responsible: string;
  responsibleAvatar: string;
  dateTime: string;
  isFinished?: boolean;
}

const mockAppointments: Record<AppointmentPeriod, AppointmentItem[]> = {
  dia: [
    {
      id: "app-1",
      type: "Visita",
      title: "Visita ao Villa Platz Beach Residence",
      client: "Dr. Marcelo Cavalcante",
      responsible: "Lucas Corretor",
      responsibleAvatar: "L",
      dateTime: "Hoje às 15:30",
      isFinished: false,
    },
    {
      id: "app-2",
      type: "Lembrete",
      title: "Follow-up de aprovação de crédito bancário",
      client: "Juliana Albuquerque",
      responsible: "Ana Paula",
      responsibleAvatar: "A",
      dateTime: "Hoje às 17:00",
      isFinished: true,
    },
  ],
  semanal: [
    {
      id: "app-3",
      type: "Visita",
      title: "Apresentação do Decorado Platz Oceanfront",
      client: "Rogério Prado & Família",
      responsible: "Carlos Eduardo",
      responsibleAvatar: "C",
      dateTime: "Amanhã às 10:00",
      isFinished: false,
    },
    {
      id: "app-4",
      type: "Documentação",
      title: "Assinatura digital da CCV com a incorporadora",
      client: "Fernanda Montenegro",
      responsible: "Lucas Corretor",
      responsibleAvatar: "L",
      dateTime: "Sexta às 14:00",
      isFinished: false,
    },
  ],
  "15dias": [
    {
      id: "app-5",
      type: "Proposta",
      title: "Reunião de fechamento e contrato de veraneio",
      client: "Eduardo Matos",
      responsible: "Ana Paula",
      responsibleAvatar: "A",
      dateTime: "12/10 às 16:00",
      isFinished: false,
    },
  ],
};

export function UpcomingAppointmentsTimeline() {
  const [period, setPeriod] = useState<AppointmentPeriod>("dia");

  const items = mockAppointments[period] || [];

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      {/* 1. CABEÇALHO COM TOGGLE DIA | SEMANAL | 15 DIAS (5.3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-foreground">Compromissos</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Agenda comercial integrada e visitas programadas
          </p>
        </div>

        <SegmentedToggle
          options={appointmentPeriodOptions}
          value={period}
          onChange={setPeriod}
          variant="primary"
          size="sm"
        />
      </div>

      {/* 2. TIMELINE VERTICAL COM BOLINHAS COLORIDAS (5.3) */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {items.map((item) => {
          const isVisit = item.type === "Visita";
          const isDoc = item.type === "Documentação";

          return (
            <div key={item.id} className="relative group">
              {/* Bolinha colorida na timeline */}
              <span
                className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-card ${
                  isVisit
                    ? "bg-connect-blue ring-2 ring-connect-blue/20"
                    : isDoc
                    ? "bg-sky-500 ring-2 ring-sky-500/20"
                    : "bg-slate-400 ring-2 ring-slate-400/20"
                }`}
              />

              <div className="bg-muted/40 hover:bg-muted/70 border border-border/60 rounded-xl p-3.5 transition-all">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Pílula do tipo de compromisso */}
                    <StatusPill
                      color={isVisit ? "blue" : isDoc ? "indigo" : "slate"}
                      size="sm"
                      dot={false}
                    >
                      {item.type}
                    </StatusPill>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {item.dateTime}
                    </span>
                  </div>

                  {item.isFinished && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      ✓ Finalizado
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-foreground leading-snug mb-1">
                  {item.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/40 mt-2">
                  <span>Cliente: <strong className="text-foreground">{item.client}</strong></span>

                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-connect-blue/15 text-connect-blue font-bold text-[10px] flex items-center justify-center">
                      {item.responsibleAvatar}
                    </span>
                    <span className="truncate max-w-[100px]">{item.responsible}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
