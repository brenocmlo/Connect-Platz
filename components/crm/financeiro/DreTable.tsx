"use client";

import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import {
  DreEntry,
  DreRegime,
  computeDre,
  availableMonths,
  monthLabel,
  verticalPct,
  DEFAULT_TAX_RATE,
} from "@/lib/services/dre";
import { DreCostCenterBreakdown } from "./DreCostCenterBreakdown";

interface DreTableProps {
  entries: DreEntry[];
}

type LineVariant = "total" | "deduction" | "subtotal" | "final";

export function DreTable({ entries }: DreTableProps) {
  const { hideValues } = useCrm();
  const months = useMemo(() => availableMonths(entries), [entries]);
  const [month, setMonth] = useState<string>("TODOS");
  const [regime, setRegime] = useState<DreRegime>("COMPETENCIA");

  const r = useMemo(() => computeDre(entries, month, regime), [entries, month, regime]);

  const fmt = (v: number) =>
    hideValues ? "••••••" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const lines: { label: string; value: number; variant: LineVariant; accent?: string; hint?: string }[] = [
    { label: "(+) Receita Operacional Bruta (Comissões & Veraneio)", value: r.receitaBruta, variant: "total" },
    {
      label: `(-) Deduções e Impostos${r.deducoesEstimadas ? ` (estimado ${DEFAULT_TAX_RATE * 100}% Simples)` : ""}`,
      value: r.deducoes,
      variant: "deduction",
      hint: r.deducoesEstimadas ? "Nenhum lançamento de imposto no período: aplicada alíquota padrão." : undefined,
    },
    { label: "(=) Receita Operacional Líquida", value: r.receitaLiquida, variant: "subtotal", accent: "border-connect-blue" },
    { label: "(-) Custos Variáveis (Splits de Comissão & Premiações)", value: r.custosVariaveis, variant: "deduction" },
    { label: "(=) Margem de Contribuição", value: r.margemContribuicao, variant: "subtotal", accent: "border-platz-gold" },
    { label: "(-) Despesas de Marketing (Meta Ads, Google, Portais)", value: r.despesasMarketing, variant: "deduction" },
    { label: "(-) Despesas Fixas (Sede, Folha, Sistemas)", value: r.despesasFixas, variant: "deduction" },
  ];

  const positive = r.resultadoOperacional >= 0;

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground">Demonstrativo de Resultado do Exercício (DRE)</h3>
            <p className="text-xs text-muted-foreground">
              Calculado em tempo real a partir dos lançamentos do Fluxo de Caixa e do plano de contas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-muted p-1 rounded-lg text-[11px] font-semibold">
              {(["COMPETENCIA", "CAIXA"] as DreRegime[]).map((reg) => (
                <button
                  key={reg}
                  onClick={() => setRegime(reg)}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    regime === reg ? "bg-connect-blue text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {reg === "COMPETENCIA" ? "Competência" : "Caixa"}
                </button>
              ))}
            </div>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-muted/60 border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue cursor-pointer"
            >
              <option value="TODOS">Todos os períodos</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3">
          <span>Conta</span>
          <span className="flex gap-6">
            <span className="w-14 text-right">AV %</span>
            <span className="w-28 text-right">Valor</span>
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {lines.map((l) => (
            <div
              key={l.label}
              title={l.hint}
              className={`flex items-center justify-between p-3 rounded-xl ${
                l.variant === "deduction"
                  ? "bg-card border border-border/60 text-muted-foreground"
                  : `bg-muted/70 font-bold ${l.accent ? `border-l-4 ${l.accent}` : ""}`
              }`}
            >
              <span className={`flex items-center gap-1.5 ${l.variant === "deduction" ? "" : "text-foreground"}`}>
                {l.label}
                {l.hint && <Info className="w-3 h-3 text-amber-500" />}
              </span>
              <span className="flex items-center gap-6">
                <span className="w-14 text-right font-mono text-[11px] text-muted-foreground">
                  {verticalPct(l.value, r.receitaBruta)}
                </span>
                <span
                  className={`w-28 text-right ${
                    l.variant === "deduction"
                      ? "text-red-500 dark:text-red-400"
                      : l.variant === "total"
                      ? "text-emerald-600 dark:text-emerald-400 text-sm"
                      : "text-foreground text-sm"
                  }`}
                >
                  {l.variant === "deduction" && !hideValues ? "- " : ""}
                  {fmt(l.value)}
                </span>
              </span>
            </div>
          ))}

          <div
            className={`flex items-center justify-between p-4 rounded-xl font-extrabold border text-sm mt-3 ${
              positive
                ? "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30"
                : "bg-red-500/10 dark:bg-red-950/40 border-red-500/30"
            }`}
          >
            <span className={`uppercase tracking-wider ${positive ? "text-emerald-800 dark:text-emerald-200" : "text-red-700 dark:text-red-300"}`}>
              (=) Resultado Operacional (EBITDA)
            </span>
            <span className="flex items-center gap-6">
              <span className="w-14 text-right font-mono text-[11px] text-muted-foreground">
                {r.receitaBruta ? `${r.margemLiquidaPct.toFixed(1)}%` : "—"}
              </span>
              <span className={`w-28 text-right text-base ${positive ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {fmt(r.resultadoOperacional)}
              </span>
            </span>
          </div>
        </div>
      </div>

      <DreCostCenterBreakdown report={r} format={fmt} />
    </div>
  );
}
