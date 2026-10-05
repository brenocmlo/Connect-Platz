"use client";

import React from "react";
import { AnimatedCrown } from "@/components/crm/AnimatedCrown";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { BrokerRankItem } from "./types";

interface BrokerOfTheMonthCardProps {
  brokers: BrokerRankItem[];
  selectedBrokerId: string;
  onSelectBroker: (id: string) => void;
}

export function BrokerOfTheMonthCard({
  brokers,
  selectedBrokerId,
  onSelectBroker,
}: BrokerOfTheMonthCardProps) {
  const broker = brokers.find((b) => b.id === selectedBrokerId) || brokers[0];

  if (!broker) return null;

  const statMetrics = [
    { label: "VGV VENDIDO", value: broker.vgv, isCurrency: true },
    { label: "VENDAS", value: broker.vendas, isCurrency: false },
    { label: "VISITAS", value: broker.visitas, isCurrency: false },
    { label: "DOCUMENTAÇÕES", value: broker.documentos, isCurrency: false },
    { label: "CAPTAÇÕES", value: broker.captacoes, isCurrency: false },
    { label: "COMPROMISSOS", value: broker.compromissos, isCurrency: false },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-platz-gold/30 dark:border-platz-gold/40 bg-gradient-to-br from-amber-500/5 via-white to-connect-blue/5 dark:from-[#D9BB4C]/10 dark:via-[#0A0E17] dark:to-[#0D478F]/10 p-6 shadow-md">
      {/* Top Bar with Select Corretor ▾ */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-platz-gold to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            🏆 Corretor Destaque
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Período: Outubro / 2026
          </span>
        </div>

        {/* Select Corretor ▾ */}
        <div className="relative">
          <select
            value={selectedBrokerId}
            onChange={(e) => onSelectBroker(e.target.value)}
            className="bg-white dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-connect-blue cursor-pointer shadow-xs"
          >
            {brokers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome} ({b.posicao}º Lugar)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Profile Info */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
        {/* Avatar with Animated Crown & Glowing Gold Ring */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
              <AnimatedCrown size="md" />
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-platz-gold to-amber-300 p-1 ring-4 ring-platz-gold/60 shadow-xl shadow-platz-gold/25 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#0A0E17] text-platz-gold font-black text-2xl flex items-center justify-center">
                {broker.avatar}
              </div>
            </div>
          </div>
          <span className="mt-2 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-platz-gold text-slate-950 shadow-xs">
            {broker.posicao}º Lugar
          </span>
        </div>

        {/* Titles */}
        <div className="space-y-1 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {broker.nome}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-connect-blue/15 text-connect-blue font-bold">
              {broker.cargo}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Líder absoluto em conversão e VGV faturado no mês atual da Connect Platz.
          </p>
        </div>
      </div>

      {/* 6 Mini-cards Tint */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {statMetrics.map((stat, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-white/80 dark:bg-[#080C14]/80 border border-slate-200/80 dark:border-[#1F2937] backdrop-blur-xs flex flex-col justify-between shadow-xs"
          >
            <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider truncate">
              {stat.label}
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1 block">
              {stat.isCurrency ? (
                <CountUpNumber value={stat.value} prefix="R$ " decimals={0} />
              ) : (
                <CountUpNumber value={stat.value} />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
