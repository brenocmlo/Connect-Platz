"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, MapPin, Link2, Mail, Check } from "lucide-react";
import { AppointmentItem } from "./AppointmentCard";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (app: AppointmentItem) => void;
  initialLeadName?: string;
  initialProperty?: string;
}

const APPOINTMENT_TYPES = [
  { id: "VISITA", label: "Visita ao Imóvel", color: "#1266C7" },
  { id: "LEMBRETE", label: "Lembrete", color: "#64748B" },
  { id: "DOCUMENTACAO", label: "Documentação", color: "#6366F1" },
  { id: "RETORNO", label: "Retorno / Follow-up", color: "#D97706" },
  { id: "PROPOSTA", label: "Proposta / Apresentação", color: "#DB2777" },
];

export function NewAppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialLeadName = "",
  initialProperty = "Reserva Imperial",
}: NewAppointmentModalProps) {
  const [tipo, setTipo] = useState("VISITA");
  const [cliente, setCliente] = useState(initialLeadName);
  const [empreendimento, setEmpreendimento] = useState(initialProperty);
  const [data, setData] = useState("2026-10-03");
  const [horaInicio, setHoraInicio] = useState("14:00");
  const [horaFim, setHoraFim] = useState("15:00");
  const [endereco, setEndereco] = useState("");
  const [linkOnline, setLinkOnline] = useState("");
  const [emailNotificacao, setEmailNotificacao] = useState("");
  const [notificarEmail, setNotificarEmail] = useState(true);
  const [descricao, setDescricao] = useState("");

  // Auto-preenchimento do Título conforme Seção 5.5: "Tipo — Cliente — Empreendimento"
  const selectedTypeLabel =
    APPOINTMENT_TYPES.find((t) => t.id === tipo)?.label.split(" ")[0] || "Compromisso";
  const autoTitle = `${selectedTypeLabel} — ${cliente || "Cliente"} — ${empreendimento || "Geral"}`;

  useEffect(() => {
    if (initialLeadName) setCliente(initialLeadName);
    if (initialProperty) setEmpreendimento(initialProperty);
  }, [initialLeadName, initialProperty]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataInicioIso = new Date(`${data}T${horaInicio}:00`).toISOString();
    const dataFimIso = new Date(`${data}T${horaFim}:00`).toISOString();

    const newApp: AppointmentItem = {
      id: `app-${Date.now()}`,
      titulo: autoTitle,
      tipo,
      dataInicio: dataInicioIso,
      dataFim: dataFimIso,
      status: "AGENDADO",
      lead: cliente ? { id: "temp", nome: cliente, telefone: "(47) 99872-3312" } : null,
      property: { id: "temp-p", nome: empreendimento, endereco },
      observacoes: descricao,
    };

    onSubmit(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay escurecido bg-black/60 */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
      />

      {/* Modal Central ~450px */}
      <div className="relative w-full max-w-[460px] bg-card border border-border rounded-xl shadow-2xl flex flex-col max-h-[92vh] z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-muted/20">
          <div>
            <h3 className="text-sm font-bold text-foreground">Novo Compromisso</h3>
            <p className="text-[11px] text-muted-foreground">
              Agende visitas, ligações de follow-up e reuniões de proposta
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário com Scroll Interno */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {/* 1. Tipo de Compromisso com Bolinha Colorida */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">
              Tipo de Compromisso *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {APPOINTMENT_TYPES.map((t) => {
                const isSelected = tipo === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipo(t.id)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-muted border-connect-blue ring-1 ring-connect-blue text-foreground font-bold"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="truncate text-[11px]">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Título Auto-Preenchido */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Título do Evento
            </label>
            <input
              type="text"
              readOnly
              value={autoTitle}
              className="w-full bg-muted/50 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-semibold cursor-not-allowed"
            />
          </div>

          {/* 3. Cliente / Lead */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Cliente / Lead *
              </label>
              <input
                type="text"
                required
                placeholder="Nome do cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Empreendimento
              </label>
              <input
                type="text"
                placeholder="Ex: Reserva Imperial"
                value={empreendimento}
                onChange={(e) => setEmpreendimento(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
              />
            </div>
          </div>

          {/* 4. Data e Horários (Início / Fim) */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Data *
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Início *
              </label>
              <input
                type="time"
                required
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Fim *
              </label>
              <input
                type="time"
                required
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
              />
            </div>
          </div>

          {/* 5. Endereço / Local */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Endereço / Local
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Av. Atlântica, 1500 — Plantão de Vendas"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
              />
            </div>
          </div>

          {/* 6. Link Online & E-mail */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Link Online (Meet/Zoom)
              </label>
              <div className="relative">
                <Link2 className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={linkOnline}
                  onChange={(e) => setLinkOnline(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                E-mail do Cliente
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={emailNotificacao}
                  onChange={(e) => setEmailNotificacao(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
                />
              </div>
            </div>
          </div>

          {/* Checkbox Notificar cliente por e-mail */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={notificarEmail}
              onChange={(e) => setNotificarEmail(e.target.checked)}
              className="rounded border-border text-connect-blue focus:ring-connect-blue"
            />
            <span className="text-[11px] text-muted-foreground">
              Enviar convite de calendário e notificar cliente por e-mail
            </span>
          </label>

          {/* Descrição */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Descrição / Pauta da Visita
            </label>
            <textarea
              rows={2}
              placeholder="Detalhes sobre a apresentação da planta ou documentação a levar..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue resize-none"
            />
          </div>

          {/* 7. RODAPÉ FIXO: Cancelar (ghost) + Criar (primário) */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2 bg-card">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-connect-blue hover:bg-connect-deep-blue text-white shadow-sm shadow-connect-blue/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              Criar Compromisso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
