"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { NumericInput } from "@/components/crm/primitives/NumericInput";
import { SaleDealState } from "./SaleDealFields";

interface SaleRepasseFieldsProps {
  deal: SaleDealState;
  onChange: (patch: Partial<SaleDealState>) => void;
  fieldClass: string;
  labelClass: string;
}

export function SaleRepasseFields({
  deal,
  onChange,
  fieldClass,
  labelClass,
}: SaleRepasseFieldsProps) {
  return (
    <div className="space-y-3">
      {/* SELETOR DE MODALIDADE: PADRÃO VS REPASSE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border bg-muted/40 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-connect-blue/10 text-connect-blue">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground">Modalidade: É Venda de Repasse?</span>
            <p className="text-[11px] text-muted-foreground">
              Cessão de direitos onde o comprador paga o ágio e assume o saldo devedor.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-background border border-border p-0.5 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => onChange({ isRepasse: false })}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              !deal.isRepasse
                ? "bg-connect-blue text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Venda Padrão
          </button>
          <button
            type="button"
            onClick={() => {
              const repasse = deal.valorRepasse || (deal.vgv > 0 ? Math.round(deal.vgv * 0.3) : 0);
              const saldo = deal.saldoDevedor || (deal.vgv > 0 ? Math.round(deal.vgv * 0.7) : 0);
              onChange({
                isRepasse: true,
                valorRepasse: repasse,
                saldoDevedor: saldo,
                vgv: repasse + saldo,
                baseCalculoComissao: deal.baseCalculoComissao || "REPASSE",
              });
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              deal.isRepasse
                ? "bg-connect-blue text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🔄 Repasse
          </button>
        </div>
      </div>

      {deal.isRepasse ? (
        <div className="space-y-3 p-3.5 rounded-xl bg-connect-blue/5 border border-connect-blue/20 animate-in fade-in-0 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`${labelClass} text-connect-blue font-bold`}>
                Valor do Repasse / Ágio (R$) *
              </label>
              <NumericInput
                required
                min={1}
                value={deal.valorRepasse || 0}
                onChange={(valorRepasse) => {
                  const saldo = deal.saldoDevedor || 0;
                  onChange({ valorRepasse, vgv: valorRepasse + saldo });
                }}
                placeholder="0,00"
                className={`${fieldClass} font-mono font-bold border-connect-blue/40`}
              />
              <span className="text-[10px] text-muted-foreground">Valor pago ao vendedor/cedente em mãos</span>
            </div>

            <div>
              <label className={`${labelClass} text-foreground`}>
                Saldo Devedor a Assumir (R$) *
              </label>
              <NumericInput
                required
                min={0}
                value={deal.saldoDevedor || 0}
                onChange={(saldoDevedor) => {
                  const repasse = deal.valorRepasse || 0;
                  onChange({ saldoDevedor, vgv: repasse + saldoDevedor });
                }}
                placeholder="0,00"
                className={`${fieldClass} font-mono font-bold`}
              />
              <span className="text-[10px] text-muted-foreground">Saldo financiado ou com a construtora</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label className={labelClass}>VGV Total (R$)</label>
              <div className="px-3 py-2.5 rounded-lg bg-background border border-border font-mono font-bold text-xs text-foreground truncate">
                {((deal.valorRepasse || 0) + (deal.saldoDevedor || 0)).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <span className="text-[10px] text-muted-foreground">Soma Repasse + Saldo</span>
            </div>

            <div>
              <label className={labelClass}>Base da Comissão</label>
              <select
                value={deal.baseCalculoComissao || "REPASSE"}
                onChange={(e) => onChange({ baseCalculoComissao: e.target.value as "REPASSE" | "VGV" })}
                className={fieldClass}
              >
                <option value="REPASSE">Sobre o Repasse (Ágio)</option>
                <option value="VGV">Sobre o VGV Total</option>
              </select>
              <span className="text-[10px] text-muted-foreground">
                {deal.baseCalculoComissao === "VGV" ? "Sobre R$ Total" : "Sobre ágio"}
              </span>
            </div>

            <div>
              <label className={labelClass}>% Comissão Bruta *</label>
              <NumericInput
                required
                min={0.01}
                max={100}
                value={deal.percentualComissao}
                onChange={(percentualComissao) => onChange({ percentualComissao })}
                placeholder="0"
                className={`${fieldClass} font-mono font-bold`}
              />
            </div>

            <div>
              <label className={labelClass}>% Imposto</label>
              <NumericInput
                min={0}
                max={100}
                value={deal.impostoPercentual}
                onChange={(impostoPercentual) => onChange({ impostoPercentual })}
                placeholder="0"
                className={`${fieldClass} font-mono`}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className={labelClass}>VGV da Venda (R$) *</label>
            <NumericInput
              required
              min={1}
              value={deal.vgv}
              onChange={(vgv) => onChange({ vgv })}
              placeholder="0,00"
              className={`${fieldClass} font-mono font-bold`}
            />
          </div>
          <div>
            <label className={labelClass}>% Comissão Bruta *</label>
            <NumericInput
              required
              min={0.01}
              max={100}
              value={deal.percentualComissao}
              onChange={(percentualComissao) => onChange({ percentualComissao })}
              placeholder="0"
              className={`${fieldClass} font-mono font-bold`}
            />
          </div>
          <div>
            <label className={labelClass}>% Imposto</label>
            <NumericInput
              min={0}
              max={100}
              value={deal.impostoPercentual}
              onChange={(impostoPercentual) => onChange({ impostoPercentual })}
              placeholder="0"
              className={`${fieldClass} font-mono`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
