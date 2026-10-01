"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  Flame,
  Calendar,
  Clock,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { AnimatedCrown } from "@/components/crm/AnimatedCrown";
import { CountUpNumber } from "@/components/crm/CountUpNumber";

interface BrokerRank {
  posicao: number;
  nome: string;
  avatar: string;
  vgv: number;
  vendas: number;
  veraneio: number;
  aderenciaSla: number;
  visitas: number;
  metaAtingida: number; // percentual
  badge?: string;
}

const mockRankings: BrokerRank[] = [
  {
    posicao: 1,
    nome: "Lucas Santos",
    avatar: "L",
    vgv: 3650000,
    vendas: 4,
    veraneio: 6,
    aderenciaSla: 98.5,
    visitas: 18,
    metaAtingida: 122,
    badge: "👑 Corretor do Mês",
  },
  {
    posicao: 2,
    nome: "Mariana Oliveira",
    avatar: "M",
    vgv: 2450000,
    vendas: 3,
    veraneio: 8,
    aderenciaSla: 96.0,
    visitas: 15,
    metaAtingida: 98,
    badge: "🚀 Mestre das Visitas",
  },
  {
    posicao: 3,
    nome: "Rafael Mendes",
    avatar: "R",
    vgv: 1850000,
    vendas: 2,
    veraneio: 4,
    aderenciaSla: 94.2,
    visitas: 12,
    metaAtingida: 82,
    badge: "🎯 Melhor Conversão",
  },
  {
    posicao: 4,
    nome: "Patrícia Dantas",
    avatar: "P",
    vgv: 1200000,
    vendas: 1,
    veraneio: 5,
    aderenciaSla: 92.0,
    visitas: 9,
    metaAtingida: 65,
  },
  {
    posicao: 5,
    nome: "Diego Barreto",
    avatar: "D",
    vgv: 950000,
    vendas: 1,
    veraneio: 3,
    aderenciaSla: 90.5,
    visitas: 8,
    metaAtingida: 55,
  },
];

export default function RankingGamificacaoPage() {
  const { setActionMessage } = useCrm();
  const [filterMode, setFilterMode] = useState<"vgv" | "vendas" | "veraneio" | "sla" | "visitas">("vgv");

  const fireCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#D9BB4C", "#1266C7", "#F8DA56", "#10B981"],
    });
    setActionMessage("🎉 Parabéns à equipe! A meta global da Connect Platz foi superada!");
    setTimeout(() => setActionMessage(null), 5000);
  };

  const sortedRankings = [...mockRankings].sort((a, b) => {
    if (filterMode === "vgv") return b.vgv - a.vgv;
    if (filterMode === "vendas") return b.vendas - a.vendas;
    if (filterMode === "veraneio") return b.veraneio - a.veraneio;
    if (filterMode === "sla") return b.aderenciaSla - a.aderenciaSla;
    return b.visitas - a.visitas;
  });

  const top1 = sortedRankings[0];
  const top2 = sortedRankings[1];
  const top3 = sortedRankings[2];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOPBAR & METAS GLOBAIS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Ranking & Gamificação Comercial</h2>
            <p className="text-xs text-slate-400">
              Pódio em tempo real dos campeões de VGV, vendas de imóveis e aderência aos SLAs.
            </p>
          </div>
        </div>

        {/* Barra de Progresso de Meta Global */}
        <div className="bg-[#0F1624] border border-[#1C2537] p-3.5 rounded-xl flex items-center gap-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-white">Meta Coletiva do Mês</span>
              <span className="text-[#D9BB4C] font-extrabold">108% Atingida</span>
            </div>
            <div className="w-48 h-2.5 bg-[#080C14] rounded-full overflow-hidden border border-[#1F2937]">
              <div className="h-full bg-gradient-to-r from-connect-blue to-[#D9BB4C] rounded-full w-[100%]" />
            </div>
          </div>

          <button
            onClick={fireCelebration}
            className="p-2.5 rounded-xl bg-[#D9BB4C] hover:bg-[#C5A73D] text-black font-black text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
            title="Comemorar Batimento de Meta"
          >
            <Sparkles className="w-4 h-4" />
            Celebrar
          </button>
        </div>
      </div>

      {/* 2. FILTROS MULTIDIMENSIONAIS */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0A0E17] border border-[#1C2537] p-2 rounded-2xl text-xs font-bold">
        <span className="text-slate-400 px-3 uppercase text-[10px] tracking-wider">Critério de Pódio:</span>
        {(
          [
            { key: "vgv", label: "VGV Vendido (R$)" },
            { key: "vendas", label: "Contratos Fechados" },
            { key: "veraneio", label: "Reservas de Temporada" },
            { key: "sla", label: "Aderência ao SLA (%)" },
            { key: "visitas", label: "Visitas Realizadas" },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterMode(f.key)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterMode === f.key
                ? "bg-connect-blue text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 3. PÓDIO ANIMADO (ESTILO HABITUS CRM COM ANIMATED CROWN) */}
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D9BB4C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mx-auto pt-10 pb-4 relative z-10">
          {/* 2º LUGAR (PRATA) */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-slate-700/80 border-2 border-slate-400 flex items-center justify-center font-black text-white text-lg shadow-lg mb-2">
              🥈
            </div>
            <span className="text-xs sm:text-sm font-bold text-white text-center">{top2.nome}</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
              {filterMode === "vgv"
                ? `R$ ${(top2.vgv / 1000000).toFixed(2)}M`
                : `${top2[filterMode as keyof BrokerRank]} ${filterMode}`}
            </span>
            <div className="w-full h-24 bg-gradient-to-t from-slate-800 to-slate-700/60 rounded-t-2xl mt-3 flex items-center justify-center font-black text-slate-300 text-xl border-t border-slate-500 shadow-md">
              2º
            </div>
          </div>

          {/* 1º LUGAR (OURO COM ANIMATED CROWN) */}
          <div className="flex flex-col items-center scale-105">
            <AnimatedCrown size="md" className="mb-1" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D9BB4C] to-[#F8DA56] border-2 border-white flex items-center justify-center font-black text-black text-xl shadow-xl shadow-[#D9BB4C]/30 mb-2">
              👑
            </div>
            <span className="text-sm sm:text-base font-black text-[#F8DA56] text-center">{top1.nome}</span>
            <span className="text-xs text-white font-extrabold font-mono mt-0.5">
              {filterMode === "vgv"
                ? `R$ ${(top1.vgv / 1000000).toFixed(2)}M`
                : `${top1[filterMode as keyof BrokerRank]} ${filterMode}`}
            </span>
            <div className="w-full h-36 bg-gradient-to-t from-[#B59837] to-[#D9BB4C] rounded-t-2xl mt-3 flex items-center justify-center font-black text-slate-950 text-2xl border-t-2 border-[#F8DA56] shadow-xl">
              1º Lugar
            </div>
          </div>

          {/* 3º LUGAR (BRONZE) */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-amber-950/80 border-2 border-amber-700 flex items-center justify-center font-black text-amber-400 text-lg shadow-lg mb-2">
              🥉
            </div>
            <span className="text-xs sm:text-sm font-bold text-white text-center">{top3.nome}</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
              {filterMode === "vgv"
                ? `R$ ${(top3.vgv / 1000000).toFixed(2)}M`
                : `${top3[filterMode as keyof BrokerRank]} ${filterMode}`}
            </span>
            <div className="w-full h-16 bg-gradient-to-t from-amber-950 to-amber-900/60 rounded-t-2xl mt-3 flex items-center justify-center font-black text-amber-500 text-lg border-t border-amber-700 shadow-md">
              3º
            </div>
          </div>
        </div>
      </div>

      {/* 4. TABELA COMPLETA DE CLASSIFICAÇÃO */}
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0F1624] text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-[#1C2537]">
            <tr>
              <th className="py-3 px-4">Posição</th>
              <th className="py-3 px-4">Corretor</th>
              <th className="py-3 px-4">VGV Vendido</th>
              <th className="py-3 px-4">Vendas</th>
              <th className="py-3 px-4">Veraneio</th>
              <th className="py-3 px-4">Aderência SLA</th>
              <th className="py-3 px-4">Visitas</th>
              <th className="py-3 px-4 text-right">Reconhecimento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C2537]">
            {sortedRankings.map((r, idx) => (
              <tr key={r.nome} className="hover:bg-[#0D131F]">
                <td className="py-3.5 px-4 font-bold text-slate-400">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      idx === 0
                        ? "bg-[#D9BB4C] text-black"
                        : idx === 1
                        ? "bg-slate-700 text-white"
                        : idx === 2
                        ? "bg-amber-900 text-amber-300"
                        : "bg-[#111827] text-slate-500"
                    }`}
                  >
                    {idx + 1}º
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-white">{r.nome}</td>
                <td className="py-3.5 px-4 font-extrabold text-[#D9BB4C]">
                  {r.vgv.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-300">{r.vendas} un</td>
                <td className="py-3.5 px-4 font-mono text-slate-300">{r.veraneio} reservas</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">{r.aderenciaSla}%</td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">{r.visitas}</td>
                <td className="py-3.5 px-4 text-right">
                  {r.badge ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#111827] text-[#D9BB4C] border border-[#D9BB4C]/30">
                      {r.badge}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600">Comercial</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
