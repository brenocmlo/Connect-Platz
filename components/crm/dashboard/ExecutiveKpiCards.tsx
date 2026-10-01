"use client";

import React from "react";
import { DollarSign, Building, Home, Users, ArrowUpRight } from "lucide-react";
import { CountUpNumber } from "@/components/crm/CountUpNumber";

export function ExecutiveKpiCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: VGV Total */}
      <div className="bg-[#0C1220] border border-[#1C2537] hover:border-connect-blue/50 rounded-2xl p-5 shadow-lg transition-all group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">VGV Acumulado</span>
          <div className="p-2 rounded-xl bg-[#D9BB4C]/15 border border-[#D9BB4C]/30 text-[#D9BB4C]">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-[#D9BB4C] tracking-tight">
          <CountUpNumber value={8450000} prefix="R$ " decimals={2} />
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="text-emerald-400 font-bold flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.5%
          </span>
          <span>em relação ao mês anterior</span>
        </div>
      </div>

      {/* Card 2: Vendas Fechadas */}
      <div className="bg-[#0C1220] border border-[#1C2537] hover:border-connect-blue/50 rounded-2xl p-5 shadow-lg transition-all group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vendas Fechadas</span>
          <div className="p-2 rounded-xl bg-connect-blue/15 border border-connect-blue/30 text-connect-blue">
            <Building className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight">
          <CountUpNumber value={12} suffix=" Imóveis" />
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="text-blue-400 font-semibold">Ticket Médio: R$ 704.166</span>
        </div>
      </div>

      {/* Card 3: Reservas de Veraneio */}
      <div className="bg-[#0C1220] border border-[#1C2537] hover:border-connect-blue/50 rounded-2xl p-5 shadow-lg transition-all group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aluguel Temporada</span>
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[#F8DA56]">
            <Home className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-[#F8DA56] tracking-tight">
          <CountUpNumber value={24} suffix=" Reservas" />
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="text-emerald-400 font-semibold">100% Conciliado via PIX/Cartão</span>
        </div>
      </div>

      {/* Card 4: Leads Totais & Conversão */}
      <div className="bg-[#0C1220] border border-[#1C2537] hover:border-connect-blue/50 rounded-2xl p-5 shadow-lg transition-all group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leads & Conversão</span>
          <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight">
          <CountUpNumber value={186} suffix=" Novos" />
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="text-emerald-400 font-bold">6.45%</span>
          <span>taxa média de conversão ganha</span>
        </div>
      </div>
    </div>
  );
}
