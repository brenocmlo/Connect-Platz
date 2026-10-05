"use client";

import React from "react";
import { Clock, User, MapPin, CheckCircle2, Calendar } from "lucide-react";
import { AppointmentItem, getTypeConfig } from "./types";

interface AgendaDayViewProps {
  appointments: AppointmentItem[];
  currentDate: Date;
  onOpenOutcomeModal: (app: AppointmentItem) => void;
  onNewAppointment: () => void;
}

export function AgendaDayView({
  appointments,
  currentDate,
  onOpenOutcomeModal,
  onNewAppointment,
}: AgendaDayViewProps) {
  // Filter appointments for the day
  const dateStr = currentDate.toISOString().slice(0, 10);
  const dayApps = appointments.filter((a) => {
    return a.dataInicio.startsWith(dateStr);
  });

  // Sort by start time
  dayApps.sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());

  if (dayApps.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] rounded-2xl p-12 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-[#161F30] flex items-center justify-center text-slate-400">
          <Calendar className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Nenhum compromisso agendado para este dia
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Aproveite para organizar suas tarefas ou agendar novas visitas com seus leads mais quentes.
          </p>
        </div>
        <button
          onClick={onNewAppointment}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-connect-blue text-white text-xs font-bold hover:bg-connect-deep-blue transition-all"
        >
          Agendar Compromisso
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {dayApps.map((app) => {
        const config = getTypeConfig(app.tipo);
        const startTime = new Date(app.dataInicio).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const endTime = new Date(app.dataFim).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={app.id}
            className={`border-l-[3px] ${config.border} ${config.bgTint} border-y border-r border-slate-200/80 dark:border-[#1C2537] rounded-xl p-4 transition-all duration-200 hover:shadow-md bg-white dark:bg-[#0A0E17]`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Left Details */}
              <div className="space-y-2 flex-1 min-w-0">
                {/* Meta Row: Type Pill + Time Range */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText}`}
                  >
                    {config.label}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {startTime} — {endTime}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      app.status === "CONCLUIDO"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                        : app.status === "NAO_COMPARECEU"
                        ? "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-400 border border-red-300 dark:border-red-800"
                        : "bg-slate-100 text-slate-700 dark:bg-[#111827] dark:text-slate-300"
                    }`}
                  >
                    {app.status === "CONCLUIDO"
                      ? "Concluído"
                      : app.status === "NAO_COMPARECEU"
                      ? "Não compareceu"
                      : app.status === "CANCELADO"
                      ? "Cancelado"
                      : "Agendado"}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {app.titulo}
                </h4>

                {/* Client and Property info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {app.lead && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-slate-200">
                        {app.lead.nome}
                      </span>
                    </div>
                  )}
                  {app.property && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-platz-gold" />
                      <span>
                        {app.property.nome} • {app.property.bairro || "Fortaleza"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Outcome note if recorded */}
                {app.resultadoVisita && (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0F1624] border border-slate-200 dark:border-[#1C2537] text-xs">
                    <span className="text-[10px] font-bold uppercase text-platz-gold block mb-0.5">
                      Desfecho Registrado:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">{app.resultadoVisita}</p>
                  </div>
                )}
              </div>

              {/* Right: Responsible Avatar + Action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-[#1F2937]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-connect-blue text-white text-[11px] font-bold flex items-center justify-center">
                    {app.user?.nome ? app.user.nome.charAt(0) : "CP"}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {app.user?.nome || "Corretor"}
                  </span>
                </div>

                {app.status === "AGENDADO" && (
                  <button
                    onClick={() => onOpenOutcomeModal(app)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111827] hover:bg-connect-blue hover:text-white border border-slate-200 dark:border-[#1F2937] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Registrar Parecer
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
