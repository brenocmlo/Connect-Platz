"use client";

import React, { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  KeyRound,
} from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { useCrm } from "@/components/crm/CrmContext";
import { logAuditEvent } from "@/lib/services/auditLogger";

export function ChangePasswordSection() {
  const { user, setActionMessage } = useCrm();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // Força da senha
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: "", color: "bg-transparent", percent: 0 };
    if (pwd.length < 6) return { label: "Muito Curta", color: "bg-rose-500", percent: 25 };
    const hasNum = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const score = (pwd.length >= 8 ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpecial ? 1 : 0) + (hasUpper ? 1 : 0);

    if (score >= 3) return { label: "Forte", color: "bg-emerald-500", percent: 100 };
    if (score >= 2) return { label: "Média", color: "bg-amber-500", percent: 65 };
    return { label: "Fraca", color: "bg-rose-400", percent: 40 };
  };

  const strength = getPasswordStrength(newPassword);

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError("Por favor, digite sua senha atual.");
      return;
    }
    if (newPassword.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("A confirmação da senha não confere com a nova senha digitada.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("A nova senha deve ser diferente da senha atual.");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmChange = () => {
    setIsConfirmModalOpen(false);

    // Registra auditoria
    logAuditEvent({
      usuario: {
        id: user?.id || "u-1",
        nome: user?.nome || "Robson Carvalho",
        email: user?.email || "robson@connectplatz.com.br",
        role: user?.role || "ADMINISTRADOR",
      },
      acao: "Alteração de Senha",
      tipoAcao: "PASSWORD_CHANGE",
      modulo: "CONFIGURACOES",
      detalhes: "Senha de acesso alterada com sucesso pelo próprio usuário com confirmação.",
    });

    // Reset fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccessNotice(true);
    setActionMessage("Senha alterada com sucesso!");

    setTimeout(() => {
      setSuccessNotice(false);
      setActionMessage(null);
    }, 4000);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <SectionTitle title="Segurança & Alteração de Senha" />
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <KeyRound className="w-3.5 h-3.5 text-platz-gold" />
          Recomenda-se atualizar a cada 90 dias
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Defina uma nova senha para acessar sua conta no Connect Platz CRM. Todas as alterações exigem confirmação.
      </p>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Sua senha foi alterada com sucesso! Utilize-a nos próximos acessos.</span>
        </div>
      )}

      <form onSubmit={handleOpenConfirmModal} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Senha Atual */}
          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">
              Senha Atual *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-lg pl-9 pr-9 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nova Senha */}
          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">
              Nova Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-background border border-border rounded-lg pl-9 pr-9 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Indicador de Força */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Força: {strength.label}</span>
                  <span>{newPassword.length} carac.</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirmar Nova Senha */}
          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">
              Confirmar Nova Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Repita a nova senha"
                className="w-full bg-background border border-border rounded-lg pl-9 pr-9 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-connect-blue hover:bg-connect-deep-blue text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-md shadow-connect-blue/20 transition-all hover:scale-[1.02] flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-platz-gold" />
            Atualizar Minha Senha
          </button>
        </div>
      </form>

      {/* Modal de Confirmação de Alteração */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-platz-gold/20 text-platz-gold border border-platz-gold/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Confirmar Alteração de Senha
                </h3>
              </div>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Você está prestes a atualizar sua credencial de acesso no sistema Connect Platz CRM.
              Após confirmar, a nova senha entrará em vigor imediatamente. Deseja prosseguir?
            </p>

            <div className="p-3 rounded-xl bg-muted/60 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-connect-blue shrink-0" />
              <span>Você continuará conectado nesta sessão atual.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmChange}
                className="px-5 py-2.5 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white font-bold text-xs shadow-md shadow-connect-blue/20 transition-all hover:scale-[1.01]"
              >
                Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
