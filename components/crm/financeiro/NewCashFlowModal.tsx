"use client";

import React, { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { accountsByType, getAccount } from "@/lib/services/dre";
import { localDateKey } from "@/components/crm/agenda/types";
import { PAYMENT_METHOD_OPTIONS } from "./paymentMethods";
import { NumericInput } from "@/components/crm/primitives/NumericInput";

/** Payload aceito por POST /api/financeiro. */
export interface NewCashFlowPayload {
  tipo: "RECEITA" | "DESPESA";
  categoria: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  status: "PENDENTE" | "PAGO";
  dataPagamento?: string;
  meioPagamento: string;
}

interface NewCashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Retorna true quando a API confirmou a criação. */
  onSubmit: (payload: NewCashFlowPayload) => Promise<boolean>;
}

export function NewCashFlowModal({ isOpen, onClose, onSubmit }: NewCashFlowModalProps) {
  const todayStr = localDateKey(new Date());
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState<number>(0);
  const [tipo, setTipo] = useState<"RECEITA" | "DESPESA">("DESPESA");
  const [categoria, setCategoria] = useState("Tráfego Pago Meta Ads");
  const [vencimento, setVencimento] = useState(todayStr);
  const [status, setStatus] = useState<"PENDENTE" | "PAGO">("PENDENTE");
  const [meio, setMeio] = useState<string>("PIX");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Centro de custo derivado do plano de contas (usado no DRE)
  const centroCusto = getAccount(categoria, tipo).centroCustoPadrao;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(valor > 0) || submitting) return;
    setSubmitting(true);
    const ok = await onSubmit({
      tipo,
      categoria,
      descricao: descricao.trim(),
      valor: Math.round(valor * 100) / 100,
      dataVencimento: vencimento,
      status,
      dataPagamento: status === "PAGO" ? todayStr : undefined,
      meioPagamento: meio,
    });
    setSubmitting(false);
    // Só limpa e fecha após a API confirmar
    if (ok) {
      setDescricao("");
      setValor(0);
      setStatus("PENDENTE");
      onClose();
    }
  };

  const selectCls =
    "w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue font-semibold";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
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
                className={selectCls}
              >
                <option value="DESPESA">Despesa (Saída)</option>
                <option value="RECEITA">Receita (Entrada)</option>
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Valor (R$)</label>
              <NumericInput
                required
                min={0.01}
                value={valor}
                onChange={setValor}
                placeholder="0,00"
                className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground font-mono font-bold focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Conta (Plano de Contas)</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={selectCls}>
                {accountsByType(tipo).map((a) => (
                  <option key={a.categoria} value={a.categoria}>
                    {a.categoria}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Centro de Custo</label>
              <div className="w-full bg-muted/30 border border-dashed border-border rounded-xl p-2.5 text-muted-foreground font-semibold truncate" title="Definido pelo plano de contas">
                {centroCusto}
              </div>
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
                {PAYMENT_METHOD_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
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
              disabled={submitting}
              className="disabled:opacity-60 px-4 py-2 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white font-extrabold shadow-sm transition-all"
            >
              {submitting ? "Salvando..." : "Salvar Lançamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
