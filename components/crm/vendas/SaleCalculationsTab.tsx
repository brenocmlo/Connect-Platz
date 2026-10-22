"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { SaleCalculation, ROLE_LABEL } from "./saleSplitHelper";

interface SaleCalculationsTabProps {
  calculated: SaleCalculation;
  impostoPercentual: number;
  /** Nome exibido por papel (participantes sem usuário escolhido ficam de fora) */
  nameByRole: Partial<Record<string, string>>;
}

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (n: number) => `${n.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

export function SaleCalculationsTab({ calculated, impostoPercentual, nameByRole }: SaleCalculationsTabProps) {
  const visible = calculated.participants.filter((p) => p.valor !== 0 || p.percentual > 0);

  return (
    <div className="space-y-3">
      <div className="p-3.5 rounded-xl bg-connect-blue/10 border border-connect-blue/30 text-connect-blue">
        <span className="font-bold text-xs block mb-0.5">Cálculo 100% Determinístico de Comissão</span>
        <p className="text-[11px] opacity-90">
          VGV × % bruta = comissão bruta · menos imposto = base líquida · cada participante recebe sua % da
          base líquida · a imobiliária fica com o restante.
        </p>
      </div>

      {calculated.isOverAllocated && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 animate-in fade-in-0">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <strong className="block text-xs">Super-alocação de comissão</strong>
            Os participantes somam {pct(calculated.percentualParticipantes)} da base líquida (excedente de{" "}
            {brl(calculated.excedente)}). Ajuste os percentuais para no máximo 100% antes de salvar.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Comissão Bruta</span>
          <span className="text-base font-extrabold text-foreground">{brl(calculated.comissaoTotalBruta)}</span>
        </div>
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Imposto ({pct(impostoPercentual)})
          </span>
          <span className="text-base font-extrabold text-foreground">{brl(calculated.impostoEstimado)}</span>
        </div>
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Base Líquida</span>
          <span className="text-base font-extrabold text-foreground">{brl(calculated.baseLiquida)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        {visible.length === 0 ? (
          <p className="p-3 text-[11px] text-muted-foreground">Nenhum participante com percentual definido.</p>
        ) : (
          visible.map((p) => (
            <div
              key={p.role}
              className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-border last:border-b-0 bg-connect-blue/5"
            >
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-connect-blue tracking-wider block">
                  {ROLE_LABEL[p.role]} · {pct(p.percentual)}
                </span>
                <span className="text-xs font-semibold text-foreground truncate block">
                  {nameByRole[p.role] || "Participante não selecionado"}
                </span>
              </div>
              <span
                className={`text-sm font-extrabold whitespace-nowrap ${
                  p.valor < 0 ? "text-red-600 dark:text-red-400" : "text-connect-blue dark:text-blue-400"
                }`}
              >
                {brl(p.valor)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">
            Receita da Imobiliária (restante)
          </span>
          <span className="text-[11px] text-muted-foreground">{pct(calculated.percentualImobiliaria)} da base líquida</span>
        </div>
        <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
          {brl(calculated.receitaImobiliaria)}
        </span>
      </div>
    </div>
  );
}
