"use client";

import React from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { CountUpNumber } from "@/components/crm/CountUpNumber";

interface CashFlowSummaryCardProps {
  balance?: number;
  inflow?: number;
  outflow?: number;
  className?: string;
}

export function CashFlowSummaryCard({
  balance = 1480000,
  inflow = 2150000,
  outflow = 670000,
  className = "",
}: CashFlowSummaryCardProps) {
  const { hideValues } = useCrm();

  return (
    <div
      className={`rounded-xl bg-card border border-border p-5 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between min-h-[160px] ${className}`}
    >
      {/* 1. TOPO: ÍCONE TINT, RÓTULO UPPERCASE E BADGE DE STATUS (5.3) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-connect-blue/10 text-connect-blue flex items-center justify-center flex-shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Fluxo de Caixa
          </span>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <TrendingUp className="w-3 h-3" />
          <span>Saldo Positivo</span>
        </span>
      </div>

      {/* 2. VALOR PRINCIPAL DO SALDO */}
      <div className="my-2">
        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
          Saldo Operacional
        </span>
        {hideValues ? (
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground font-mono">
            R$ ••••••••
          </span>
        ) : (
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">
            <CountUpNumber value={balance} prefix="R$ " decimals={2} />
          </div>
        )}
      </div>

      {/* 3. DUAS LINHAS MENORES: ENTRADAS (VERDE) E SAÍDAS (VERMELHO) (5.3) */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <span className="text-[10px] text-muted-foreground block leading-none">Entradas</span>
            <span className="text-xs font-bold text-emerald-500 truncate">
              {hideValues ? "••••" : `R$ ${(inflow / 1000).toFixed(0)}k`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
            <ArrowDownRight className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <span className="text-[10px] text-muted-foreground block leading-none">Saídas</span>
            <span className="text-xs font-bold text-rose-500 truncate">
              {hideValues ? "••••" : `R$ ${(outflow / 1000).toFixed(0)}k`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
