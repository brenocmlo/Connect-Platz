"use client";

import React, { useState } from "react";
import { CashFlowItem } from "./CashFlowTable";

interface NewCashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: CashFlowItem) => void;
}

export function NewCashFlowModal({ isOpen, onClose, onSubmit }: NewCashFlowModalProps) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState<number>(0);
  const [tipo, setTipo] = useState<"RECEITA" | "DESPESA">("DESPESA");
  const [categoria, setCategoria] = useState("Tráfego Pago Meta Ads");
  const [vencimento, setVencimento] = useState("2026-10-10");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: `cf-${Date.now()}`,
      tipo,
      categoria,
      descricao,
      valor,
      dataVencimento: vencimento,
      status: "PENDENTE",
      meioPagamento: "PIX",
    });
    setDescricao("");
    setValor(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white">Novo Lançamento Financeiro</h3>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              >
                <option value="DESPESA">Despesa</option>
                <option value="RECEITA">Receita</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Valor (R$)</label>
              <input
                type="number"
                required
                value={valor || ""}
                onChange={(e) => setValor(Number(e.target.value))}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Descrição</label>
            <input
              type="text"
              required
              placeholder="Ex: Pagamento Tráfego Meta Ads"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Data de Vencimento</label>
            <input
              type="date"
              required
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#111827] text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold"
            >
              Confirmar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
