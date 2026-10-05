"use client";

import React from "react";

interface SaleCalculationsTabProps {
  comissaoTotalBruta: number;
  impostoEstimado: number;
  valorCorretor1: number;
  corretor1: string;
  hasCorretor2: boolean;
  valorCorretor2: number;
  corretor2: string;
  receitaImobiliaria: number;
}

export function SaleCalculationsTab({
  comissaoTotalBruta,
  impostoEstimado,
  valorCorretor1,
  corretor1,
  hasCorretor2,
  valorCorretor2,
  corretor2,
  receitaImobiliaria,
}: SaleCalculationsTabProps) {
  return (
    <div className="space-y-3">
      <div className="p-3.5 rounded-xl bg-connect-blue/10 border border-connect-blue/30 text-connect-blue">
        <span className="font-bold text-xs block mb-0.5">
          Cálculo 100% Determinístico de Comissão
        </span>
        <p className="text-[11px] opacity-90">
          Valores calculados em tempo real a partir do VGV, deduções fiscais e tabelas contratuais.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937]">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Comissão Bruta Total
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white">
            R$ {comissaoTotalBruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937]">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Imposto Estimado (6%)
          </span>
          <span className="text-base font-extrabold text-slate-700 dark:text-slate-300">
            R$ {impostoEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-connect-blue/5 border border-connect-blue/20">
          <span className="text-[10px] uppercase font-bold text-connect-blue block">
            Comissão Corretor Final ({corretor1})
          </span>
          <span className="text-base font-extrabold text-connect-blue dark:text-blue-400">
            R$ {valorCorretor1.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {hasCorretor2 && (
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <span className="text-[10px] uppercase font-bold text-amber-600 block">
              Comissão 2º Corretor ({corretor2})
            </span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
              R$ {valorCorretor2.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 col-span-2">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">
            Receita Líquida da Imobiliária
          </span>
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            R$ {receitaImobiliaria.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
