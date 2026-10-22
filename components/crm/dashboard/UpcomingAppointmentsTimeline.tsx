"use client";

import React, { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { SegmentedToggle, ToggleOption } from "@/components/crm/primitives/SegmentedToggle";
import { StatusPill, StatusColor } from "@/components/crm/primitives/StatusPill";
import { EmptyState } from "@/components/crm/primitives/EmptyState";
import type { AppointmentItem } from "./types";
import { friendlyDateTime, initials } from "./format";

type AppointmentWindow = "dia" | "semanal" | "15dias";

const windowOptions: ToggleOption<AppointmentWindow>[] = [
  { value: "dia", label: "Dia" },
  { value: "semanal", label: "Semanal" },
  { value: "15dias", label: "15 Dias" },
];

const WINDOW_DAYS: Record<AppointmentWindow, number> = { dia: 1, semanal: 7, "15dias": 15 };

/** Rótulo e cor por tipo (5.7): Visita azul, Documentação índigo, Follow-up âmbar, Proposta vermelho, Lembrete cinza. */
const TYPE_STYLE: Record<string, { label: string; color: StatusColor; dot: string }> = {
  VISITA: { label: "Visita", color: "blue", dot: "bg-connect-blue ring-connect-blue/20" },
  DOCUMENTACAO: { label: "Documentação", color: "indigo", dot: "bg-indigo-500 ring-indigo-500/20" },
  RETORNO_FOLLOWUP: { label: "Retorno / Follow-up", color: "amber", dot: "bg-amber-500 ring-amber-500/20" },
  APRESENTACAO_PROPOSTA: { label: "Proposta", color: "red", dot: "bg-rose-500 ring-rose-500/20" },
  LEMBRETE: { label: "Lembrete", color: "slate", dot: "bg-slate-400 ring-slate-400/20" },
  REUNIAO: { label: "Reunião", color: "teal", dot: "bg-teal-500 ring-teal-500/20" },
  LIGACAO: { label: "Ligação", color: "slate", dot: "bg-slate-400 ring-slate-400/20" },
  ASSINATURA_CONTRATO: { label: "Assinatura", color: "green", dot: "bg-emerald-500 ring-emerald-500/20" },
  ENTREGA_CHAVES: { label: "Entrega de Chaves", color: "gold", dot: "bg-platz-gold ring-platz-gold/20" },
  PLANTAO_VENDAS: { label: "Plantão", color: "teal", dot: "bg-teal-500 ring-teal-500/20" },
};

const FALLBACK_STYLE = { label: "Compromisso", color: "slate" as StatusColor, dot: "bg-slate-400 ring-slate-400/20" };

interface UpcomingAppointmentsTimelineProps {
  appointments: AppointmentItem[];
}

/** Compromissos (5.3 item 8): timeline vertical com bolinhas coloridas por tipo. */
export function UpcomingAppointmentsTimeline({ appointments }: UpcomingAppointmentsTimelineProps) {
  const [windowKey, setWindowKey] = useState<AppointmentWindow>("dia");

  const items = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + WINDOW_DAYS[windowKey]);
    return appointments.filter((a) => {
      const t = new Date(a.inicio).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
  }, [appointments, windowKey]);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-foreground">Compromissos</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Agenda comercial e visitas programadas</p>
        </div>
        <SegmentedToggle options={windowOptions} value={windowKey} onChange={setWindowKey} variant="primary" size="sm" />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Nenhum compromisso nesta janela"
          description="Visitas, lembretes e follow-ups agendados aparecerão aqui."
          className="flex-1"
        />
      ) : (
        <div className="relative pl-6 space-y-4 max-h-[420px] overflow-y-auto pr-1 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {items.map((item) => {
            const style = TYPE_STYLE[item.tipo] || FALLBACK_STYLE;
            const finished = item.status === "CONCLUIDO";
            return (
              <div key={item.id} className="relative">
                <span className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-card ring-2 ${style.dot}`} />

                <div className="bg-muted/40 hover:bg-muted/70 border border-border/60 rounded-xl p-3.5 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusPill color={style.color} size="sm" dot={false}>
                        {style.label}
                      </StatusPill>
                      <span className="text-[11px] font-semibold text-muted-foreground truncate">
                        {friendlyDateTime(item.inicio)}
                      </span>
                    </div>
                    {finished && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        Finalizado
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-foreground leading-snug mb-1">{item.titulo}</h4>

                  <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1.5 border-t border-border/40 mt-2">
                    <span className="truncate">
                      Cliente: <strong className="text-foreground">{item.cliente || "—"}</strong>
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-5 h-5 rounded-full bg-connect-blue/15 text-connect-blue font-bold text-[9px] flex items-center justify-center">
                        {initials(item.responsavel)}
                      </span>
                      <span className="truncate max-w-[100px]">{item.responsavel}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
