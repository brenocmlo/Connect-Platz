"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, MapPin, Link2, Mail, Loader2, AlertCircle } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { AppointmentItem, APPOINTMENT_FORM_TYPES, AppointmentEnumType, localDateKey } from "./types";
import { SearchCombobox } from "./SearchCombobox";
import { useCrmLookups } from "./useCrmLookups";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Chamado somente após a API confirmar a criação, com o compromisso real retornado. */
  onSubmit: (app: AppointmentItem) => void;
  initialLeadId?: string;
  initialLeadName?: string;
  initialProperty?: string;
  initialDate?: Date;
}

const inputClass =
  "w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue";
const labelClass = "text-[11px] font-semibold text-muted-foreground block mb-1";

export function NewAppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialLeadId,
  initialLeadName,
  initialProperty,
  initialDate,
}: NewAppointmentModalProps) {
  const { user } = useCrm();
  const isManagerRole = Boolean(user && user.role !== "CORRETOR");
  const { leads, properties, members, loading } = useCrmLookups({
    enabled: isOpen,
    members: isManagerRole,
  });

  const [tipo, setTipo] = useState<AppointmentEnumType>("VISITA");
  const [leadId, setLeadId] = useState<string | null>(initialLeadId || null);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [responsavelId, setResponsavelId] = useState<string>("");
  const [data, setData] = useState(localDateKey(initialDate || new Date()));
  const [horaInicio, setHoraInicio] = useState("14:00");
  const [horaFim, setHoraFim] = useState("15:00");
  const [endereco, setEndereco] = useState("");
  const [linkOnline, setLinkOnline] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [descricao, setDescricao] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pré-seleção vinda de outra tela (ex.: Drawer do lead)
  useEffect(() => {
    if (!isOpen) return;
    if (initialLeadId) {
      setLeadId(initialLeadId);
    } else if (initialLeadName && leads.length > 0) {
      const matches = leads.filter((l) => l.nome.toLowerCase() === initialLeadName.toLowerCase());
      if (matches.length === 1) setLeadId(matches[0].id);
    }
    if (initialProperty && properties.length > 0) {
      const match = properties.find((p) => p.nome.toLowerCase() === initialProperty.toLowerCase());
      if (match) setPropertyId(match.id);
    }
  }, [isOpen, initialLeadId, initialLeadName, initialProperty, leads, properties]);

  useEffect(() => {
    if (initialDate) setData(localDateKey(initialDate));
  }, [initialDate]);

  const selectedLead = leads.find((l) => l.id === leadId) || null;
  const selectedProperty = properties.find((p) => p.id === propertyId) || null;
  const typeMeta = APPOINTMENT_FORM_TYPES.find((t) => t.id === tipo);
  const leadRequired = tipo !== "LEMBRETE";

  // Título auto-preenchido (seção 5.5): "Visita — Cliente — Empreendimento"
  const autoTitle = [
    typeMeta?.label.split(" / ")[0] || "Compromisso",
    selectedLead?.nome || initialLeadName,
    selectedProperty?.nome,
  ]
    .filter(Boolean)
    .join(" — ");

  const leadOptions = useMemo(
    () =>
      leads.map((l) => ({
        id: l.id,
        label: l.nome,
        sublabel: [l.telefone, l.corretorNome].filter(Boolean).join(" · "),
      })),
    [leads]
  );
  const propertyOptions = useMemo(
    () =>
      properties.map((p) => ({
        id: p.id,
        label: p.nome,
        sublabel: [p.construtora, p.bairro, p.cidade].filter(Boolean).join(" · "),
      })),
    [properties]
  );

  if (!isOpen) return null;

  const resetAndClose = () => {
    setError(null);
    setDescricao("");
    setEndereco("");
    setLinkOnline("");
    setEmailCliente("");
    if (!initialLeadId) setLeadId(null);
    setPropertyId(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (leadRequired && !leadId) {
      setError("Selecione um cliente/lead da lista.");
      return;
    }
    const inicio = new Date(`${data}T${horaInicio}:00`);
    const fim = new Date(`${data}T${horaFim}:00`);
    if (fim <= inicio) {
      setError("O horário de término deve ser posterior ao início.");
      return;
    }

    // Campos sem coluna própria no schema vão para as observações do compromisso
    const extras = [
      endereco && `Local: ${endereco}`,
      linkOnline && `Link: ${linkOnline}`,
      emailCliente && `E-mail do cliente: ${emailCliente}`,
    ].filter(Boolean);
    const observacoes = [descricao.trim(), ...extras].filter(Boolean).join("\n");

    setSubmitting(true);
    try {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          titulo: autoTitle,
          dataInicio: inicio.toISOString(),
          dataFim: fim.toISOString(),
          leadId,
          propertyId,
          userId: isManagerRole && responsavelId ? responsavelId : undefined,
          observacoes: observacoes || null,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.error || "Não foi possível agendar o compromisso.");
        return;
      }
      onSubmit({
        ...payload.appointment,
        dataInicio: new Date(payload.appointment.dataInicio).toISOString(),
        dataFim: new Date(payload.appointment.dataFim).toISOString(),
      });
      resetAndClose();
    } catch {
      setError("Falha de conexão ao agendar o compromisso.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={resetAndClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
      />

      <div className="relative w-full max-w-[460px] bg-card border border-border rounded-xl shadow-2xl flex flex-col max-h-[92vh] z-10 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-muted/20">
          <div>
            <h3 className="text-sm font-bold text-foreground">Novo Compromisso</h3>
            <p className="text-[11px] text-muted-foreground">
              Agende visitas, follow-ups, documentação e propostas
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 text-xs">
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {/* Tipo com bolinha colorida */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                Tipo de Compromisso *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {APPOINTMENT_FORM_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipo(t.id)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all ${
                      tipo === t.id
                        ? "bg-muted border-connect-blue ring-1 ring-connect-blue text-foreground font-bold"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                    <span className="truncate text-[11px]">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Título do Evento</label>
              <input
                type="text"
                readOnly
                value={autoTitle}
                className="w-full bg-muted/50 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className={labelClass}>Cliente / Lead {leadRequired && "*"}</label>
              <SearchCombobox
                options={leadOptions}
                value={leadId}
                onChange={setLeadId}
                loading={loading}
                required={leadRequired}
                disabled={Boolean(initialLeadId)}
                placeholder="Busque por nome ou telefone..."
                emptyText="Nenhum lead encontrado na sua carteira"
              />
            </div>

            <div>
              <label className={labelClass}>Empreendimento</label>
              <SearchCombobox
                options={propertyOptions}
                value={propertyId}
                onChange={setPropertyId}
                loading={loading}
                placeholder="Busque o empreendimento..."
                emptyText="Nenhum empreendimento cadastrado"
              />
            </div>

            {isManagerRole && members.length > 0 && (
              <div>
                <label className={labelClass}>Responsável</label>
                <select
                  value={responsavelId}
                  onChange={(e) => setResponsavelId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Eu mesmo ({user?.nome})</option>
                  {members
                    .filter((m) => m.id !== user?.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={labelClass}>Data *</label>
                <input type="date" required value={data} onChange={(e) => setData(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Início *</label>
                <input type="time" required value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fim *</label>
                <input type="time" required value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Endereço / Local</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder={selectedProperty?.endereco || "Endereço do encontro"}
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Link (Meet/Zoom)</label>
                <div className="relative">
                  <Link2 className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={linkOnline}
                    onChange={(e) => setLinkOnline(e.target.value)}
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>E-mail do Cliente</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                  <input
                    type="email"
                    placeholder={selectedLead?.email || "cliente@email.com"}
                    value={emailCliente}
                    onChange={(e) => setEmailCliente(e.target.value)}
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Descrição / Pauta</label>
              <textarea
                rows={2}
                placeholder="Detalhes da apresentação ou documentos a levar..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-[11px] animate-in fade-in-0">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Rodapé fixo */}
          <div className="p-3 border-t border-border flex items-center justify-end gap-2 bg-card">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-connect-blue hover:bg-connect-deep-blue text-white shadow-lg shadow-connect-blue/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100 flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
