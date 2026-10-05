"use client";

import React from "react";
import { AppointmentItem, getTypeConfig } from "./types";

interface AgendaMonthViewProps {
  appointments: AppointmentItem[];
  currentDate: Date;
  onOpenOutcomeModal: (app: AppointmentItem) => void;
  onSelectDate?: (date: Date) => void;
}

const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function AgendaMonthView({
  appointments,
  currentDate,
  onOpenOutcomeModal,
  onSelectDate,
}: AgendaMonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0 = Sun, 1 = Mon...)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const todayStr = new Date().toISOString().slice(0, 10);

  // Array of day numbers with leading padding
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push(d);
  }

  return (
    <div className="bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] rounded-2xl overflow-hidden shadow-sm">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-[#1C2537] bg-slate-50 dark:bg-[#080C14]">
        {WEEKDAY_NAMES.map((name) => (
          <div
            key={name}
            className="py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-[#1C2537]/60">
        {calendarCells.map((dayNum, idx) => {
          if (dayNum === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[110px] bg-slate-50/40 dark:bg-[#080C14]/40 p-2"
              />
            );
          }

          const dayDate = new Date(year, month, dayNum);
          const dateStr = dayDate.toISOString().slice(0, 10);
          const isToday = dateStr === todayStr;

          const dayApps = appointments.filter((a) => a.dataInicio.startsWith(dateStr));
          dayApps.sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());

          return (
            <div
              key={`day-${dayNum}`}
              onClick={() => onSelectDate && onSelectDate(dayDate)}
              className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors hover:bg-slate-50/80 dark:hover:bg-[#121A2A] cursor-pointer ${
                isToday ? "bg-connect-blue/5 dark:bg-[#0E1A30]" : ""
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? "bg-connect-blue text-white"
                      : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {dayNum}
                </span>
                {dayApps.length > 0 && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {dayApps.length} {dayApps.length === 1 ? "evento" : "eventos"}
                  </span>
                )}
              </div>

              {/* Event Bars */}
              <div className="space-y-1 flex-1 overflow-hidden">
                {dayApps.slice(0, 3).map((app) => {
                  const config = getTypeConfig(app.tipo);
                  const startTime = new Date(app.dataInicio).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={app.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenOutcomeModal(app);
                      }}
                      className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium flex items-center gap-1 border border-transparent hover:border-connect-blue/30 transition-all ${config.badgeBg} ${config.badgeText}`}
                      title={`${startTime} — ${app.titulo}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
                      <span className="font-mono text-[9px] opacity-80 shrink-0">{startTime}</span>
                      <span className="truncate">{app.titulo}</span>
                    </div>
                  );
                })}

                {dayApps.length > 3 && (
                  <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 block pl-1">
                    +{dayApps.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
