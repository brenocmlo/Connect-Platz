"use client";

import React, { useState } from "react";
import {
  X,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  ShieldAlert,
  Send,
  Phone,
  Shield,
} from "lucide-react";

export type InviteRole = "CORRETOR" | "GERENTE" | "DIRETOR";

export interface InviteCollaboratorData {
  nome: string;
  email: string;
  role: InviteRole;
  creci?: string;
  telefone?: string;
  senhaTemporaria: string;
}

interface InviteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Deve lançar erro (com mensagem) se o cadastro falhar; o modal só fecha após sucesso. */
  onInvite: (data: InviteCollaboratorData) => Promise<void>;
  /** Administrador/Diretor podem cadastrar gestores; Gerente cadastra apenas corretores. */
  canInviteManagers?: boolean;
}

/** Senha provisória aleatória (crypto) com 12 caracteres. */
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint32Array(8);
  crypto.getRandomValues(bytes);
  const random = Array.from(bytes, (b) => chars[b % chars.length]).join("");
  return `Cp@${random}!`;
}

export function InviteCollaboratorModal({
  isOpen,
  onClose,
  onInvite,
  canInviteManagers = false,
}: InviteCollaboratorModalProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("CORRETOR");
  const [creci, setCreci] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senhaTemporaria, setSenhaTemporaria] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    setSenhaTemporaria(generateTempPassword());
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !senhaTemporaria.trim()) return;
    if (senhaTemporaria.trim().length < 8) {
      setError("A senha provisória deve ter no mínimo 8 caracteres.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onInvite({
        nome: nome.trim(),
        email: email.trim(),
        role,
        creci: creci.trim() || undefined,
        telefone: telefone.trim() || undefined,
        senhaTemporaria: senhaTemporaria.trim(),
      });
      // Reset somente após sucesso confirmado pela API
      setNome("");
      setEmail("");
      setCreci("");
      setTelefone("");
      setRole("CORRETOR");
      setSenhaTemporaria("");
      setShowPassword(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível cadastrar o colaborador.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-connect-blue/10 text-connect-blue border border-connect-blue/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Convidar Novo Profissional
              </h3>
              <p className="text-xs text-muted-foreground">
                Cadastre os dados e configure a credencial provisória de acesso
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

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}
          {/* Nome e Cargo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-foreground font-semibold mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Carlos Albuquerque"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1">
                E-mail Corporativo *
              </label>
              <input
                type="email"
                required
                placeholder="carlos.corretor@connectplatz.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1">
                Nível de Acesso *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as InviteRole)}
                className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              >
                <option value="CORRETOR">Corretor (Leads próprios & Agenda)</option>
                {canInviteManagers && <option value="GERENTE">Gerente de Equipe (Time & BI)</option>}
                {canInviteManagers && <option value="DIRETOR">Diretor (Gestão completa)</option>}
              </select>
            </div>
          </div>

          {/* Telefone e CRECI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-connect-blue" />
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-platz-gold" />
                CRECI (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex.: 00000-F"
                value={creci}
                onChange={(e) => setCreci(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
          </div>

          {/* Bloco de Senha Temporária */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-foreground font-bold flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-platz-gold" />
                Senha Temporária de Acesso *
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] font-bold text-connect-blue hover:text-connect-deep-blue flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-platz-gold" />
                Gerar Senha
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={senhaTemporaria}
                onChange={(e) => setSenhaTemporaria(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-3 pr-10 py-2.5 text-foreground font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-connect-blue"
                placeholder="Defina a senha temporária"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Callout Informativo */}
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-connect-blue/5 border border-connect-blue/20 text-[11px] text-muted-foreground">
              <Info className="w-4 h-4 text-connect-blue shrink-0 mt-0.5" />
              <span>
                Nenhum e-mail é enviado automaticamente: compartilhe esta senha provisória com o profissional por um canal seguro e
                oriente-o a trocá-la em Configurações &gt; Minha Conta no primeiro acesso.
              </span>
            </div>
          </div>

          {/* Footer de Ações */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="disabled:opacity-60 px-5 py-2.5 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white font-extrabold flex items-center gap-2 shadow-md shadow-connect-blue/20 transition-all hover:scale-[1.01]"
            >
              <Send className="w-3.5 h-3.5 text-platz-gold" />
              {submitting ? "Cadastrando..." : "Cadastrar Colaborador"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
