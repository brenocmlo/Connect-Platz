// components/crm/ranking/tv/TvRankingContainer.tsx
// Shell completo do Painel Modo TV / War Room de Vendas (Habitus CRM Style).

"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, RefreshCw, Tv } from "lucide-react";
import { useTvRankingData } from "./useTvRankingData";
import { TvHeaderBranding } from "./TvHeaderBranding";
import { TvStatCardsBar } from "./TvStatCardsBar";
import { TvMotivationalBanner } from "./TvMotivationalBanner";
import { TvBrokerTablesGrid } from "./TvBrokerTablesGrid";

export function TvRankingContainer() {
  const { data, loading, error, selectedPeriod, setSelectedPeriod, lastUpdated, reload } =
    useTvRankingData();

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center text-white p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1266C7] to-[#0D478F] flex items-center justify-center animate-bounce shadow-xl shadow-[#1266C7]/30">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wide">Carregando Sala de Vendas...</span>
          <span className="text-xs text-slate-400 font-medium">Sincronizando rankings e metas</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-md w-full p-6 rounded-2xl bg-[#0D1628] border border-rose-500/30 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-white">Falha ao conectar com o Painel de TV</h2>
          <p className="text-xs text-slate-400">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={reload}
              className="px-4 py-2 rounded-xl bg-[#1266C7] hover:bg-[#0D478F] text-xs font-bold text-white flex items-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
            </button>
            <Link
              href="/crm/ranking"
              className="px-4 py-2 rounded-xl bg-[#16233B] hover:bg-[#1E3052] text-xs font-bold text-slate-300 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao CRM
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between select-none overflow-x-hidden font-sans">
      {/* Botão de retorno discreto ao CRM no canto superior esquerdo */}
      <div className="absolute top-3 left-3 z-30 opacity-40 hover:opacity-100 transition-opacity">
        <Link
          href="/crm/ranking"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0E1A30]/80 hover:bg-[#152748] border border-[#1E2E4A] text-[11px] font-semibold text-slate-300 hover:text-white backdrop-blur shadow-sm"
          title="Voltar ao CRM"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao CRM</span>
        </Link>
      </div>

      <div className="space-y-2.5 sm:space-y-3 pb-4">
        {/* 1. Top Bar Branding */}
        <TvHeaderBranding
          nome={data.organization.nome}
          logoUrl={data.organization.logoUrl}
          slogan={data.organization.slogan}
        />

        {/* 2. KPIs Globais de Alto Impacto */}
        <TvStatCardsBar kpis={data.kpis} />

        {/* 3. Ticker Motivacional + Controles */}
        <TvMotivationalBanner
          frase={data.quote.frase}
          autor={data.quote.autor}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
          onRefresh={reload}
          loading={loading}
          lastUpdated={lastUpdated}
        />

        {/* 4. Tabelas Principais de Performance por Corretor */}
        <TvBrokerTablesGrid brokers={data.brokers} orgName={data.organization.nome} />
      </div>

      {/* Rodapé Informativo da TV */}
      <footer className="px-4 py-2 border-t border-[#121E36] bg-[#05080F]/90 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Painel War Room em tempo real • Connect Platz</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>Pressione F11 para alternar Tela Cheia</span>
          <span>Última atualização: {lastUpdated.toLocaleTimeString("pt-BR")}</span>
        </div>
      </footer>
    </div>
  );
}
