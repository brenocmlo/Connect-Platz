"use client";

import React from "react";

interface DreTableProps {
  receitaBruta: number;
  deducoesImpostos: number;
  receitaLiquida: number;
  custosVariaveisSplits: number;
  margemContribuicao: number;
  despesasOperacionais: number;
  ebitda: number;
}

export function DreTable({
  receitaBruta,
  deducoesImpostos,
  receitaLiquida,
  custosVariaveisSplits,
  margemContribuicao,
  despesasOperacionais,
  ebitda,
}: DreTableProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h3 className="text-base font-bold text-foreground">Demonstrativo de Resultado do Exercício (DRE)</h3>
          <p className="text-xs text-muted-foreground">Apuração contábil e margem de contribuição operacional da Connect Platz.</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-lg bg-muted text-amber-700 dark:text-[#F8DA56] border border-amber-500/30 self-start sm:self-auto">
          Setembro / 2026
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/70 font-bold">
          <span className="text-foreground">(+) Receita Operacional Bruta (Comissões & Veraneio)</span>
          <span className="text-emerald-600 dark:text-emerald-400 text-sm">
            {receitaBruta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 text-muted-foreground">
          <span>(-) Deduções de Receita e Impostos (Simples 6%)</span>
          <span className="text-red-500 dark:text-red-400">
            - {deducoesImpostos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/80 font-bold border-l-4 border-connect-blue">
          <span className="text-foreground">(=) Receita Operacional Líquida</span>
          <span className="text-connect-blue dark:text-blue-400 text-sm">
            {receitaLiquida.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 text-muted-foreground">
          <span>(-) Custos Variáveis (Splits de Comissões aos Corretores)</span>
          <span className="text-red-500 dark:text-red-400">
            - {custosVariaveisSplits.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/80 font-bold border-l-4 border-platz-gold">
          <span className="text-foreground">(=) Margem de Contribuição / Lucro Bruto</span>
          <span className="text-amber-700 dark:text-[#F8DA56] text-sm">
            {margemContribuicao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 text-muted-foreground">
          <span>(-) Despesas Operacionais Fixas & Tráfego Pago Meta Ads</span>
          <span className="text-red-500 dark:text-red-400">
            - {despesasOperacionais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 font-extrabold border border-emerald-500/30 text-sm mt-3">
          <span className="text-emerald-800 dark:text-emerald-200 uppercase tracking-wider">
            (=) EBITDA / Lucro Operacional Líquido
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 text-base">
            {ebitda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      </div>
    </div>
  );
}
