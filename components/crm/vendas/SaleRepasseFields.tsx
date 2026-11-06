"use client";

import React from "react";
import { AlertTriangle, Clock, RefreshCw, ShieldAlert } from "lucide-react";
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
  const isParcelado = deal.tipoPagamentoRepasse === "PARCELADO";

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
              Cessão de direitos (gaveta) onde o comprador assume o financiamento e paga o ágio negociado.
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
                tipoPagamentoRepasse: deal.tipoPagamentoRepasse || "A_VISTA",
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
        <div className="space-y-3.5 p-3.5 rounded-xl bg-connect-blue/5 border border-connect-blue/20 animate-in fade-in-0 duration-200">
          {/* VALOR DO REPASSE E FORMA DE PAGAMENTO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`${labelClass} text-connect-blue font-bold`}>
                Valor Total do Repasse / Ágio (R$) *
              </label>
              <NumericInput
                required
                min={1}
                value={deal.valorRepasse || 0}
                onChange={(valorRepasse) => {
                  const saldo = deal.saldoDevedor || 0;
                  const patch: Partial<SaleDealState> = { valorRepasse, vgv: valorRepasse + saldo };
                  if (deal.tipoPagamentoRepasse === "PARCELADO") {
                    const entrada = deal.entradaRepasse || 0;
                    const parcelas = deal.parcelasRepasse || 1;
                    patch.valorParcelaRepasse = Math.max(0, Math.round(((valorRepasse - entrada) / parcelas) * 100) / 100);
                  }
                  onChange(patch);
                }}
                placeholder="0,00"
                className={`${fieldClass} font-mono font-bold border-connect-blue/40`}
              />
              <span className="text-[10px] text-muted-foreground">Valor total negociado entre imobiliária e comprador</span>
            </div>

            <div>
              <label className={labelClass}>Forma de Pagamento do Ágio</label>
              <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => onChange({ tipoPagamentoRepasse: "A_VISTA", entradaRepasse: undefined, parcelasRepasse: undefined, valorParcelaRepasse: undefined })}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    !isParcelado ? "bg-connect-blue text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  À Vista
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const total = deal.valorRepasse || 0;
                    const entrada = deal.entradaRepasse || Math.round(total * 0.4);
                    const parcelas = deal.parcelasRepasse || 12;
                    const valorParcela = Math.max(0, Math.round(((total - entrada) / parcelas) * 100) / 100);
                    onChange({
                      tipoPagamentoRepasse: "PARCELADO",
                      entradaRepasse: entrada,
                      parcelasRepasse: parcelas,
                      valorParcelaRepasse: valorParcela,
                    });
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    isParcelado ? "bg-connect-blue text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Entrada + Parcelamento
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground">O repasse pode ser parcelado conforme negociação</span>
            </div>
          </div>

          {/* CAMPOS DE ENTRADA + PARCELAS DO REPASSE (SE PARCELADO) */}
          {isParcelado && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-background/80 border border-border">
              <div>
                <label className={`${labelClass} text-foreground font-semibold`}>
                  Entrada do Repasse (R$) *
                </label>
                <NumericInput
                  min={0}
                  value={deal.entradaRepasse || 0}
                  onChange={(entradaRepasse) => {
                    const total = deal.valorRepasse || 0;
                    const parcelas = deal.parcelasRepasse || 1;
                    const valorParcela = Math.max(0, Math.round(((total - entradaRepasse) / parcelas) * 100) / 100);
                    onChange({ entradaRepasse, valorParcelaRepasse: valorParcela });
                  }}
                  placeholder="0,00"
                  className={`${fieldClass} font-mono`}
                />
                <span className="text-[10px] text-muted-foreground">Valor pago no ato</span>
              </div>

              <div>
                <label className={labelClass}>Qtd. de Parcelas</label>
                <select
                  value={deal.parcelasRepasse || 12}
                  onChange={(e) => {
                    const parcelas = Number(e.target.value);
                    const total = deal.valorRepasse || 0;
                    const entrada = deal.entradaRepasse || 0;
                    const valorParcela = Math.max(0, Math.round(((total - entrada) / parcelas) * 100) / 100);
                    onChange({ parcelasRepasse: parcelas, valorParcelaRepasse: valorParcela });
                  }}
                  className={fieldClass}
                >
                  {[2, 3, 4, 5, 6, 10, 12, 18, 24, 36, 48, 60].map((n) => (
                    <option key={n} value={n}>
                      {n} parcelas
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-muted-foreground">Parcelas negociadas</span>
              </div>

              <div>
                <label className={labelClass}>Valor da Parcela (R$)</label>
                <NumericInput
                  min={0}
                  value={deal.valorParcelaRepasse || 0}
                  onChange={(valorParcelaRepasse) => onChange({ valorParcelaRepasse })}
                  placeholder="0,00"
                  className={`${fieldClass} font-mono`}
                />
                <span className="text-[10px] text-muted-foreground">Mensal do repasse</span>
              </div>
            </div>
          )}

          {/* DADOS DO FINANCIAMENTO ASSUMIDO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <span className="text-[10px] text-muted-foreground">Saldo do financiamento ativo que o comprador assume</span>
            </div>

            <div>
              <label className={labelClass}>Titular Originário do Financiamento</label>
              <input
                type="text"
                value={deal.titularOriginario || ""}
                onChange={(e) => onChange({ titularOriginario: e.target.value })}
                placeholder="Ex.: Nome do financista original (Cessão/Gaveta)"
                className={fieldClass}
              />
              <span className="text-[10px] text-muted-foreground">Nome em que permanece o contrato até a quitação</span>
            </div>
          </div>

          {/* VGV E BASE DE COMISSÃO */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label className={labelClass}>VGV Total Comercial</label>
              <div className="px-3 py-2.5 rounded-lg bg-background border border-border font-mono font-bold text-xs text-foreground truncate">
                {((deal.valorRepasse || 0) + (deal.saldoDevedor || 0)).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <span className="text-[10px] text-muted-foreground">Repasse + Saldo Devedor</span>
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
                {deal.baseCalculoComissao === "VGV" ? "Sobre R$ Total" : "Sobre ágio em mãos"}
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

          {/* CALLOUT LEGAL & OPERACIONAL DO REPASSE */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
              <span className="font-bold block">Regra do Repasse & Cláusula de Retomada:</span>
              <p className="text-[11px] leading-relaxed opacity-90">
                O imóvel permanece registrado em nome do titular originário. O adquirente assume o pagamento contínuo das parcelas. Se houver atraso superior a <strong>3 meses (90 dias)</strong>, haverá <strong>quebra de contrato com perda integral dos valores pagos</strong> e retomada do imóvel.
              </p>
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
