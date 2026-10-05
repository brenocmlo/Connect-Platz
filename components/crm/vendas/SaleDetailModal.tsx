"use client";

import React from "react";
import { X, Download, CheckCircle2, FileText, User, Building } from "lucide-react";
import { SaleItem, SplitItem } from "./types";
import { generateCommissionReceiptPdf, CommissionReceiptData } from "@/lib/services/receipt-pdf";

interface SaleDetailModalProps {
  sale: SaleItem | null;
  onClose: () => void;
  onBaixaComissao: (saleId: string, splitId: string) => void;
}

export function SaleDetailModal({ sale, onClose, onBaixaComissao }: SaleDetailModalProps) {
  if (!sale) return null;

  const handleDownloadReceipt = (split: SplitItem) => {
    const data: CommissionReceiptData = {
      codigoVenda: sale.codigoVenda,
      beneficiarioNome: split.beneficiario,
      beneficiarioTipo: split.categoria,
      documentoPix: split.pix || null,
      valor: split.valor,
      parcelaNumero: 1,
      totalParcelas: 1,
      dataPagamento: new Date().toLocaleDateString("pt-BR"),
      imovelNome: sale.imovelNome,
      unidadeNumero: sale.unidadeNumero,
      compradorNome: sale.compradorNome,
    };
    generateCommissionReceiptPdf(data);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] rounded-2xl w-full max-w-xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#1C2537] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-connect-blue/10 text-connect-blue">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Detalhes da Venda {sale.codigoVenda}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {sale.imovelNome} • Unidade {sale.unidadeNumero}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937]">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">VGV</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                R$ {sale.vgv.toLocaleString("pt-BR")}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Comissão Total</span>
              <span className="font-extrabold text-connect-blue dark:text-blue-400 text-sm">
                R$ {sale.comissaoTotal.toLocaleString("pt-BR")}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Data da Venda</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {sale.dataVenda}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Comprador</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {sale.compradorNome}
              </span>
            </div>
          </div>

          {/* Splits List */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
              Splits de Comissões e Pagamentos
            </h4>

            <div className="space-y-2">
              {sale.splits.map((split) => (
                <div
                  key={split.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#0E1624] flex items-center justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {split.beneficiario}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {split.categoria} ({split.percentual}%)
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Valor:{" "}
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        R$ {split.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        split.status === "PAGO"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                      }`}
                    >
                      {split.status === "PAGO" ? "Liquidado" : "Pendente"}
                    </span>

                    <button
                      onClick={() => handleDownloadReceipt(split)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1F2937] hover:bg-slate-100 dark:hover:bg-[#161F30] text-slate-600 dark:text-slate-400"
                      title="Baixar Recibo PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {split.status === "PENDENTE" && (
                      <button
                        onClick={() => onBaixaComissao(sale.id, split.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Dar Baixa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-[#1C2537] flex justify-end bg-slate-50 dark:bg-[#080C14]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#161F30] text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-[#1E293B]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
