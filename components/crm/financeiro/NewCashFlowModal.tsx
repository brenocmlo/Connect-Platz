"use client";

import React, { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { CashFlowItem } from "./CashFlowTable";

interface NewCashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: CashFlowItem) => void;
}

export function NewCashFlowModal({ isOpen, onClose, onSubmit }: NewCashFlowModalProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState<number>(0);
  const [tipo, setTipo] = useState<"RECEITA" | "DESPESA">("DESPESA");
  const [categoria, setCategoria] = useState("Tráfego Pago Meta Ads");
  const [vencimento, setVencimento] = useState(todayStr);
  const [status, setStatus] = useState<"PENDENTE" | "PAGO">("PENDENTE");
  const [meio, setMeio] = useState("PIX");

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
      status,
      meioPagamento: meio,
      dataLiquidacao: status === "PAGO" ? todayStr : undefined,
      foiAntecipado: status === "PAGO",
    });
    setDescricao("");
    setValor(0);
    setStatus("PENDENTE");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">Novo Lançamento Financeiro</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => {
                  const t = e.target.value as "RECEITA" | "DESPESA";
                  setTipo(t);
                  setCategoria(t === "RECEITA" ? "Comissão Venda" : "Tráfego Pago Meta Ads");
                }}
                className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue font-semibold"
              >
                <option value="DESPESA">Despesa (Saída)</option>
                <option value="RECEITA">Receita (Entrada)</option>
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Valor (R$)</label>
              <input
                type="number"
                required
                min={1}
                value={valor || ""}
                onChange={(e) => setValor(Number(e.target.value))}
                className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground font-mono font-bold focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1">Descrição</label>
            <input
              type="text"
              required
              placeholder="Ex: Comissão Venda Apartamento 302"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Data de Vencimento</label>
              <input
                type="date"
                required
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue font-mono"
              />
            </div>
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Meio de Pagamento</label>
              <select
                value={meio}
                onChange={(e) => setMeio(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue font-semibold"
              >
                <option value="PIX">PIX</option>
                <option value="TED">TED</option>
                <option value="Boleto">Boleto</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Dinheiro">Dinheiro / Espécie</option>
              </select>
            </div>
          </div>

          {/* Status Inicial: Já Liquidado ou Agendado */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1.5">
            <span className="block text-[11px] font-bold text-foreground">Situação do Lançamento:</span>
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                status === "PENDENTE"
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400 font-bold"
                  : "border-border text-muted-foreground"
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="PENDENTE"
                  checked={status === "PENDENTE"}
                  onChange={() => setStatus("PENDENTE")}
                  className="sr-only"
                />
                <span className="text-[11px]">Agendado / Futuro</span>
              </label>

              <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                status === "PAGO"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-bold"
                  : "border-border text-muted-foreground"
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="PAGO"
                  checked={status === "PAGO"}
                  onChange={() => setStatus("PAGO")}
                  className="sr-only"
                />
                <span className="text-[11px]">Já Liquidado (Hoje)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white font-extrabold shadow-sm transition-all"
            >
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
