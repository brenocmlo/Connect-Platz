"use client";

import React, { useState } from "react";
import {
  Building2,
  MapPin,
  CheckCircle2,
  Phone,
  MessageSquare,
  Layers,
  Sparkles,
} from "lucide-react";

interface Unit {
  numero: string;
  pavimento: string;
  status: "DISPONIVEL" | "RESERVADA" | "VENDIDA" | "BLOQUEADA";
  area: number;
  valor: number;
}

const mockPublicUnits: Unit[] = [
  { numero: "401", pavimento: "4º Andar", status: "DISPONIVEL", area: 125, valor: 980000 },
  { numero: "402", pavimento: "4º Andar", status: "RESERVADA", area: 125, valor: 980000 },
  { numero: "403", pavimento: "4º Andar", status: "VENDIDA", area: 135, valor: 1050000 },
  { numero: "404", pavimento: "4º Andar", status: "BLOQUEADA", area: 140, valor: 1200000 },
  { numero: "301", pavimento: "3º Andar", status: "DISPONIVEL", area: 125, valor: 920000 },
  { numero: "302", pavimento: "3º Andar", status: "DISPONIVEL", area: 125, valor: 920000 },
  { numero: "303", pavimento: "3º Andar", status: "VENDIDA", area: 135, valor: 990000 },
  { numero: "304", pavimento: "3º Andar", status: "DISPONIVEL", area: 125, valor: 940000 },
  { numero: "201", pavimento: "2º Andar", status: "VENDIDA", area: 125, valor: 880000 },
  { numero: "202", pavimento: "2º Andar", status: "DISPONIVEL", area: 125, valor: 880000 },
  { numero: "203", pavimento: "2º Andar", status: "DISPONIVEL", area: 125, valor: 950000 },
  { numero: "204", pavimento: "2º Andar", status: "RESERVADA", area: 125, valor: 900000 },
];

export default function PublicMirrorPage({ params }: { params: { slug: string } }) {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const getStatusColor = (status: Unit["status"]) => {
    switch (status) {
      case "DISPONIVEL":
        return "bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900";
      case "RESERVADA":
        return "bg-amber-950/80 border-amber-600 text-amber-300";
      case "VENDIDA":
        return "bg-red-950/80 border-red-800 text-red-400 opacity-60 cursor-not-allowed";
      case "BLOQUEADA":
        return "bg-slate-900 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed";
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col">
      {/* HEADER PÚBLICO TIMBRADO */}
      <header className="border-b border-[#1C2537] bg-[#0A0E17]/90 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1266C7] to-[#0D478F] flex items-center justify-center font-black text-white text-base shadow-md">
            CP
          </div>
          <div>
            <span className="text-base font-extrabold text-white">
              CONNECT <span className="text-[#D9BB4C]">PLATZ</span>
            </span>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
              Espelho de Vendas Oficial em Tempo Real
            </span>
          </div>
        </div>

        <a
          href="https://wa.me/5585999998888?text=Olá,%20gostaria%20de%20consultar%20uma%20unidade%20do%20espelho%20de%20vendas"
          target="_blank"
          rel="noreferrer"
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          Falar com o Plantão de Vendas
        </a>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-[#D9BB4C] font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Lançamento Frente Mar
          </div>
          <h1 className="text-2xl font-black text-white">Villa Platz Beach Residence • Torre Coral</h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#D9BB4C]" />
            Avenida Beira-Mar, Porto das Dunas — Aquiraz / CE
          </p>

          {/* Legenda de Disponibilidade */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[#1C2537] text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-md bg-emerald-500" /> Disponível
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-3 rounded-md bg-amber-500" /> Reservada
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-3 h-3 rounded-md bg-red-500" /> Vendida
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-3 rounded-md bg-slate-700" /> Bloqueada
            </span>
          </div>
        </div>

        {/* Grade de Unidades por Andar */}
        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl space-y-4">
          {["4º Andar", "3º Andar", "2º Andar"].map((andar) => (
            <div key={andar} className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="w-24 text-xs font-bold text-slate-400">{andar}</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                {mockPublicUnits
                  .filter((u) => u.pavimento === andar)
                  .map((u) => (
                    <div
                      key={u.numero}
                      className={`p-4 rounded-xl border transition-all ${getStatusColor(u.status)}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-black">{u.numero}</span>
                        <span className="text-[10px] font-bold">{u.status}</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-300">
                        {u.area} m² • {u.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
