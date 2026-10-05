"use client";

import React from "react";
import { Clock, User, MapPin, CheckCircle2 } from "lucide-react";
import { AppointmentItem, getTypeConfig } from "./types";

export type { AppointmentItem };

interface AppointmentCardProps {
  app: AppointmentItem;
  onOpenOutcomeModal: (app: AppointmentItem) => void;
}

export function AppointmentCard({ app, onOpenOutcomeModal }: AppointmentCardProps) {
  const config = getTypeConfig(app.tipo);

  return (
    <div
      className={`bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] hover:border-connect-blue/50 dark:hover:border-connect-blue/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between border-l-[3px] ${config.border}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${config.badgeBg} ${config.badgeText}`}
          >
            {config.label}
          </span>
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

        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
          {app.titulo}
        </h3>

        <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-connect-blue" />
            {new Date(app.dataInicio).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            —{" "}
            {new Date(app.dataFim).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          {app.lead && (
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 dark:text-white font-semibold">
                {app.lead.nome}
              </span>
            </div>
          )}

          {app.property && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-platz-gold" />
              <span>
                {app.property.nome} • {app.property.bairro || "Fortaleza"}
              </span>
            </div>
          )}

          {app.observacoes && (
            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100 dark:border-[#1C2537]">
              "{app.observacoes}"
            </p>
          )}

          {app.resultadoVisita && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F1624] border border-slate-200 dark:border-[#1C2537] mt-2">
              <span className="text-[10px] font-bold uppercase text-platz-gold block mb-0.5">
                Desfecho Registrado:
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {app.resultadoVisita}
              </p>
            </div>
          )}
        </div>
      </div>

      {app.status === "AGENDADO" && (
        <button
          onClick={() => onOpenOutcomeModal(app)}
          className="w-full bg-slate-100 dark:bg-[#111827] hover:bg-connect-blue hover:text-white border border-slate-200 dark:border-[#1F2937] text-slate-700 dark:text-slate-300 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Registrar Desfecho da Visita
        </button>
      )}
    </div>
  );
}
