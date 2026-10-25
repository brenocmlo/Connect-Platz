"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { TeamMember } from "./types";

interface RemoveBrokerModalProps {
  isOpen: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onConfirm: (member: TeamMember) => Promise<void>;
}

export function RemoveBrokerModal({
  isOpen,
  member,
  onClose,
  onConfirm,
}: RemoveBrokerModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !member) return null;

  const handleConfirm = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(member);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover o corretor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>

          <div className="space-y-1 pr-6">
            <h3 className="text-base font-bold text-foreground">Remover Corretor da Equipe</h3>
            <p className="text-xs text-muted-foreground">
              Esta ação revoga imediatamente o acesso do profissional ao sistema.
            </p>
          </div>
        </div>

        <div className="my-5 p-3.5 rounded-xl bg-muted/60 border border-border text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Profissional:</span>
            <strong className="text-foreground">{member.nome}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">E-mail:</span>
            <span className="font-mono text-muted-foreground">{member.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Leads em Carteira:</span>
            <strong className="text-foreground">{member.leadsAtivos}</strong>
          </div>
        </div>

        {member.leadsAtivos > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Os <strong>{member.leadsAtivos} leads ativos</strong> deste corretor serão transferidos automaticamente para o <strong>Bolsão de Leads</strong> para nova distribuição.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Removendo...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Remoção</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
