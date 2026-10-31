"use client";

import React, { useState } from "react";
import { CheckCircle2, Building2, FileText, Send, X, ShieldAlert, AlertCircle } from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { patchLead } from "./leadsApi";

interface RequestClosingModalProps {
  isOpen: boolean;
  lead: LeadDetail | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function RequestClosingModal({
  isOpen,
  lead,
  onClose,
  onSuccess,
}: RequestClosingModalProps) {
  const [unidade, setUnidade] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const closingNotes = [
        lead.observacoes || "",
        unidade ? `[Unidade/Bloco: ${unidade.trim()}]` : "",
        observacoes ? `[Proposta: ${observacoes.trim()}]` : "",
      ]
        .filter(Boolean)
        .join("\n");

      await patchLead(lead.id, {
        action: "SOLICITAR_FECHAMENTO",
        observacoes: closingNotes,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || "Não foi possível enviar a solicitação ao financeiro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-connect-blue/10 text-connect-blue flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-connect-blue" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Solicitar Fechamento Comercial</h2>
              <p className="text-xs text-muted-foreground">Envio da negociação para formalização do Financeiro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Dados do Lead */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</span>
              <span className="text-xs font-bold text-foreground">{lead.nome}</span>
            </div>
            {lead.telefone && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Contato:</span>
                <span className="font-medium text-foreground">{lead.telefone}</span>
              </div>
            )}
            {lead.empreendimentoInteresse && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Interesse:
                </span>
                <span className="font-semibold text-connect-blue">{lead.empreendimentoInteresse}</span>
              </div>
            )}
          </div>

          {/* Unidade / Bloco */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Unidade / Bloco Negociado <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              placeholder="Ex.: Apto 402 - Bloco A"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-connect-blue/30"
            />
          </div>

          {/* Observações da proposta verbal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Resumo da Proposta Acordada
            </label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Descreva a condição acordada com o cliente (ex: sinal de 20%, financiamento bancário pela Caixa, etc.)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-connect-blue/30 resize-none"
            />
          </div>

          {/* Callout Informativo LGPD & Finanças */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Regra de Segurança Financeira:</span> Os valores oficiais (VGV), comissões,
              splits de pagamento e emissão de contratos são de atribuição exclusiva do setor{" "}
              <strong>Financeiro</strong> e <strong>Administração</strong>. O lead entrará na fila de conferência.
            </div>
          </div>

          {/* Rodapé fixo */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-connect-blue hover:bg-connect-blue/90 rounded-lg shadow-md shadow-connect-blue/20 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "Enviando..." : "Enviar ao Financeiro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
