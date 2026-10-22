"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { TrendBadge } from "@/components/crm/primitives/TrendBadge";
import { CashFlowSummary } from "./cashFlowMetrics";

interface CashFlowStatCardsProps {
  summary: CashFlowSummary;
  hideValues: boolean;
  loading: boolean;
}

export function CashFlowStatCards({ summary, hideValues, loading }: CashFlowStatCardsProps) {
  const cards = [
    {
      key: "receitas",
      label: "Receitas Liquidadas (Mês)",
      caption: "Variação vs. mês anterior",
      value: summary.receitasMes,
      trend: summary.receitasTrend,
      icon: ArrowUpRight,
      iconCls: "bg-emerald-500/10 text-emerald-500",
      valueCls: "text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "despesas",
      label: "Despesas & Splits Pagos (Mês)",
      caption: "Variação vs. mês anterior",
      value: summary.despesasMes,
      trend: summary.despesasTrend,
      invertTrend: true,
      icon: ArrowDownRight,
      iconCls: "bg-red-500/10 text-red-500",
      valueCls: "text-red-600 dark:text-red-400",
    },
    {
      key: "saldo",
      label: "Saldo Operacional em Caixa",
      caption: "Acumulado de lançamentos liquidados",
      value: summary.saldoAtual,
      trend: null,
      icon: Wallet,
      iconCls: "bg-platz-gold/15 text-platz-gold",
      valueCls: summary.saldoAtual < 0 ? "text-red-600 dark:text-red-400" : "text-foreground dark:text-platz-gold",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-connect-blue/40 transition-colors animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${card.iconCls}`}>
                <Icon className="w-4 h-4" />
              </div>
              {!loading && card.trend !== null && <TrendBadge value={card.trend} invertColors={"invertTrend" in card && Boolean(card.invertTrend)} />}
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {card.label}
              </span>
              {loading ? (
                <span className="mt-2 block h-7 w-32 rounded-lg bg-muted animate-pulse" />
              ) : (
                <span className={`text-2xl font-black mt-1 block ${card.valueCls}`}>
                  {hideValues ? "••••••" : <CountUpNumber value={card.value} prefix="R$ " decimals={2} />}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground mt-0.5 block">{card.caption}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
