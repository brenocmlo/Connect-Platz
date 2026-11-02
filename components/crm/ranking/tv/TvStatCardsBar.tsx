// components/crm/ranking/tv/TvStatCardsBar.tsx
// Faixa superior dos 6 Big Numbers / KPIs Globais de alto impacto (Habitus CRM Style).

"use client";

import React from "react";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { formatBRL, formatCompactBRL } from "@/components/crm/dashboard/format";
import type { TvHeaderKpis } from "./types";

interface TvStatCardsBarProps {
  kpis: TvHeaderKpis;
}

export function TvStatCardsBar({ kpis }: TvStatCardsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 px-2 sm:px-4 py-2">
      {/* 1. VGV TOTAL */}
      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-[#111C30] to-[#0A1120] border border-[#1E2E4A] shadow-md text-center transition-all hover:border-[#1266C7]/60">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          VGV TOTAL
        </span>
        <div className="text-lg sm:text-2xl font-black text-white tracking-tight my-0.5">
          {kpis.vgvTotal >= 1_000_000 ? (
            <>
              <span className="text-sm sm:text-base font-semibold mr-1 text-slate-300">R$</span>
              <CountUpNumber
                value={Number((kpis.vgvTotal / 1_000_000).toFixed(2))}
                decimals={2}
                suffix=" Mi"
              />
            </>
          ) : (
            <CountUpNumber
              value={kpis.vgvTotal}
              prefix="R$ "
              decimals={0}
            />
          )}
        </div>
        <span className="text-[10px] font-medium text-slate-400 truncate max-w-full">
          Ticket médio {formatBRL(kpis.ticketMedio)}
        </span>
      </div>

      {/* 2. ANÁLISES TOTAL */}
      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-[#111C30] to-[#0A1120] border border-[#1E2E4A] shadow-md text-center transition-all hover:border-[#1266C7]/60">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          ANÁLISES TOTAL
        </span>
        <div className="text-lg sm:text-2xl font-black text-white tracking-tight my-0.5">
          <CountUpNumber value={kpis.analisesTotal} />
        </div>
        <span className="text-[10px] font-medium text-slate-400 truncate max-w-full">
          Volume de crédito/propostas
        </span>
      </div>

      {/* 3. APROVAÇÕES TOTAL */}
      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-[#111C30] to-[#0A1120] border border-[#1E2E4A] shadow-md text-center transition-all hover:border-[#1266C7]/60">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          APROVAÇÕES TOTAL
        </span>
        <div className="text-lg sm:text-2xl font-black text-white tracking-tight my-0.5">
          <CountUpNumber value={kpis.aprovacoesTotal} />
        </div>
        <span className="text-[10px] font-bold text-emerald-400 truncate max-w-full">
          {kpis.taxaConversaoAnaliseAprovacao}% AN → AP
        </span>
      </div>

      {/* 4. VENDAS TOTAL */}
      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-[#111C30] to-[#0A1120] border border-[#1E2E4A] shadow-md text-center transition-all hover:border-[#1266C7]/60">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          VENDAS TOTAL
        </span>
        <div className="text-lg sm:text-2xl font-black text-white tracking-tight my-0.5">
          <CountUpNumber value={kpis.vendasTotal} />
        </div>
        <span className="text-[10px] font-bold text-emerald-400 truncate max-w-full">
          {kpis.taxaConversaoAprovacaoVenda}% AP → VD
        </span>
      </div>

      {/* 5. IPC */}
      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-[#111C30] to-[#0A1120] border border-[#1E2E4A] shadow-md text-center transition-all hover:border-[#1266C7]/60">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          IPC
        </span>
        <div className="text-lg sm:text-2xl font-black text-white tracking-tight my-0.5">
          <CountUpNumber value={kpis.ipc} decimals={2} />
        </div>
        <span className="text-[10px] font-medium text-slate-400 truncate max-w-full">
          {kpis.totalCorretoresAtivos} corretores ativos
        </span>
      </div>

      {/* 6. CORRETORES PRODUTIVOS */}
      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-[#111C30] to-[#0A1120] border border-[#1E2E4A] shadow-md text-center transition-all hover:border-[#1266C7]/60">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          CORRETORES PRODUTIVOS
        </span>
        <div className="text-lg sm:text-2xl font-black text-white tracking-tight my-0.5">
          <CountUpNumber value={kpis.corretoresProdutivosPct} decimals={1} suffix="%" />
        </div>
        <span className="text-[10px] font-medium text-slate-400 truncate max-w-full">
          {kpis.corretoresProdutivosQtd} de {kpis.totalCorretoresAtivos} ativos
        </span>
      </div>
    </div>
  );
}
