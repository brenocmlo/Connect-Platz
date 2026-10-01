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
      dataPagamento: new Date().toLocaleDateString("pt-BR"),
      imovelNome: sale.imovelNome,
      unidadeNumero: sale.unidadeNumero,
      compradorNome: sale.compradorNome,
    };
    generateCommissionReceiptPdf(data);
  };

  return (
    <div className="bg-[#0A0E17] border border-[#1C2537] hover:border-connect-blue/40 rounded-2xl shadow-xl overflow-hidden transition-all">
      {/* Header do Card */}
      <div
        onClick={onToggleExpand}
        className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer bg-[#0C121E]"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-[#111827] text-[#D9BB4C] px-2 py-0.5 rounded border border-[#D9BB4C]/30">
              {sale.codigoVenda}
            </span>
            <span className="text-xs text-slate-400">{sale.dataVenda}</span>
          </div>
          <h3 className="text-base font-extrabold text-white">
            {sale.imovelNome} • {sale.unidadeNumero}
          </h3>
          <p className="text-xs text-slate-400">
            Comprador: <strong className="text-white">{sale.compradorNome}</strong> • Corretor Titular:{" "}
            <strong className="text-blue-400">{sale.corretorTitular}</strong>
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">VGV Comercial</span>
            <span className="text-base font-black text-[#D9BB4C]">
              {sale.vgv.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Comissão Total</span>
            <span className="text-base font-black text-white">
              {sale.comissaoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>

          <div className="text-slate-400 p-1">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Tabela de Splits Desdobrada */}
      {isExpanded && (
        <div className="p-5 border-t border-[#1C2537] bg-[#080C14] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Divisão Automática das Fatias de Comissão
            </h4>
            <span className="text-[11px] text-slate-500">
              Valor de Avaliação Bancária:{" "}
              <strong className="text-slate-300">
                {sale.valorAvaliacao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-500 uppercase font-bold border-b border-[#1C2537]">
                <tr>
                  <th className="py-2.5">Beneficiário</th>
                  <th className="py-2.5">Função</th>
                  <th className="py-2.5">Fatia (%)</th>
                  <th className="py-2.5">Valor (R$)</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2537]/60">
                {sale.splits.map((split) => (
                  <tr key={split.id} className="hover:bg-[#0D131F]">
                    <td className="py-3 font-bold text-white">{split.beneficiario}</td>
                    <td className="py-3 text-slate-400">{split.categoria}</td>
                    <td className="py-3 font-semibold text-blue-400">{split.percentual}%</td>
                    <td className="py-3 font-extrabold text-[#D9BB4C]">
                      {split.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          split.status === "PAGO"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-amber-950 text-amber-400 border border-amber-800"
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
                        className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-connect-blue text-slate-300 hover:text-white border border-[#1F2937] text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
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
