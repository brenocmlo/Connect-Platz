"use client";

import React, { useState } from "react";
import { AppointmentItem } from "./AppointmentCard";

interface VisitOutcomeModalProps {
  app: AppointmentItem | null;
  onClose: () => void;
  onSaveOutcome: (appId: string, status: "CONCLUIDO" | "NAO_COMPARECEU", resultado: string) => void;
}

export function VisitOutcomeModal({ app, onClose, onSaveOutcome }: VisitOutcomeModalProps) {
  const [outcomeStatus, setOutcomeStatus] = useState<"CONCLUIDO" | "NAO_COMPARECEU">("CONCLUIDO");
  const [outcomeNotes, setOutcomeNotes] = useState("");

  if (!app) return null;

  const handleSave = () => {
    onSaveOutcome(app.id, outcomeStatus, outcomeNotes);
    onClose();
    setOutcomeNotes("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
        <h3 className="text-base font-bold text-foreground">Registrar Parecer do Cliente</h3>
        <p className="text-xs text-muted-foreground">
          O parecer alimenta a linha do tempo do lead e métricas de conversão da imobiliária.
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-muted-foreground font-semibold mb-1">Resultado do Comparecimento</label>
            <select
              value={outcomeStatus}
              onChange={(e) => setOutcomeStatus(e.target.value as any)}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue"
            >
              <option value="CONCLUIDO">Visita Realizada com Sucesso</option>
              <option value="NAO_COMPARECEU">Cliente Não Compareceu</option>
            </select>
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1">Parecer Detalhado</label>
            <textarea
              placeholder="Ex: O cliente adorou a vista, mas pediu desconto de 5% ou permuta em veículo. Enviará proposta amanhã."
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue h-24 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white font-extrabold shadow-lg shadow-connect-blue/20 transition-all hover:scale-[1.02]"
            >
              Salvar Desfecho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
