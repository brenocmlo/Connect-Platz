"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { AppointmentItem, APPOINTMENT_FORM_TYPES, AppointmentEnumType, localDateKey } from "./types";
import { useCrmLookups } from "./useCrmLookups";

interface EditAppointmentModalProps {
  isOpen: boolean;
  app: AppointmentItem | null;
  onClose: () => void;
  onUpdated: (app: AppointmentItem) => void;
}

const inputClass =
  "w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue";
const labelClass = "text-[11px] font-semibold text-muted-foreground block mb-1";

export function EditAppointmentModal({
  isOpen,
  app,
  onClose,
  onUpdated,
}: EditAppointmentModalProps) {
  const { leads, properties } = useCrmLookups({ enabled: isOpen });

  const [tipo, setTipo] = useState<AppointmentEnumType>("VISITA");
  const [titulo, setTitulo] = useState("");
  const [status, setStatus] = useState<"AGENDADO" | "CONCLUIDO" | "NAO_COMPARECEU" | "CANCELADO">("AGENDADO");
  const [leadId, setLeadId] = useState<string>("");
  const [propertyId, setPropertyId] = useState<string>("");
  const [data, setData] = useState("");
  const [horaInicio, setHoraInicio] = useState("14:00");
  const [horaFim, setHoraFim] = useState("15:00");
  const [observacoes, setObservacoes] = useState("");
  const [resultadoVisita, setResultadoVisita] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (app && isOpen) {
      setTipo((app.tipo as AppointmentEnumType) || "VISITA");
      setTitulo(app.titulo || "");
      setStatus((app.status as any) || "AGENDADO");
      setLeadId(app.leadId || app.lead?.id || "");
      setPropertyId(app.propertyId || app.property?.id || "");

      const inicioDate = new Date(app.dataInicio);
      const fimDate = new Date(app.dataFim);
      setData(localDateKey(inicioDate));
      setHoraInicio(
        `${String(inicioDate.getHours()).padStart(2, "0")}:${String(inicioDate.getMinutes()).padStart(2, "0")}`
      );
      setHoraFim(
        `${String(fimDate.getHours()).padStart(2, "0")}:${String(fimDate.getMinutes()).padStart(2, "0")}`
      );
      setObservacoes(app.observacoes || "");
      setResultadoVisita(app.resultadoVisita || "");
      setError(null);
    }
  }, [app, isOpen]);

  if (!isOpen || !app) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titulo.trim()) {
      setError("O título do compromisso é obrigatório.");
      return;
    }

    const inicio = new Date(`${data}T${horaInicio}:00`);
    const fim = new Date(`${data}T${horaFim}:00`);
    if (fim <= inicio) {
      setError("O horário de término deve ser posterior ao início.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/agenda/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          titulo: titulo.trim(),
          status,
          dataInicio: inicio.toISOString(),
          dataFim: fim.toISOString(),
          leadId: leadId || null,
          propertyId: propertyId || null,
          observacoes: observacoes.trim() || null,
          resultadoVisita: resultadoVisita.trim() || null,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.error || "Não foi possível salvar alterações.");
        return;
      }

      onUpdated({
        ...payload.appointment,
        dataInicio: new Date(payload.appointment.dataInicio).toISOString(),
        dataFim: new Date(payload.appointment.dataFim).toISOString(),
      });
      onClose();
    } catch {
      setError("Falha de conexão ao atualizar compromisso.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
      />

      <div className="relative w-full max-w-[480px] bg-card border border-border rounded-xl shadow-2xl flex flex-col max-h-[92vh] z-10 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-muted/20">
          <div>
            <h3 className="text-sm font-bold text-foreground">Editar Compromisso</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Atualize datas, cliente ou desfecho deste agendamento.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className={labelClass}>Tipo de Compromisso</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as AppointmentEnumType)}
              className={inputClass}
            >
              {APPOINTMENT_FORM_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={inputClass}
              placeholder="Ex: Visita — João Silva — Reserva das Dunas"
            />
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className={inputClass}
            >
              <option value="AGENDADO">Agendado</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="NAO_COMPARECEU">Não Compareceu</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className={labelClass}>Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Início</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Término</label>
              <input
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Cliente / Lead</label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className={inputClass}
            >
              <option value="">Sem cliente vinculado</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome} {l.telefone ? `(${l.telefone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Imóvel / Empreendimento</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className={inputClass}
            >
              <option value="">Sem imóvel vinculado</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} {p.bairro ? `(${p.bairro})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Observações</label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className={inputClass}
              placeholder="Notas internas..."
            />
          </div>

          {(status === "CONCLUIDO" || status === "NAO_COMPARECEU" || resultadoVisita) && (
            <div>
              <label className={labelClass}>Desfecho / Parecer da Visita</label>
              <textarea
                rows={2}
                value={resultadoVisita}
                onChange={(e) => setResultadoVisita(e.target.value)}
                className={inputClass}
                placeholder="Ex: Cliente gostou da planta, vai enviar proposta até sexta-feira."
              />
            </div>
          )}

          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
