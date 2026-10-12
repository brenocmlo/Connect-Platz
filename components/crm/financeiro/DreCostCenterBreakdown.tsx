"use client";

import React from "react";
import { Layers, PieChart } from "lucide-react";
import { DreReport } from "@/lib/services/dre";

interface DreCostCenterBreakdownProps {
  report: DreReport;
  format: (v: number) => string;
}

const GROUP_LABEL: Record<string, string> = {
  RECEITA_BRUTA: "Receita",
  DEDUCOES: "Dedução",
  CUSTO_VARIAVEL: "Custo Variável",
  DESPESA_MARKETING: "Marketing",
  DESPESA_FIXA: "Despesa Fixa",
};

export function DreCostCenterBreakdown({ report, format }: DreCostCenterBreakdownProps) {
  const maxAbs = Math.max(1, ...report.porCentroCusto.map((c) => Math.max(c.receitas, c.despesas)));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Centros de Custo */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-connect-blue/40 transition-colors">
        <h4 className="text-sm font-semibold text-foreground border-l-[3px] border-connect-blue pl-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-connect-blue" />
          Resultado por Centro de Custo
        </h4>
        {report.porCentroCusto.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Nenhum lançamento no período selecionado.</p>
        ) : (
          <div className="space-y-3">
            {report.porCentroCusto.map((c) => (
              <div key={c.centro} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{c.centro}</span>
                  <span className={`font-bold ${c.resultado >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                    {format(c.resultado)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                      style={{ width: `${(c.receitas / maxAbs) * 100}%` }}
                    />
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-500/80 transition-all duration-700 ease-out"
                      style={{ width: `${(c.despesas / maxAbs) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>↗ {format(c.receitas)}</span>
                  <span>↘ {format(c.despesas)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composição por Categoria */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-connect-blue/40 transition-colors">
        <h4 className="text-sm font-semibold text-foreground border-l-[3px] border-connect-blue pl-2 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-connect-blue" />
          Composição por Conta (Plano de Contas)
        </h4>
        {report.porCategoria.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Nenhum lançamento no período selecionado.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {report.porCategoria.map((c) => (
              <div key={c.categoria} className="flex items-center justify-between py-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      c.grupo === "RECEITA_BRUTA"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-red-500/10 text-red-500 border-red-500/30"
                    }`}
                  >
                    {GROUP_LABEL[c.grupo]}
                  </span>
                  <span className="truncate text-foreground">{c.categoria}</span>
                </div>
                <span className="font-mono font-semibold text-foreground">{format(c.valor)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
