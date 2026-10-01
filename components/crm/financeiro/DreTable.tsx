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
    <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-[#1C2537]">
        <div>
          <h3 className="text-base font-black text-white">Demonstrativo de Resultado do Exercício (DRE)</h3>
          <p className="text-xs text-slate-400">Apuração contábil e margem de contribuição operacional da Connect Platz.</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#111827] text-[#D9BB4C] border border-[#D9BB4C]/30">
          Setembro / 2026
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F1624] font-bold">
          <span className="text-slate-200">(+) Receita Operacional Bruta (Comissões & Veraneio)</span>
          <span className="text-emerald-400 text-sm">
            {receitaBruta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D121D] text-slate-400">
          <span>(-) Deduções de Receita e Impostos (Simples 6%)</span>
          <span className="text-red-400">
            - {deducoesImpostos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#111827] font-bold border-l-4 border-blue-500">
          <span className="text-white">(=) Receita Operacional Líquida</span>
          <span className="text-blue-400 text-sm">
            {receitaLiquida.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D121D] text-slate-400">
          <span>(-) Custos Variáveis (Splits de Comissões aos Corretores)</span>
          <span className="text-red-400">
            - {custosVariaveisSplits.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#111827] font-bold border-l-4 border-[#D9BB4C]">
          <span className="text-white">(=) Margem de Contribuição / Lucro Bruto</span>
          <span className="text-[#D9BB4C] text-sm">
            {margemContribuicao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D121D] text-slate-400">
          <span>(-) Despesas Operacionais Fixas & Tráfego Pago Meta Ads</span>
          <span className="text-red-400">
            - {despesasOperacionais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 to-[#0A0E17] font-extrabold border border-emerald-700/80 text-sm mt-3">
          <span className="text-white uppercase tracking-wider">
            (=) EBITDA / Lucro Operacional Líquido
          </span>
          <span className="text-emerald-400 text-base">
            {ebitda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      </div>
    </div>
  );
}
