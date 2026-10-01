"use client";

import React from "react";
import { Clock, User, MapPin, CheckCircle2 } from "lucide-react";

export interface AppointmentItem {
  id: string;
  titulo: string;
  tipo: string;
  dataInicio: string;
  dataFim: string;
  status: "AGENDADO" | "CONCLUIDO" | "CANCELADO" | "NAO_COMPARECEU";
  resultadoVisita?: string | null;
  observacoes?: string | null;
  lead?: { id: string; nome: string; telefone: string } | null;
  property?: { id: string; nome: string; endereco?: string | null; bairro?: string | null } | null;
  user?: { id: string; nome: string };
}

interface AppointmentCardProps {
  app: AppointmentItem;
  onOpenOutcomeModal: (app: AppointmentItem) => void;
}

export function AppointmentCard({ app, onOpenOutcomeModal }: AppointmentCardProps) {
  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case "VISITA":
        return "bg-connect-blue/20 text-blue-400 border-connect-blue/40";
      case "REUNIAO":
        return "bg-purple-950/80 text-purple-300 border-purple-800";
      case "ENTREGA_CHAVES":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-800";
      case "PROPOSTA":
        return "bg-amber-950/80 text-amber-300 border-amber-800";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="bg-[#0A0E17] border border-[#1C2537] hover:border-connect-blue/50 rounded-2xl p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getTypeColor(app.tipo)}`}>
            {app.tipo}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              app.status === "CONCLUIDO"
                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                : app.status === "NAO_COMPARECEU"
                ? "bg-red-950 text-red-400 border border-red-800"
                : "bg-[#111827] text-slate-300"
            }`}
          >
            {app.status}
          </span>
        </div>

        <h3 className="text-sm font-bold text-white tracking-tight">{app.titulo}</h3>

        <div className="space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-connect-blue" />
            {new Date(app.dataInicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} —{" "}
            {new Date(app.dataFim).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </div>

          {app.lead && (
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-white font-semibold">{app.lead.nome}</span>
            </div>
          )}

          {app.property && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#D9BB4C]" />
              <span>{app.property.nome} • {app.property.bairro || "Fortaleza"}</span>
            </div>
          )}

          {app.observacoes && (
            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-[#1C2537]">
              "{app.observacoes}"
            </p>
          )}

          {app.resultadoVisita && (
            <div className="p-2.5 rounded-xl bg-[#0F1624] border border-[#1C2537] mt-2">
              <span className="text-[10px] font-bold uppercase text-[#D9BB4C] block mb-0.5">
                Desfecho Registrado:
              </span>
              <p className="text-xs text-slate-300">{app.resultadoVisita}</p>
            </div>
          )}
        </div>
      </div>

      {app.status === "AGENDADO" && (
        <button
          onClick={() => onOpenOutcomeModal(app)}
          className="w-full bg-[#111827] hover:bg-connect-blue hover:text-white border border-[#1F2937] text-slate-300 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Registrar Desfecho da Visita
        </button>
      )}
    </div>
  );
}
