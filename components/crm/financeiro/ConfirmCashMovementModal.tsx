"use client";

import React, { useState } from "react";
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileText,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { CashFlowItem } from "./CashFlowTable";
import { PAYMENT_METHOD_OPTIONS, formatDateBr } from "./paymentMethods";
import { localDateKey } from "@/components/crm/agenda/types";

interface ConfirmCashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CashFlowItem | null;
  onConfirm: (
    item: CashFlowItem,
    dataEfetiva: string,
    meio: string,
    observacao?: string,
    anexoUrl?: string
  ) => Promise<boolean>;
}

export function ConfirmCashMovementModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: ConfirmCashMovementModalProps) {
  const todayStr = localDateKey(new Date());
  const [dataEfetiva, setDataEfetiva] = useState(todayStr);
  const [meio, setMeio] = useState<string>("PIX");
  const [observacao, setObservacao] = useState("");
  const [anexoUrl, setAnexoUrl] = useState("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const isReceita = item.tipo === "RECEITA";

  const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "materials");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.urls?.[0]) {
        setAnexoUrl(data.urls[0]);
      } else {
        alert(data.error || "Falha no envio do comprovante.");
      }
    } catch {
      alert("Falha de conexão ao enviar o comprovante.");
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await onConfirm(item, dataEfetiva, meio, observacao, anexoUrl || undefined);
    setSubmitting(false);
    if (ok) {
      setObservacao("");
      setAnexoUrl("");
      onClose();
    }
  };

  const isEarly = dataEfetiva < item.dataVencimento;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
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
              <h3 className="text-base font-bold text-foreground">
                {isReceita ? "Confirmar Entrada no Caixa" : "Confirmar Saída do Caixa"}
                {isEarly ? " (Antecipada)" : ""}
              </h3>
              <p className="text-xs text-muted-foreground">
                Liquidação e baixa financeira com comprovação documental
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Título / Lançamento */}
        <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
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

          <div className="text-xs font-bold text-foreground">
            {item.descricao}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
            <span>Vencimento Previsto:</span>
            <span className="font-mono font-bold text-foreground">
              {formatDateBr(item.dataVencimento)}
            </span>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-foreground font-bold mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-connect-blue" />
              Data Efetiva da Liquidação
            </label>
            <input
              type="date"
              required
              value={dataEfetiva}
              onChange={(e) => setDataEfetiva(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-mono font-bold focus:outline-none focus:ring-2 focus:ring-connect-blue"
            />
          </div>

          <div>
            <label className="block text-foreground font-bold mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-connect-blue" />
              Meio Efetivo de Liquidação
            </label>
            <select
              value={meio}
              onChange={(e) => setMeio(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-connect-blue"
            >
              {PAYMENT_METHOD_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-foreground font-bold mb-1 flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-connect-blue" />
              Comprovante de Pagamento (Anexo)
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 rounded-xl border border-dashed border-border hover:border-connect-blue text-xs flex items-center gap-1.5 bg-background text-muted-foreground hover:text-foreground">
                {uploadingReceipt ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5" />
                )}
                <span>{uploadingReceipt ? "Enviando arquivo..." : "Anexar Comprovante (PDF/Foto)"}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleUploadReceipt}
                  className="hidden"
                  disabled={uploadingReceipt}
                />
              </label>
              {anexoUrl && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate flex items-center gap-1">
                  ✓ Anexado
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-foreground font-bold mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Observação da Baixa (Opcional)
            </label>
            <input
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Quitado via PIX com comprovante anexo"
              className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingReceipt}
              className={`disabled:opacity-60 px-4 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.01] ${
                isReceita
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-connect-blue hover:bg-connect-deep-blue shadow-connect-blue/20"
              }`}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {isReceita ? "Confirmar Baixa (Entrada)" : "Confirmar Baixa (Saída)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
