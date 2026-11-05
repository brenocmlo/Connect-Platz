"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Pencil,
  Trash2,
  CheckCircle2,
  Search,
  Filter,
} from "lucide-react";
import { AppointmentItem, getTypeConfig } from "./types";

interface AgendaTodosViewProps {
  appointments: AppointmentItem[];
  isCustomRange?: boolean;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (d: string) => void;
  onEndDateChange?: (d: string) => void;
  onOpenOutcomeModal: (app: AppointmentItem) => void;
  onEdit: (app: AppointmentItem) => void;
  onDelete: (app: AppointmentItem) => void;
  onNewAppointment: () => void;
}

export function AgendaTodosView({
  appointments,
  isCustomRange = false,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onOpenOutcomeModal,
  onEdit,
  onDelete,
  onNewAppointment,
}: AgendaTodosViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return appointments.filter((app) => {
      // Date range filter when in custom range mode
      if (isCustomRange) {
        const appDate = new Date(app.dataInicio).toISOString().slice(0, 10);
        if (startDate && appDate < startDate) return false;
        if (endDate && appDate > endDate) return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && app.status !== statusFilter) return false;

      // Text search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = app.titulo?.toLowerCase().includes(term);
        const matchLead = app.lead?.nome?.toLowerCase().includes(term);
        const matchProp = app.property?.nome?.toLowerCase().includes(term);
        if (!matchTitle && !matchLead && !matchProp) return false;
      }

      return true;
    });
  }, [appointments, isCustomRange, startDate, endDate, statusFilter, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Barra de Controles: Busca, Filtro Status e Intervalo Personalizado */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, lead ou imóvel..."
              className="w-full bg-muted/60 border border-border text-foreground rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-connect-blue"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-muted/60 border border-border text-foreground rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-connect-blue cursor-pointer"
            >
              <option value="ALL">Todos os status</option>
              <option value="AGENDADO">Agendado</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="NAO_COMPARECEU">Não compareceu</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Controles de Data para Modo Personalizado */}
        {isCustomRange && (
          <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl p-1.5 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground px-1">Período:</span>
            <input
              type="date"
              value={startDate || ""}
              onChange={(e) => onStartDateChange && onStartDateChange(e.target.value)}
              className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:ring-2 focus:ring-connect-blue"
            />
            <span className="text-muted-foreground">até</span>
            <input
              type="date"
              value={endDate || ""}
              onChange={(e) => onEndDateChange && onEndDateChange(e.target.value)}
              className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:ring-2 focus:ring-connect-blue"
            />
          </div>
        )}

        <div className="text-xs text-muted-foreground font-medium shrink-0">
          Total: <span className="font-bold text-foreground">{filtered.length}</span> compromissos
        </div>
      </div>

      {/* Lista de Compromissos */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center text-slate-400">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Nenhum compromisso encontrado
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Nenhum registro coincide com os filtros aplicados neste período.
            </p>
          </div>
          <button
            onClick={onNewAppointment}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-connect-blue text-white text-xs font-bold hover:bg-connect-deep-blue transition-all"
          >
            Agendar Compromisso
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((app) => {
            const config = getTypeConfig(app.tipo);
            const dataStr = new Date(app.dataInicio).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
            const horaIni = new Date(app.dataInicio).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const horaFim = new Date(app.dataFim).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={app.id}
                style={{ borderLeftColor: config.rawHex }}
                className="bg-card border border-border border-l-[3px] rounded-xl p-4 transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
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
                          : app.status === "CANCELADO"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
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
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Calendar className="w-3.5 h-3.5 text-connect-blue" />
                      <span>{dataStr}</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400 ml-1" />
                      <span>
                        {horaIni} — {horaFim}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-foreground truncate">
                    {app.titulo}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {app.lead && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-foreground">
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
                    {app.user && (
                      <span className="text-[11px] text-muted-foreground">
                        Responsável: <strong className="text-foreground">{app.user.nome}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border shrink-0">
                  <button
                    type="button"
                    onClick={() => onEdit(app)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-connect-blue hover:bg-connect-blue/10 border border-border transition-colors"
                    title="Editar compromisso"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(app)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-border transition-colors"
                    title="Excluir compromisso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {app.status === "AGENDADO" && (
                    <button
                      type="button"
                      onClick={() => onOpenOutcomeModal(app)}
                      className="px-3 py-1.5 rounded-lg bg-muted hover:bg-connect-blue hover:text-white border border-border text-foreground text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Registrar Parecer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
