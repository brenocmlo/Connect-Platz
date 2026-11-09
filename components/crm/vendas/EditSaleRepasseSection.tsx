"use client";

import React from "react";
import { RotateCcw, ShieldAlert } from "lucide-react";
import { NumericInput } from "@/components/crm/primitives/NumericInput";
import { DEFAULT_CLAUSULA_REPASSE } from "./saleSplitHelper";

interface EditSaleRepasseSectionProps {
  isRepasse: boolean;
  setIsRepasse: (v: boolean) => void;
  valorRepasse: number;
  setValorRepasse: (v: number) => void;
  entradaRepasse: number;
  setEntradaRepasse: (v: number) => void;
  parcelasRepasse: number;
  setParcelasRepasse: (v: number) => void;
  valorParcelaRepasse: number;
  setValorParcelaRepasse: (v: number) => void;
  saldoDevedor: number;
  setSaldoDevedor: (v: number) => void;
  titularOriginario: string;
  setTitularOriginario: (v: string) => void;
  clausulaRepasse: string;
  setClausulaRepasse: (v: string) => void;
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
  entradaRepasse,
  setEntradaRepasse,
  parcelasRepasse,
  setParcelasRepasse,
  valorParcelaRepasse,
  setValorParcelaRepasse,
  saldoDevedor,
  setSaldoDevedor,
  titularOriginario,
  setTitularOriginario,
  clausulaRepasse,
  setClausulaRepasse,
  baseCalculoComissao,
  setBaseCalculoComissao,
  vgv,
  setVgv,
}: EditSaleRepasseSectionProps) {
  const isParcelado = parcelasRepasse > 1 || entradaRepasse > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/40">
        <div>
          <span className="text-xs font-bold text-foreground">É Venda de Repasse?</span>
          <p className="text-[11px] text-muted-foreground">Cessão de direitos (gaveta)</p>
        </div>
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
        <div className="space-y-3 p-3.5 rounded-xl bg-connect-blue/5 border border-connect-blue/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-connect-blue text-xs mb-1">
                Valor Total do Repasse / Ágio (R$)
              </label>
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
              <label className="block font-semibold text-foreground text-xs mb-1">
                Saldo Devedor do Financiamento (R$)
              </label>
              <NumericInput
                value={saldoDevedor}
                onChange={(s) => {
                  setSaldoDevedor(s);
                  setVgv(valorRepasse + s);
                }}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-2.5 rounded-lg bg-background/80 border border-border">
            <div>
              <label className="block font-semibold text-muted-foreground text-xs mb-1">Entrada do Ágio (R$)</label>
              <NumericInput
                value={entradaRepasse}
                onChange={setEntradaRepasse}
                className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground text-xs mb-1">Qtd. Parcelas</label>
              <input
                type="number"
                min={0}
                max={60}
                value={parcelasRepasse || ""}
                onChange={(e) => setParcelasRepasse(Number(e.target.value) || 0)}
                placeholder="Ex.: 12"
                className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground text-xs mb-1">Valor da Parcela (R$)</label>
              <NumericInput
                value={valorParcelaRepasse}
                onChange={setValorParcelaRepasse}
                className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground text-xs mb-1">Titular Originário (Gaveta)</label>
              <input
                type="text"
                value={titularOriginario}
                onChange={(e) => setTitularOriginario(e.target.value)}
                placeholder="Ex.: Nome no contrato financiado"
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground text-xs mb-1">Base da Comissão</label>
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

          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                Cláusula de Inadimplência & Retomada (Editável):
              </span>
              <button
                type="button"
                onClick={() => setClausulaRepasse(DEFAULT_CLAUSULA_REPASSE)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 hover:underline shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                Restaurar padrão
              </button>
            </div>
            <textarea
              rows={3}
              value={clausulaRepasse}
              onChange={(e) => setClausulaRepasse(e.target.value)}
              placeholder={DEFAULT_CLAUSULA_REPASSE}
              className="w-full rounded-lg border border-amber-500/30 bg-background/90 p-2 text-[11px] leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
