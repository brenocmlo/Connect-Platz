"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  CheckCircle2,
  FileText,
  RotateCcw,
  Loader2,
  Paperclip,
  ExternalLink,
  UploadCloud,
} from "lucide-react";
import { SaleItem, SplitItem } from "./types";
import { generateCommissionReceiptPdf, CommissionReceiptData } from "@/lib/services/receipt-pdf";
import { localDateKey } from "@/components/crm/agenda/types";
import { SaleFinancialRepasseCard } from "./SaleFinancialRepasseCard";

interface SaleDetailModalProps {
  sale: SaleItem | null;
  /** Baixa/estorno restritos ao administrador (regra financeira) */
  canManagePayments: boolean;
  onClose: () => void;
  onUpdateSplitStatus: (
    splitId: string,
    status: "PAGO" | "PENDENTE",
    dataPagamento?: string,
    comprovanteUrl?: string
  ) => Promise<boolean>;
}

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_STYLE: Record<string, string> = {
  PAGO: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  PENDENTE: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  CANCELADO: "bg-muted text-muted-foreground border-border",
};

export function SaleDetailModal({
  sale,
  canManagePayments,
  onClose,
  onUpdateSplitStatus,
}: SaleDetailModalProps) {
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payDate, setPayDate] = useState(localDateKey(new Date()));
  const [comprovanteUrl, setComprovanteUrl] = useState("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

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
      dataPagamento: split.dataPagamento || "Pendente",
      imovelNome: sale.imovelNome,
      unidadeNumero: sale.unidadeNumero || "—",
      compradorNome: sale.compradorNome,
    };
    generateCommissionReceiptPdf(data);
  };

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
        setComprovanteUrl(data.urls[0]);
      } else {
        alert(data.error || "Falha no envio do comprovante.");
      }
    } catch {
      alert("Falha de conexão ao enviar o comprovante.");
    } finally {
      setUploadingReceipt(false);
    }
  };

  const run = async (splitId: string, status: "PAGO" | "PENDENTE", date?: string, receiptUrl?: string) => {
    setBusyId(splitId);
    const ok = await onUpdateSplitStatus(splitId, status, date, receiptUrl);
    setBusyId(null);
    if (ok) {
      setPayingId(null);
      setComprovanteUrl("");
    }
  };

  const info = [
    { label: "VGV", value: brl(sale.vgv), className: "text-emerald-600 dark:text-emerald-400" },
    { label: "Comissão Bruta", value: brl(sale.comissaoTotal), className: "text-connect-blue dark:text-blue-400" },
    {
      label: `Imposto (${sale.impostoPercentual.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%)`,
      value: brl(sale.impostoValor),
      className: "text-foreground",
    },
    { label: "Data da Venda", value: sale.dataVenda, className: "text-foreground" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[88vh] shadow-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-connect-blue/10 text-connect-blue">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-foreground">Venda {sale.codigoVenda}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {sale.imovelNome}
                {sale.unidadeNumero ? ` • Unidade ${sale.unidadeNumero}` : ""} • {sale.compradorNome}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-muted/50 border border-border">
            {info.map((i) => (
              <div key={i.label}>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">{i.label}</span>
                <span className={`font-extrabold text-sm ${i.className}`}>{i.value}</span>
              </div>
            ))}
          </div>

          {/* Demonstrativo de Repasse Financeiro (Proprietário, Corretores, Imobiliária) */}
          <SaleFinancialRepasseCard
            vgv={sale.vgv}
            comissaoTotal={sale.comissaoTotal}
            impostoValor={sale.impostoValor}
            impostoPercentual={sale.impostoPercentual}
            splits={sale.splits}
          />

          <div className="space-y-2.5">
            <h4 className="font-semibold text-foreground text-[11px] uppercase tracking-wider border-l-[3px] border-connect-blue pl-2">
              Splits de Comissões e Pagamentos
            </h4>

            {sale.splits.length === 0 && (
              <p className="text-muted-foreground text-[11px]">Nenhum split registrado para esta venda.</p>
            )}

            {sale.splits.map((split) => (
              <div key={split.id} className="p-3 rounded-xl border border-border bg-card hover:border-connect-blue/40 transition-colors space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground">{split.beneficiario}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {split.categoria} · {split.percentual.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                      <strong className="text-foreground">{brl(split.valor)}</strong>
                      {split.status === "PAGO" && split.dataPagamento
                        ? ` · pago em ${split.dataPagamento}`
                        : split.dataVencimento
                        ? ` · vence em ${split.dataVencimento}`
                        : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[split.status] || STATUS_STYLE.CANCELADO}`}>
                      {split.status === "PAGO" ? "Liquidado" : split.status === "PENDENTE" ? "Pendente" : "Cancelado"}
                    </span>
                    {split.status === "PAGO" && (
                      <button
                        onClick={() => handleDownloadReceipt(split)}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
                        title="Baixar recibo PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {split.status === "PAGO" && split.comprovanteUrl && (
                      <a
                        href={split.comprovanteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-connect-blue flex items-center gap-1 text-[10px] font-semibold"
                        title="Visualizar Comprovante Anexo"
                      >
                        <Paperclip className="w-3 h-3" />
                        Comprovante
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    )}
                    {canManagePayments && split.status === "PENDENTE" && payingId !== split.id && (
                      <button
                        onClick={() => {
                          setPayingId(split.id);
                          setComprovanteUrl(split.comprovanteUrl || "");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-all hover:scale-[1.02]"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Dar Baixa
                      </button>
                    )}
                    {canManagePayments && split.status === "PAGO" && (
                      <button
                        onClick={() => run(split.id, "PENDENTE")}
                        disabled={busyId === split.id}
                        className="px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-[11px] font-semibold flex items-center gap-1 disabled:opacity-50"
                      >
                        {busyId === split.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                        Estornar
                      </button>
                    )}
                  </div>
                </div>

                {payingId === split.id && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-border animate-fade-in bg-muted/20 p-2.5 rounded-lg">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="text-[11px] font-semibold text-foreground">Data do pagamento:</label>
                      <input
                        type="date"
                        value={payDate}
                        onChange={(e) => setPayDate(e.target.value)}
                        className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="text-[11px] font-semibold text-foreground">Comprovante de pagamento:</label>
                      <label className="cursor-pointer px-2.5 py-1 rounded-lg border border-dashed border-border hover:border-connect-blue text-[11px] flex items-center gap-1 bg-background text-muted-foreground hover:text-foreground">
                        {uploadingReceipt ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3 h-3" />
                        )}
                        <span>{uploadingReceipt ? "Enviando..." : "Anexar arquivo"}</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleUploadReceipt}
                          className="hidden"
                          disabled={uploadingReceipt}
                        />
                      </label>
                      {comprovanteUrl && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-xs flex items-center gap-1">
                          ✓ Comprovante anexado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => run(split.id, "PAGO", payDate, comprovanteUrl || undefined)}
                        disabled={busyId === split.id || !payDate || uploadingReceipt}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 disabled:opacity-50 shadow-xs"
                      >
                        {busyId === split.id && <Loader2 className="w-3 h-3 animate-spin" />}
                        Confirmar Baixa com Comprovante
                      </button>
                      <button
                        onClick={() => {
                          setPayingId(null);
                          setComprovanteUrl("");
                        }}
                        className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-border flex justify-end bg-muted/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-muted/70"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
