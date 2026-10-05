"use client";

import React, { useState } from "react";
import { X, ArrowDownLeft, ArrowUpRight, CheckCircle2, Calendar, CreditCard, FileText } from "lucide-react";
import { CashFlowItem } from "./CashFlowTable";

interface ConfirmCashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CashFlowItem | null;
  onConfirm: (
    item: CashFlowItem,
    dataEfetiva: string,
    meio: string,
    observacao?: string
  ) => void;
}

export function ConfirmCashMovementModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: ConfirmCashMovementModalProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [dataEfetiva, setDataEfetiva] = useState(todayStr);
  const [meio, setMeio] = useState("PIX");
  const [observacao, setObservacao] = useState("");

  if (!isOpen || !item) return null;

  const isReceita = item.tipo === "RECEITA";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(item, dataEfetiva, meio, observacao);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1F2937] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1C2537] pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isReceita
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
            >
              {isReceita ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isReceita ? "Confirmar Entrada Antecipada" : "Confirmar Saída Antecipada"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Liquidação financeira antes do vencimento previsto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Título / Lançamento */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {item.categoria}
            </span>
            <span
              className={`text-base font-black ${
                isReceita
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isReceita ? "+" : "-"}
              {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>

          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {item.descricao}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-[#1F2937]">
            <span>Vencimento Original:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {item.dataVencimento}
            </span>
          </div>
        </div>

        {/* Banner Informativo de Antecipação */}
        <div className="p-2.5 rounded-xl bg-connect-blue/5 border border-connect-blue/20 text-xs text-connect-blue dark:text-blue-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-platz-gold" />
          <span>
            Ao confirmar, o saldo operacional será imediatamente atualizado no caixa ativo da imobiliária.
          </span>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-connect-blue" />
              Data Efetiva da Entrada / Saída
            </label>
            <input
              type="date"
              required
              value={dataEfetiva}
              onChange={(e) => setDataEfetiva(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-connect-blue"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-connect-blue" />
              Meio Efetivo de Liquidação
            </label>
            <select
              value={meio}
              onChange={(e) => setMeio(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-connect-blue"
            >
              <option value="PIX">PIX (Instantâneo)</option>
              <option value="TED">TED Bancário</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Boleto">Boleto Quitado</option>
              <option value="Dinheiro">Dinheiro / Espécie</option>
              <option value="Cheque">Cheque Compensado</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Observação / Comprovante (Opcional)
            </label>
            <input
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Recebido antecipadamente com comprovante TED"
              className="w-full bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-connect-blue"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#1C2537]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161F30] font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.01] ${
                isReceita
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-connect-blue hover:bg-connect-deep-blue shadow-connect-blue/20"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isReceita ? "Confirmar Entrada no Caixa" : "Confirmar Saída do Caixa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
