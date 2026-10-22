"use client";

import React, { useState } from "react";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { generateCommissionReceiptPdf, CommissionReceiptData } from "@/lib/services/receipt-pdf";

export interface SplitItem {
  id: string;
  beneficiario: string;
  categoria: string;
  percentual: number;
  valor: number;
  status: "PAGO" | "PENDENTE";
  pix?: string;
}

export interface SaleItem {
  id: string;
  codigoVenda: string;
  imovelNome: string;
  unidadeNumero: string;
  compradorNome: string;
  corretorTitular: string;
  dataVenda: string;
  vgv: number;
  valorAvaliacao: number;
  comissaoTotal: number;
  meioPagamento: string;
  splits: SplitItem[];
}

interface SaleCardProps {
  sale: SaleItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onBaixaComissao: (saleId: string, splitId: string) => void;
}

export function SaleCard({
  sale,
  isExpanded,
  onToggleExpand,
  onBaixaComissao,
}: SaleCardProps) {
  const handleDownloadReceipt = (split: SplitItem) => {
    const data: CommissionReceiptData = {
      codigoVenda: sale.codigoVenda,
      beneficiarioNome: split.beneficiario,
      beneficiarioTipo: split.categoria,
      documentoPix: split.pix || null,
      valor: split.valor,
      parcelaNumero: 1,
      totalParcelas: 1,
      dataPagamento: split.status === "PAGO" ? sale.dataVenda : "Pendente",
      imovelNome: sale.imovelNome,
      unidadeNumero: sale.unidadeNumero,
      compradorNome: sale.compradorNome,
    };
    generateCommissionReceiptPdf(data);
  };

  return (
    <div className="bg-card border border-border hover:border-connect-blue/40 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Header do Card */}
      <div
        onClick={onToggleExpand}
        className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer bg-muted/30"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-platz-gold/10 text-amber-700 dark:text-platz-gold px-2 py-0.5 rounded border border-platz-gold/30">
              {sale.codigoVenda}
            </span>
            <span className="text-xs text-muted-foreground">{sale.dataVenda}</span>
          </div>
          <h3 className="text-base font-extrabold text-foreground">
            {sale.imovelNome} • {sale.unidadeNumero}
          </h3>
          <p className="text-xs text-muted-foreground">
            Comprador: <strong className="text-foreground">{sale.compradorNome}</strong> • Corretor Titular:{" "}
            <strong className="text-connect-blue dark:text-blue-400">{sale.corretorTitular}</strong>
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider block">VGV Comercial</span>
            <span className="text-base font-black text-amber-700 dark:text-platz-gold">
              {sale.vgv.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider block">Comissão Total</span>
            <span className="text-base font-black text-foreground">
              {sale.comissaoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>

          <div className="text-muted-foreground p-1">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Tabela de Splits Desdobrada */}
      {isExpanded && (
        <div className="p-5 border-t border-border bg-muted/20 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Divisão Automática das Fatias de Comissão
            </h4>
            <span className="text-[11px] text-muted-foreground">
              Valor de Avaliação Bancária:{" "}
              <strong className="text-foreground">
                {sale.valorAvaliacao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-muted-foreground uppercase font-semibold border-b border-border">
                <tr>
                  <th className="py-2.5">Beneficiário</th>
                  <th className="py-2.5">Função</th>
                  <th className="py-2.5">Fatia (%)</th>
                  <th className="py-2.5">Valor (R$)</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sale.splits.map((split) => (
                  <tr key={split.id} className="hover:bg-connect-blue/5">
                    <td className="py-3 font-bold text-foreground">{split.beneficiario}</td>
                    <td className="py-3 text-muted-foreground">{split.categoria}</td>
                    <td className="py-3 font-semibold text-connect-blue dark:text-blue-400">{split.percentual}%</td>
                    <td className="py-3 font-extrabold text-amber-700 dark:text-platz-gold">
                      {split.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          split.status === "PAGO"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
                            : "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
                        }`}
                      >
                        {split.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      {split.status === "PENDENTE" && (
                        <button
                          onClick={() => onBaixaComissao(sale.id, split.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-sm"
                        >
                          Dar Baixa
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadReceipt(split)}
                        className="px-2.5 py-1 rounded-lg bg-muted hover:bg-connect-blue text-foreground hover:text-white border border-border text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
                        title="Baixar recibo timbrado em PDF"
                      >
                        <Download className="w-3 h-3" />
                        Recibo PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
