"use client";

import React from "react";
import { Clock, User, Plus } from "lucide-react";
import { AppointmentItem, getTypeConfig } from "./types";

interface AgendaWeekViewProps {
  appointments: AppointmentItem[];
  currentDate: Date;
  onOpenOutcomeModal: (app: AppointmentItem) => void;
  onNewAppointment: () => void;
}

export function AgendaWeekView({
  appointments,
  currentDate,
  onOpenOutcomeModal,
  onNewAppointment,
}: AgendaWeekViewProps) {
  // Compute start of week (Monday)
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay(); // 0 is Sunday
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);

  // Generate 7 days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedMobileDate, setSelectedMobileDate] = React.useState<string>(() => {
    const todayInWeek = weekDays.find((d) => d.toISOString().slice(0, 10) === todayStr);
    return todayInWeek ? todayStr : weekDays[0].toISOString().slice(0, 10);
  });

  // Atualiza data selecionada se currentDate mudar
  React.useEffect(() => {
    const currentStr = currentDate.toISOString().slice(0, 10);
    const exists = weekDays.some((d) => d.toISOString().slice(0, 10) === currentStr);
    if (exists) {
      setSelectedMobileDate(currentStr);
    } else {
      setSelectedMobileDate(weekDays[0].toISOString().slice(0, 10));
    }
  }, [currentDate]);

  const selectedMobileApps = appointments.filter((a) =>
    a.dataInicio.startsWith(selectedMobileDate)
  );
  selectedMobileApps.sort(
    (a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
  );

  return (
    <div className="space-y-4">
      {/* 1. VISUALIZAÇÃO MOBILE (md:hidden): Pílulas deslizantes dos 7 dias + Lista Vertical do Dia Selecionado */}
      <div className="block md:hidden space-y-3">
        {/* Carrossel dos dias da semana */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none px-1">
          {weekDays.map((dayDate) => {
            const dateStr = dayDate.toISOString().slice(0, 10);
            const isSelected = dateStr === selectedMobileDate;
            const isToday = dateStr === todayStr;
            const dayApps = appointments.filter((a) => a.dataInicio.startsWith(dateStr));
            const weekdayName = dayDate.toLocaleDateString("pt-BR", { weekday: "short" });
            const dayNum = dayDate.getDate();

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedMobileDate(dateStr)}
                className={`flex-1 min-w-[54px] p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1 ${
                  isSelected
                    ? "bg-connect-blue text-white border-connect-blue shadow-md scale-[1.03]"
                    : isToday
                    ? "bg-connect-blue/10 border-connect-blue/40 text-connect-blue"
                    : "bg-white dark:bg-[#0A0E17] border-slate-200 dark:border-[#1C2537] text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                  {weekdayName}
                </span>
                <span className="text-base font-black block leading-none">
                  {dayNum}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full mt-0.5 ${
                    isSelected
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 dark:bg-[#161F30] text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {dayApps.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Lista de compromissos do dia selecionado */}
        <div className="bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1C2537]">
            <span className="text-xs font-bold text-slate-800 dark:text-white capitalize">
              {new Date(`${selectedMobileDate}T12:00:00Z`).toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "short",
              })}
            </span>
            <span className="text-[11px] font-bold text-connect-blue">
              {selectedMobileApps.length} compromisso(s)
            </span>
          </div>

          {selectedMobileApps.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                Nenhum compromisso agendado para este dia da semana.
              </p>
              <button
                type="button"
                onClick={onNewAppointment}
                className="text-xs font-bold text-connect-blue hover:underline"
              >
                + Agendar agora
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedMobileApps.map((app) => {
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
                    onClick={() => onOpenOutcomeModal(app)}
                    className={`p-3 rounded-xl border border-slate-200 dark:border-[#1C2537] ${config.bgTint} border-l-4 ${config.border} space-y-1.5 cursor-pointer shadow-xs active:scale-[0.99] transition-transform`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText}`}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold">
                        {startTime} — {endTime}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {app.titulo}
                    </h4>

                    {app.lead && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {app.lead.nome}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. VISUALIZAÇÃO DESKTOP (hidden md:block): Grid de 7 Colunas */}
      <div className="hidden md:block overflow-x-auto pb-4">
        <div className="grid grid-cols-7 gap-3 min-w-[850px]">
        {weekDays.map((dayDate) => {
          const dateStr = dayDate.toISOString().slice(0, 10);
          const isToday = dateStr === todayStr;

          const dayApps = appointments.filter((a) => a.dataInicio.startsWith(dateStr));
          dayApps.sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());

          const weekdayName = dayDate.toLocaleDateString("pt-BR", { weekday: "short" });
          const dayNum = dayDate.getDate();

          return (
            <div
              key={dateStr}
              className={`flex flex-col rounded-2xl border transition-colors ${
                isToday
                  ? "bg-connect-blue/5 dark:bg-[#0E1726] border-connect-blue/40 shadow-sm"
                  : "bg-white dark:bg-[#0A0E17] border-slate-200 dark:border-[#1C2537]"
              }`}
            >
              {/* Day Column Header */}
              <div className="p-3 border-b border-slate-200 dark:border-[#1C2537] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    {weekdayName}
                  </span>
                  <span
                    className={`text-base font-extrabold ${
                      isToday
                        ? "text-connect-blue dark:text-blue-400"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {dayNum}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#161F30] text-slate-600 dark:text-slate-400">
                  {dayApps.length}
                </span>
              </div>

              {/* Day Events Stack */}
              <div className="p-2 space-y-2 flex-1 min-h-[360px]">
                {dayApps.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                      Sem compromissos
                    </span>
                  </div>
                ) : (
                  dayApps.map((app) => {
                    const config = getTypeConfig(app.tipo);
                    const startTime = new Date(app.dataInicio).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={app.id}
                        onClick={() => onOpenOutcomeModal(app)}
                        className={`p-2.5 rounded-xl border border-slate-200/80 dark:border-[#1C2537] ${config.bgTint} hover:border-connect-blue/40 dark:hover:border-connect-blue/60 transition-all cursor-pointer shadow-xs space-y-1.5`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${config.badgeBg} ${config.badgeText}`}
                          >
                            {config.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {startTime}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                          {app.titulo}
                        </p>

                        {app.lead && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 truncate">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{app.lead.nome}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
