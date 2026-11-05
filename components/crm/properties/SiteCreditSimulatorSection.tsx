"use client";

import React from "react";
import { Calculator, Percent, Clock, DollarSign, ShieldAlert } from "lucide-react";

interface SiteCreditSimulatorSectionProps {
  taxaAnual: number;
  setTaxaAnual: (v: number) => void;
  prazoMeses: number;
  setPrazoMeses: (v: number) => void;
  comprometimento: number;
  setComprometimento: (v: number) => void;
  entradaMinima: number;
  setEntradaMinima: (v: number) => void;
}

export function SiteCreditSimulatorSection({
  taxaAnual,
  setTaxaAnual,
  prazoMeses,
  setPrazoMeses,
  comprometimento,
  setComprometimento,
  entradaMinima,
  setEntradaMinima,
}: SiteCreditSimulatorSectionProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5 animate-in fade-in-0 duration-200">
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Calculator className="w-4 h-4 text-connect-blue" />
          Regras da Simulação de Crédito Imobiliário
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Defina as taxas e limites de financiamento aplicados no simulador público da vitrine (tabela Price).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-connect-blue" />
            Taxa de Juros Anual Nominal (%)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="1"
              max="50"
              value={(taxaAnual * 100).toFixed(1)}
              onChange={(e) => setTaxaAnual(Number(e.target.value) / 100)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
              % a.a.
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">Padrão mercado: 10.5% a.a.</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-connect-blue" />
            Prazo Máximo de Financiamento
          </label>
          <div className="relative">
            <input
              type="number"
              step="12"
              min="12"
              max="480"
              value={prazoMeses}
              onChange={(e) => setPrazoMeses(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
              meses ({Math.round(prazoMeses / 12)} anos)
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">Padrão: 360 meses (30 anos)</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-platz-gold" />
            Comprometimento Máximo de Renda (%)
          </label>
          <div className="relative">
            <input
              type="number"
              step="1"
              min="10"
              max="60"
              value={Math.round(comprometimento * 100)}
              onChange={(e) => setComprometimento(Number(e.target.value) / 100)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
              % da renda
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">Padrão bancário: 30% da renda comprovada</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            Entrada Mínima Obrigatória (%)
          </label>
          <div className="relative">
            <input
              type="number"
              step="1"
              min="5"
              max="80"
              value={Math.round(entradaMinima * 100)}
              onChange={(e) => setEntradaMinima(Number(e.target.value) / 100)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
              % do imóvel
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">Padrão: 20% do valor de avaliação</span>
        </div>
      </div>
    </div>
  );
}
