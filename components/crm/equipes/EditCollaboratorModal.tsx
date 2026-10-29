// components/crm/equipes/EditCollaboratorModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Pencil, Phone, Shield, User, Mail, Activity } from "lucide-react";
import { TeamMember, MemberRole, MemberStatus, ROLE_LABEL, STATUS_META } from "./types";

export interface EditCollaboratorData {
  userId: string;
  nome: string;
  email: string;
  telefone?: string;
  creci?: string;
  status: MemberStatus;
  role: MemberRole;
}

interface EditCollaboratorModalProps {
  isOpen: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSave: (data: EditCollaboratorData) => Promise<void>;
  currentUserRole?: string;
}

export function EditCollaboratorModal({
  isOpen,
  member,
  onClose,
  onSave,
  currentUserRole,
}: EditCollaboratorModalProps) {
  const isAdmin = currentUserRole === "ADMINISTRADOR";

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [creci, setCreci] = useState("");
  const [role, setRole] = useState<MemberRole>("CORRETOR_VENDA");
  const [status, setStatus] = useState<MemberStatus>("DISPONIVEL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setNome(member.nome || "");
      setEmail(member.email || "");
      setTelefone(member.telefone || "");
      setCreci(member.creci || "");
      setRole(member.role);
      setStatus(member.status);
      setError(null);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setError("Nome e e-mail são obrigatórios.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSave({
        userId: member.id,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone.trim() || undefined,
        creci: creci.trim() || undefined,
        status,
        role: isAdmin ? role : member.role,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar colaborador.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-connect-blue/10 border border-connect-blue/20 text-connect-blue flex items-center justify-center shrink-0">
            <Pencil className="w-5 h-5" />
          </div>
          <div className="pr-6">
            <h3 className="text-base font-bold text-foreground">Editar Colaborador</h3>
            <p className="text-xs text-muted-foreground">
              Atualize os dados e a disponibilidade de <strong className="text-foreground">{member.nome}</strong>.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-foreground font-semibold mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-connect-blue" />
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do colaborador"
                className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-connect-blue" />
                E-mail Corporativo *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@connectplatz.com.br"
                className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-connect-blue" />
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-platz-gold" />
                CRECI (opcional)
              </label>
              <input
                type="text"
                value={creci}
                onChange={(e) => setCreci(e.target.value)}
                placeholder="Ex.: 12345-F"
                className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                Status na Roleta *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
                className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              >
                <option value="DISPONIVEL">{STATUS_META.DISPONIVEL.label} (Recebe novos leads)</option>
                <option value="EM_VISITA">{STATUS_META.EM_VISITA.label} (Em visita externa)</option>
                <option value="PAUSA">{STATUS_META.PAUSA.label} (Pausa temporária)</option>
                <option value="OFFLINE">{STATUS_META.OFFLINE.label} (Indisponível)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-foreground font-semibold mb-1">
                Cargo / Modalidade *
              </label>
              {isAdmin ? (
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as MemberRole)}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                >
                  <option value="CORRETOR_VENDA">Corretor Vendas (Leads e Vendas)</option>
                  <option value="CORRETOR_ALUGUEL">Corretor Aluguéis (Locações e Temporada)</option>
                  <option value="FINANCEIRO_VENDA">Financeiro Vendas (VGV, Comissões e ERP Venda)</option>
                  <option value="FINANCEIRO_ALUGUEL">Financeiro Aluguéis (Diárias, Locações e ERP Aluguel)</option>
                  <option value="ADMINISTRADOR">Administrador (Gestão Irrestrita)</option>
                </select>
              ) : (
                <div className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground font-semibold flex items-center justify-between">
                  <span>{ROLE_LABEL[member.role] || member.role}</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (Fixo · Apenas Administradores podem alterar cargo)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white font-bold shadow-md shadow-connect-blue/20 transition-all hover:scale-[1.02] flex items-center gap-1.5"
            >
              {submitting ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
