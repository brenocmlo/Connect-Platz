"use client";

import React from "react";
import { BadgeDollarSign, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { TrendBadge } from "@/components/crm/primitives/TrendBadge";
import { VendasTotals } from "./vendasMetrics";

interface VendasStatCardsProps {
  totals: VendasTotals;
  /** Variação % vs. período anterior; ausente/null ⇒ badge omitido */
  trends?: Partial<Record<keyof VendasTotals, number | null>>;
  hideValues?: boolean;
  loading?: boolean;
}

export function VendasStatCards({ totals, trends = {}, hideValues = false, loading = false }: VendasStatCardsProps) {
  const cards: {
    key: keyof VendasTotals;
    label: string;
    isCurrency: boolean;
    icon: React.ElementType;
    color: string;
    /** Para pendências, crescer é ruim */
    invert?: boolean;
  }[] = [
    { key: "vgvTotal", label: "VGV Total", isCurrency: true, icon: BadgeDollarSign, color: "text-emerald-600 dark:text-emerald-400" },
    { key: "totalVendas", label: "Total de Vendas", isCurrency: false, icon: TrendingUp, color: "text-foreground" },
    { key: "comissaoRecebida", label: "Comissão Recebida", isCurrency: true, icon: CheckCircle, color: "text-connect-blue dark:text-blue-400" },
    { key: "comissoesPagas", label: "Comissões Pagas", isCurrency: true, icon: Clock, color: "text-foreground" },
    { key: "comissoesPendentes", label: "Comissões Pendentes", isCurrency: true, icon: AlertCircle, color: "text-amber-600 dark:text-amber-400", invert: true },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const trend = trends[card.key];
        return (
          <div
            key={card.key}
            style={{ animationDelay: `${idx * 60}ms` }}
            className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-connect-blue/40 transition-colors flex flex-col justify-between animate-in fade-in-0 slide-in-from-bottom-2 duration-300 fill-mode-both"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-connect-blue/10 text-connect-blue">
                <Icon className="w-4 h-4" />
              </div>
              {typeof trend === "number" && (
                <TrendBadge value={trend} isPositive={card.invert ? trend <= 0 : trend >= 0} />
              )}
            </div>

            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {card.label}
              </span>
              <div className={`text-xl font-bold tracking-tight mt-0.5 ${card.color}`}>
                {loading ? (
                  <span className="block h-6 w-24 rounded-md bg-muted animate-pulse" />
                ) : hideValues && card.isCurrency ? (
                  "••••••"
                ) : card.isCurrency ? (
                  <CountUpNumber value={totals[card.key]} prefix="R$ " decimals={0} />
                ) : (
                  <CountUpNumber value={totals[card.key]} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
