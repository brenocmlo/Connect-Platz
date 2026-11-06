"use client";

import React from "react";
import { NumericInput } from "@/components/crm/primitives/NumericInput";

interface EditSaleRepasseSectionProps {
  isRepasse: boolean;
  setIsRepasse: (v: boolean) => void;
  valorRepasse: number;
  setValorRepasse: (v: number) => void;
  saldoDevedor: number;
  setSaldoDevedor: (v: number) => void;
  baseCalculoComissao: "REPASSE" | "VGV";
  setBaseCalculoComissao: (v: "REPASSE" | "VGV") => void;
  vgv: number;
  setVgv: (v: number) => void;
}

export function EditSaleRepasseSection({
  isRepasse,
  setIsRepasse,
  valorRepasse,
  setValorRepasse,
  saldoDevedor,
  setSaldoDevedor,
  baseCalculoComissao,
  setBaseCalculoComissao,
  vgv,
  setVgv,
}: EditSaleRepasseSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/40">
        <span className="text-xs font-bold text-foreground">É Venda de Repasse?</span>
        <div className="flex items-center gap-1 bg-background border border-border p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setIsRepasse(false)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
              !isRepasse ? "bg-connect-blue text-white" : "text-muted-foreground"
            }`}
          >
            Padrão
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRepasse(true);
              if (valorRepasse === 0 && vgv > 0) {
                setValorRepasse(Math.round(vgv * 0.3));
                setSaldoDevedor(Math.round(vgv * 0.7));
              }
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
              isRepasse ? "bg-connect-blue text-white" : "text-muted-foreground"
            }`}
          >
            🔄 Repasse
          </button>
        </div>
      </div>

      {isRepasse && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-connect-blue/5 border border-connect-blue/20">
          <div>
            <label className="block font-bold text-connect-blue mb-1">Valor do Repasse (Ágio)</label>
            <NumericInput
              value={valorRepasse}
              onChange={(r) => {
                setValorRepasse(r);
                setVgv(r + saldoDevedor);
              }}
              className="w-full bg-background border border-connect-blue/40 rounded-lg p-2.5 text-xs text-foreground font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-foreground mb-1">Saldo Devedor a Assumir</label>
            <NumericInput
              value={saldoDevedor}
              onChange={(s) => {
                setSaldoDevedor(s);
                setVgv(valorRepasse + s);
              }}
              className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Base da Comissão</label>
            <select
              value={baseCalculoComissao}
              onChange={(e) => setBaseCalculoComissao(e.target.value as "REPASSE" | "VGV")}
              className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground"
            >
              <option value="REPASSE">Sobre o Repasse (Ágio)</option>
              <option value="VGV">Sobre o VGV Total</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
