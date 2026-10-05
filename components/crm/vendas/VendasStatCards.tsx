"use client";

import React from "react";
import { BadgeDollarSign, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { TrendBadge } from "@/components/crm/primitives/TrendBadge";

interface VendasStatCardsProps {
  vgvTotal: number;
  totalVendas: number;
  comissaoRecebida: number;
  comissoesPagas: number;
  comissoesPendentes: number;
  hideValues?: boolean;
}

export function VendasStatCards({
  vgvTotal,
  totalVendas,
  comissaoRecebida,
  comissoesPagas,
  comissoesPendentes,
  hideValues = false,
}: VendasStatCardsProps) {
  const cards = [
    {
      label: "VGV TOTAL",
      value: vgvTotal,
      isCurrency: true,
      icon: BadgeDollarSign,
      trend: "+12.5%",
      isPositive: true,
      color: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 text-emerald-500",
    },
    {
      label: "TOTAL DE VENDAS",
      value: totalVendas,
      isCurrency: false,
      icon: TrendingUp,
      trend: "+8%",
      isPositive: true,
      color: "text-slate-900 dark:text-white",
      iconBg: "bg-connect-blue/10 text-connect-blue",
    },
    {
      label: "COMISSÃO RECEBIDA",
      value: comissaoRecebida,
      isCurrency: true,
      icon: CheckCircle,
      trend: "+15%",
      isPositive: true,
      color: "text-connect-blue dark:text-blue-400",
      iconBg: "bg-connect-blue/10 text-connect-blue",
    },
    {
      label: "COMISSÕES PAGAS",
      value: comissoesPagas,
      isCurrency: true,
      icon: Clock,
      trend: "+5%",
      isPositive: true,
      color: "text-slate-700 dark:text-slate-300",
      iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
    },
    {
      label: "COMISSÕES PENDENTES",
      value: comissoesPendentes,
      isCurrency: true,
      icon: AlertCircle,
      trend: "-3%",
      isPositive: false,
      color: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] rounded-2xl p-4 shadow-sm hover:border-connect-blue/30 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <TrendBadge value={card.trend} isPositive={card.isPositive} />
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {card.label}
              </span>
              <div className={`text-xl font-extrabold tracking-tight mt-0.5 ${card.color}`}>
                {hideValues ? (
                  "••••••"
                ) : card.isCurrency ? (
                  <CountUpNumber value={card.value} prefix="R$ " decimals={0} />
                ) : (
                  <CountUpNumber value={card.value} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
