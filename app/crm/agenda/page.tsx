"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import {
  AppointmentItem,
  AgendaHeader,
  AgendaDayView,
  AgendaWeekView,
  AgendaMonthView,
  NewAppointmentModal,
  VisitOutcomeModal,
  normalizeAppointmentType,
} from "@/components/crm/agenda";

/** Normaliza o compromisso vindo da API (datas ISO e tipo do enum). */
function toItem(raw: any): AppointmentItem {
  return {
    ...raw,
    tipo: normalizeAppointmentType(raw.tipo) || raw.tipo,
    dataInicio: new Date(raw.dataInicio).toISOString(),
    dataFim: new Date(raw.dataFim).toISOString(),
  };
}

export default function AgendaPage() {
  const { setActionMessage } = useCrm();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<"dia" | "semana" | "mes">("semana");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedForOutcome, setSelectedForOutcome] = useState<AppointmentItem | null>(null);

  const notify = useCallback(
    (msg: string) => {
      setActionMessage(msg);
      setTimeout(() => setActionMessage(null), 4000);
    },
    [setActionMessage]
  );

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/agenda", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoadError(data?.error || "Não foi possível carregar a agenda.");
        return;
      }
      setAppointments((data.appointments || []).map(toItem));
    } catch {
      setLoadError("Falha de conexão ao carregar a agenda.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleNavigate = (direction: "prev" | "today" | "next") => {
    if (direction === "today") {
      setCurrentDate(new Date());
      return;
    }
    const newDate = new Date(currentDate);
    const step = direction === "next" ? 1 : -1;
    if (viewMode === "dia") newDate.setDate(newDate.getDate() + step);
    else if (viewMode === "semana") newDate.setDate(newDate.getDate() + step * 7);
    else newDate.setMonth(newDate.getMonth() + step);
    setCurrentDate(newDate);
  };

  // O modal já persiste via API e devolve o compromisso real criado
  const handleCreated = (created: AppointmentItem) => {
    setAppointments((prev) =>
      [...prev, toItem(created)].sort(
        (a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
      )
    );
    notify("Compromisso agendado com sucesso!");
  };

  const handleSaveOutcome = async (
    appId: string,
    status: "CONCLUIDO" | "NAO_COMPARECEU",
    resultado: string
  ) => {
    const previous = appointments;
    // Atualização otimista com rollback em caso de falha
    setAppointments((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status, resultadoVisita: resultado } : a))
    );
    try {
      const res = await fetch(`/api/agenda/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resultadoVisita: resultado || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Não foi possível registrar o desfecho.");
      setAppointments((prev) => prev.map((a) => (a.id === appId ? toItem(data.appointment) : a)));
      notify("Desfecho registrado com sucesso!");
    } catch (e: any) {
      setAppointments(previous);
      notify(e?.message || "Falha ao registrar o desfecho.");
    }
  };

  const filteredAppointments = appointments.filter(
    (app) => selectedType === "ALL" || app.tipo === selectedType
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <AgendaHeader
        currentDate={currentDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        onNavigate={handleNavigate}
        onNewAppointment={() => setIsNewModalOpen(true)}
      />

      {loading ? (
        <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-connect-blue" />
          <span className="text-xs">Carregando compromissos...</span>
        </div>
      ) : loadError ? (
        <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="text-sm font-semibold text-foreground">{loadError}</p>
          <button
            onClick={loadAppointments}
            className="px-4 py-2 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold transition-all hover:scale-[1.02]"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}

      <NewAppointmentModal
        isOpen={isNewModalOpen}
        initialDate={currentDate}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreated}
      />

      <VisitOutcomeModal
        app={selectedForOutcome}
        onClose={() => setSelectedForOutcome(null)}
        onSaveOutcome={handleSaveOutcome}
      />
    </div>
  );
}
