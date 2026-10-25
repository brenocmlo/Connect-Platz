"use client";

import React from "react";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { TrendBadge } from "@/components/crm/primitives/TrendBadge";
import { formatCompactBRL } from "./format";

interface CashFlowSummaryCardProps {
  balance: number;
  inflow: number;
  outflow: number;
  balanceTrend: number | null;
  className?: string;
}

/** Card Fluxo de Caixa (5.3 item 2) — exibido apenas para o Administrador. */
export function CashFlowSummaryCard({
  balance,
  inflow,
  outflow,
  balanceTrend,
  className = "",
}: CashFlowSummaryCardProps) {
  const { hideValues } = useCrm();
  const positive = balance >= 0;

  return (
    <div
      className={`rounded-xl bg-card border border-border p-5 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between min-h-[160px] ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-connect-blue/10 text-connect-blue flex items-center justify-center flex-shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Fluxo de Caixa
          </span>
        </div>

        {balanceTrend !== null ? (
          <TrendBadge value={balanceTrend} />
        ) : (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              positive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            }`}
          >
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{positive ? "Saldo positivo" : "Saldo negativo"}</span>
          </span>
        )}
      </div>

      <div className="my-2">
        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
          Saldo realizado no período
        </span>
        {hideValues ? (
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground font-mono">R$ ••••••••</span>
        ) : (
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${
              positive ? "text-foreground" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            <CountUpNumber value={balance} prefix="R$ " decimals={2} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <span className="text-[10px] text-muted-foreground block leading-none">Entradas</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
              {hideValues ? "••••" : formatCompactBRL(inflow)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
            <ArrowDownRight className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <span className="text-[10px] text-muted-foreground block leading-none">Saídas</span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 truncate">
              {hideValues ? "••••" : formatCompactBRL(outflow)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
