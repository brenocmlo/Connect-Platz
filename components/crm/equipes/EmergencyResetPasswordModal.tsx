"use client";

import React, { useState } from "react";
import {
  X,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  ShieldAlert,
  MessageCircle,
} from "lucide-react";
import { TeamMember, ROLE_LABEL } from "./types";

interface EmergencyResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onSuccess: (msg: string) => void;
}

function generateQuickPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let pwd = "Platz@";
  for (let i = 0; i < 6; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export function EmergencyResetPasswordModal({
  isOpen,
  onClose,
  member,
  onSuccess,
}: EmergencyResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState(generateQuickPassword());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  if (!isOpen || !member) return null;

  const handleGenerate = () => {
    setNewPassword(generateQuickPassword());
    setCopied(false);
    setCopiedMsg(false);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyWhatsAppMessage = () => {
    const text = `Olá ${member.nome}, sua senha de acesso ao Connect Platz CRM foi redefinida emergencialmente.\n\nE-mail: ${member.email}\nNova Senha: ${newPassword}\n\nAcesse: https://connectplatz.com.br/login`;
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/emergency-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: member.id,
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao redefinir senha emergencial.");
      }

      onSuccess(`Senha de ${member.nome} redefinida com sucesso para: ${newPassword}`);
      onClose();
    } catch (err: any) {
      setError(err.message || "Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Redefinição Emergencial</h2>
              <p className="text-xs text-muted-foreground">Troca forçada de senha do usuário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Dados do Usuário */}
          <div className="bg-muted/40 border border-border rounded-xl p-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Colaborador:</span>
              <span className="font-bold text-foreground">{member.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">E-mail:</span>
              <span className="font-mono text-foreground">{member.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cargo:</span>
              <span className="text-foreground">{ROLE_LABEL[member.role] || member.role}</span>
            </div>
          </div>

          {/* Campo de Senha */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nova Senha Temporária
              </label>
              <button
                type="button"
                onClick={handleGenerate}
                className="text-[11px] text-connect-blue hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" /> Gerar outra
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-background border border-border focus:border-connect-blue rounded-xl px-3.5 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
              />
              <button
                type="button"
                onClick={handleCopyPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-muted text-[11px] font-semibold text-foreground hover:bg-muted/80 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copiada" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Ações de Compartilhamento */}
          <button
            type="button"
            onClick={handleCopyWhatsAppMessage}
            className="w-full py-2 px-3 rounded-xl border border-border bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span>{copiedMsg ? "Mensagem Copiada!" : "Copiar Mensagem Pronta para WhatsApp"}</span>
          </button>

          {/* Rodapé */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-xs font-bold text-white shadow-md shadow-connect-blue/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{loading ? "Aplicando..." : "Confirmar Redefinição"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
