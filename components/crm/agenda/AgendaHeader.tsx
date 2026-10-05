"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar } from "lucide-react";
import { APPOINTMENT_TYPE_CONFIG } from "./types";

interface AgendaHeaderProps {
  currentDate: Date;
  viewMode: "dia" | "semana" | "mes";
  setViewMode: (mode: "dia" | "semana" | "mes") => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  onNavigate: (direction: "prev" | "today" | "next") => void;
  onNewAppointment: () => void;
}

export function AgendaHeader({
  currentDate,
  viewMode,
  setViewMode,
  selectedType,
  setSelectedType,
  onNavigate,
  onNewAppointment,
}: AgendaHeaderProps) {
  // Format date in PT-BR: "Quinta-feira, 01 de Outubro de 2026"
  const formattedDate = currentDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] rounded-2xl p-4 shadow-sm">
      {/* Title & Date */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-connect-blue/10 dark:bg-connect-blue/15 border border-connect-blue/20 dark:border-connect-blue/30 text-connect-blue">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Agenda
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue font-semibold">
              Compromissos
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
            {capitalizedDate}
          </p>
        </div>
      </div>

      {/* Controls: Nav (‹ Hoje ›), Type Filter, View Toggle, CTA */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Navigation ‹ Hoje › */}
        <div className="flex items-center bg-slate-100 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-1">
          <button
            onClick={() => onNavigate("prev")}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#161F30] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Anterior"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate("today")}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#161F30] rounded-lg transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => onNavigate("next")}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#161F30] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Próximo"
            aria-label="Próximo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter "Todos os tipos ▾" */}
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="appearance-none bg-slate-100 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] text-slate-700 dark:text-slate-300 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-connect-blue cursor-pointer transition-colors"
          >
            <option value="ALL">Todos os tipos</option>
            {Object.entries(APPOINTMENT_TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* View Mode Toggle: Dia | Semana | Mês */}
        <div className="flex bg-slate-100 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-1 text-xs font-semibold">
          {(["dia", "semana", "mes"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all duration-200 ${
                viewMode === mode
                  ? "bg-connect-blue text-white shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* CTA + Novo */}
        <button
          onClick={onNewAppointment}
          className="bg-connect-blue hover:bg-connect-deep-blue text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-connect-blue/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Novo
        </button>
      </div>
    </div>
  );
}
