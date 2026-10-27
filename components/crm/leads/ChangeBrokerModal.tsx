"use client";

import React, { useState, useMemo } from "react";
import { UserCheck, X, Search, Check, Loader2, ArrowRight } from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { LookupMember } from "@/components/crm/agenda/useCrmLookups";

interface ChangeBrokerModalProps {
  isOpen: boolean;
  lead: LeadDetail | null;
  members: LookupMember[];
  onClose: () => void;
  onSuccess: (leadId: string, newBrokerId: string, newBrokerName: string) => Promise<void>;
}

export function ChangeBrokerModal({
  isOpen,
  lead,
  members,
  onClose,
  onSuccess,
}: ChangeBrokerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializa a seleção com o corretor atual do lead ao abrir
  React.useEffect(() => {
    if (lead?.corretor?.id) {
      setSelectedBrokerId(lead.corretor.id);
    } else {
      setSelectedBrokerId("");
    }
    setSearch("");
    setError(null);
  }, [lead, isOpen]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      m.nome.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  if (!isOpen || !lead) return null;

  const currentBrokerName = lead.corretor?.nome || "Sem corretor (Bolsão)";
  const selectedMember = members.find((m) => m.id === selectedBrokerId);
  const isUnchanged = selectedBrokerId === (lead.corretor?.id || "");

  const handleConfirm = async () => {
    if (!selectedBrokerId) {
      setError("Selecione um corretor para assumir o lead.");
      return;
    }
    if (isUnchanged) {
      onClose();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSuccess(lead.id, selectedBrokerId, selectedMember?.nome || "Novo Corretor");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao transferir corretor.");
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

        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-connect-blue/10 border border-connect-blue/20 text-connect-blue flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="pr-6">
            <h3 className="text-base font-bold text-foreground">Mudar Corretor Responsável</h3>
            <p className="text-xs text-muted-foreground">
              Transferência de carteira do lead <strong className="text-foreground">{lead.nome}</strong>.
            </p>
          </div>
        </div>

        {/* Resumo da Transferência: De -> Para */}
        <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs mb-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Atual</span>
            <span className="font-semibold text-foreground truncate block">{currentBrokerName}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-connect-blue shrink-0" />
          <div className="min-w-0 text-right">
            <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Novo</span>
            <span className="font-bold text-connect-blue truncate block">
              {selectedMember?.nome || "Selecione..."}
            </span>
          </div>
        </div>

        {/* Campo de Busca de Corretores */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar corretor por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
          />
        </div>

        {/* Lista de Corretores */}
        <div className="max-h-56 overflow-y-auto space-y-1.5 border border-border/60 rounded-xl p-1.5 bg-background/50">
          {filteredMembers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Nenhum corretor encontrado.</p>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = member.id === selectedBrokerId;
              const isCurrent = member.id === (lead.corretor?.id || "");

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedBrokerId(member.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all text-xs ${
                    isSelected
                      ? "bg-connect-blue text-white shadow-xs font-semibold"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? "bg-white/20 text-white" : "bg-connect-blue/10 text-connect-blue"
                      }`}
                    >
                      {member.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="block truncate">{member.nome}</span>
                      {isCurrent && (
                        <span className={`text-[10px] block ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                          (Atual responsável)
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-border/80">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || !selectedBrokerId || isUnchanged}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-connect-blue hover:bg-connect-deep-blue shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Transferindo...</span>
              </>
            ) : (
              <span>Confirmar Transferência</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
