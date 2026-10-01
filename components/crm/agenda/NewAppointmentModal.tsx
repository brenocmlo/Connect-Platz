"use client";

import React, { useState } from "react";
import { AppointmentItem } from "./AppointmentCard";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (app: AppointmentItem) => void;
}

export function NewAppointmentModal({ isOpen, onClose, onSubmit }: NewAppointmentModalProps) {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("VISITA");
  const [dataHora, setDataHora] = useState("2026-10-02T14:00");
  const [leadNome, setLeadNome] = useState("");
  const [imovel, setImovel] = useState("Villa Platz Beach");
  const [notas, setNotas] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp: AppointmentItem = {
      id: `app-${Date.now()}`,
      titulo,
      tipo,
      dataInicio: new Date(dataHora).toISOString(),
      dataFim: new Date(new Date(dataHora).getTime() + 60 * 60 * 1000).toISOString(),
      status: "AGENDADO",
      lead: leadNome ? { id: "temp", nome: leadNome, telefone: "85999999999" } : null,
      property: { id: "temp-p", nome: imovel },
      observacoes: notas,
    };
    onSubmit(newApp);
    setTitulo("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white">Agendar Novo Compromisso</h3>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Título do Evento</label>
            <input
              type="text"
              required
              placeholder="Ex: Visita ao Imóvel com Sr. Paulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              >
                <option value="VISITA">Visita ao Imóvel</option>
                <option value="REUNIAO">Reunião Presencial / Online</option>
                <option value="PROPOSTA">Apresentação de Proposta</option>
                <option value="ENTREGA_CHAVES">Entrega de Chaves</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Data e Hora</label>
              <input
                type="datetime-local"
                required
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Nome do Cliente / Lead</label>
            <input
              type="text"
              placeholder="Ex: Marcelo Cavalcante"
              value={leadNome}
              onChange={(e) => setLeadNome(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Empreendimento Vinculado</label>
            <input
              type="text"
              value={imovel}
              onChange={(e) => setImovel(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Observações Prévias</label>
            <textarea
              placeholder="Ex: Cliente tem interesse na cobertura, levar plantas."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white h-16 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#111827] text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#D9BB4C] text-black font-extrabold"
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
