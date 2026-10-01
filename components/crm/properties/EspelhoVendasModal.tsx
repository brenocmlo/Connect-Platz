"use client";

import React, { useState } from "react";
import { X, Layers, Share2, Eye, MapPin, CheckCircle2, Clock, Shield } from "lucide-react";

export interface PropertyUnitData {
  id: string;
  bloco: string;
  pavimento: string | null;
  numeroUnidade: string;
  status: "DISPONIVEL" | "RESERVADA" | "VENDIDA" | "BLOQUEADA";
  valor: number | any;
  areaPrivativa: number | any;
  corretorReserva?: string;
  reservaExpiraEm?: string;
}

export interface EmpreendimentoData {
  id: string;
  nome: string;
  slug: string;
  bairro?: string | null;
  cidade?: string | null;
  estagioObra?: string | null;
  valorVenda?: number | any;
  units?: PropertyUnitData[];
  [key: string]: any;
}

interface EspelhoVendasModalProps {
  property: EmpreendimentoData | null;
  onClose: () => void;
  onReserveSuccess?: () => void;
}

export function EspelhoVendasModal({
  property,
  onClose,
}: EspelhoVendasModalProps) {
  const [selectedBloco, setSelectedBloco] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnitData | null>(null);
  const [isReserveBoxOpen, setIsReserveBoxOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!property) return null;

  const units = property.units || [];
  const blocosDisponiveis = Array.from(new Set(units.map((u) => u.bloco || "Torre Principal")));
  const activeBloco = selectedBloco || blocosDisponiveis[0] || "Torre Principal";

  const unitsDoBloco = units.filter((u) => (u.bloco || "Torre Principal") === activeBloco);

  const andaresUnicos = Array.from(
    new Set(unitsDoBloco.map((u) => u.pavimento || "Andar Único"))
  ).sort().reverse();

  const totalDisponiveis = units.filter((u) => u.status === "DISPONIVEL").length;
  const totalReservadas = units.filter((u) => u.status === "RESERVADA").length;
  const totalVendidas = units.filter((u) => u.status === "VENDIDA").length;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/espelho/${property.slug}`;
    navigator.clipboard.writeText(url);
    setFeedbackMsg("Link do Espelho Público copiado com sucesso!");
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleConfirmReservation = () => {
    if (!selectedUnit || !leadName) return;
    selectedUnit.status = "RESERVADA";
    selectedUnit.corretorReserva = leadName;
    setIsReserveBoxOpen(false);
    setSelectedUnit(null);
    setLeadName("");
    setFeedbackMsg(`Unidade ${selectedUnit.numeroUnidade} reservada por 48h para ${leadName}!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const getStatusColor = (status: PropertyUnitData["status"]) => {
    switch (status) {
      case "DISPONIVEL":
        return "bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900 shadow-sm";
      case "RESERVADA":
        return "bg-amber-950/80 border-amber-600 text-amber-300 hover:bg-amber-900";
      case "VENDIDA":
        return "bg-red-950/80 border-red-700 text-red-300 opacity-80 cursor-not-allowed";
      case "BLOQUEADA":
        return "bg-slate-900 border-slate-700 text-slate-500 opacity-60 cursor-not-allowed";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho do Espelho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C2537] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/20 text-blue-400 border border-connect-blue/30 uppercase">
                {property.estagioObra || "Lançamento"}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#D9BB4C]" />
                {property.bairro}, {property.cidade}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">{property.nome}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Espelho de vendas interativo com bloqueio de reservas em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="bg-[#111827] hover:bg-[#1C2537] border border-[#1C2537] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-[#D9BB4C]" />
              Copiar Link Público
            </button>
            <a
              href={`/espelho/${property.slug}`}
              target="_blank"
              rel="noreferrer"
              className="bg-connect-blue hover:bg-[#0D478F] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver Externo
            </a>
          </div>
        </div>

        {feedbackMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {feedbackMsg}
          </div>
        )}

        {/* Resumo de Contagem & Legenda */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#080C14] border border-[#1C2537] p-4 rounded-2xl">
          {/* Seletor de Bloco */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-connect-blue" />
              Bloco:
            </span>
            <div className="flex gap-1.5 bg-[#0A0E17] p-1 rounded-xl border border-[#1C2537]">
              {blocosDisponiveis.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBloco(b)}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${
                    activeBloco === b
                      ? "bg-connect-blue text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Legenda Cromática com Contagens */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span className="text-slate-300">Disponíveis ({totalDisponiveis})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500" />
              <span className="text-slate-300">Reservadas ({totalReservadas})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-red-500" />
              <span className="text-slate-300">Vendidas ({totalVendidas})</span>
            </div>
          </div>
        </div>

        {/* Grade Visual de Andares e Unidades */}
        <div className="space-y-4">
          {andaresUnicos.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Nenhuma unidade cadastrada neste empreendimento ainda.
            </div>
          ) : (
            andaresUnicos.map((andar) => {
              const unidadesAndar = unitsDoBloco.filter((u) => (u.pavimento || "Andar Único") === andar);
              return (
                <div key={andar} className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="w-24 text-xs font-bold text-slate-400 flex-shrink-0">{andar}</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                    {unidadesAndar.map((unidade) => (
                      <button
                        key={unidade.id}
                        onClick={() => {
                          if (unidade.status === "DISPONIVEL") {
                            setSelectedUnit(unidade);
                            setIsReserveBoxOpen(true);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${getStatusColor(
                          unidade.status
                        )}`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-black">{unidade.numeroUnidade}</span>
                          <span className="text-[10px] font-extrabold uppercase">{unidade.status}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-300">
                          {Number(unidade.areaPrivativa || 100)} m² • R$ {(Number(unidade.valor || 0) / 1000).toFixed(0)}k
                        </div>
                        {unidade.corretorReserva && (
                          <div className="text-[10px] text-amber-300 font-semibold mt-1 truncate">
                            Reserva: {unidade.corretorReserva}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal interno de Reserva Rápida */}
        {isReserveBoxOpen && selectedUnit && (
          <div className="p-4 rounded-2xl bg-[#080C14] border border-[#D9BB4C]/40 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#D9BB4C]" />
              Confirmar Reserva da Unidade {selectedUnit.numeroUnidade} (48h de validade)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nome do Cliente / Lead interessado"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="sm:col-span-2 bg-[#0A0E17] border border-[#1C2537] rounded-xl p-2.5 text-xs text-white focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsReserveBoxOpen(false)}
                  className="flex-1 bg-[#111827] text-slate-400 text-xs font-semibold py-2.5 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmReservation}
                  className="flex-1 bg-[#D9BB4C] text-black text-xs font-black py-2.5 rounded-xl shadow-md"
                >
                  Reservar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
