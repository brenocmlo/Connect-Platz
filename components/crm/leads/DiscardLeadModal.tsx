"use client";

import React, { useState } from "react";
import { X, AlertOctagon, CheckCircle2, FileQuestion } from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { logAuditEvent } from "@/lib/services/auditLogger";

interface DiscardLeadModalProps {
  isOpen: boolean;
  lead: LeadDetail | null;
  onClose: () => void;
  onConfirmDiscard: (leadId: string, motivo: string, observacao?: string) => void;
}

const dropReasons = [
  "Sem Capacidade Financeira / Reprovado no Crédito",
  "Comprou com Outra Imobiliária / Concorrente",
  "Contato Inválido / Sem Resposta após Follow-up",
  "Desistiu do Investimento / Momento Inoportuno",
  "Imóvel / Região Fora do Perfil Desejado",
  "Outro Motivo",
];

export function DiscardLeadModal({
  isOpen,
  lead,
  onClose,
  onConfirmDiscard,
}: DiscardLeadModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(dropReasons[0]);
  const [observation, setObservation] = useState("");

  if (!isOpen || !lead) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Registra na trilha de auditoria
    logAuditEvent({
      acao: "Encerramento / Descarte de Lead",
      tipoAcao: "UPDATE",
      modulo: "LEADS",
      detalhes: `Lead '${lead.nome}' encerrado. Motivo: ${selectedReason}. ${observation ? `Obs: ${observation}` : ""}`,
      entidadeAfetada: {
        tipo: "Lead",
        id: lead.id,
        nome: lead.nome,
      },
    });

    onConfirmDiscard(lead.id, selectedReason, observation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Cabeçalho */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Encerrar Oportunidade
              </h3>
              <p className="text-xs text-muted-foreground">
                Informe o motivo para alimentar os relatórios de perda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-muted/40 rounded-xl border border-border">
            <span className="text-muted-foreground block text-[11px]">Cliente</span>
            <span className="font-bold text-foreground text-sm block">{lead.nome}</span>
            <span className="text-[11px] text-muted-foreground font-mono">{lead.telefone}</span>
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">
              Motivo Principal do Encerramento *
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium focus:ring-1 focus:ring-connect-blue"
            >
              {dropReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">
              Observações Adicionais (Opcional)
            </label>
            <textarea
              rows={3}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Descreva o que o cliente informou ou detalhes do encerramento..."
              className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:ring-1 focus:ring-connect-blue"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-md shadow-amber-600/20"
            >
              Confirmar Encerramento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
