"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  KeyRound,
  Lock,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  defaultEmail = "",
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/emergency-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao solicitar código.");

      setSuccessMsg(data.message || "Código emergencial gerado!");
      if (data.whatsAppUrl) setWhatsAppUrl(data.whatsAppUrl);
      setStep("verify");
    } catch (err: any) {
      setError(err.message || "Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !code.trim() || !newPassword.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/emergency-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          email: email.trim(),
          code: code.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Código inválido ou expirado.");

      setSuccessMsg("Senha redefinida com sucesso! Você já pode entrar.");
      setTimeout(() => {
        onClose();
        setStep("request");
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-[#1F2937] w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-white">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-connect-blue/20 border border-connect-blue/30 text-connect-blue flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-[#D9BB4C]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Redefinição Emergencial</h2>
            <p className="text-xs text-slate-400">Recupere seu acesso ao sistema</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Informe seu e-mail corporativo cadastrado. Você receberá uma chave emergencial e poderá acionar o Administrador Robson Carvalho no WhatsApp para liberação imediata.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu.email@connectplatz.com.br"
                  className="w-full bg-[#0D131F] border border-[#1F2937] focus:border-connect-blue rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-connect-blue"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1266C7] hover:bg-[#0D478F] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-connect-blue/30 transition-all disabled:opacity-50"
            >
              {loading ? "Gerando chave..." : "Gerar Código Emergencial"}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep("verify")}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Já possuo um código emergencial
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {whatsAppUrl && (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all mb-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Solicitar Liberação no WhatsApp de Robson</span>
              </a>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0D131F] border border-[#1F2937] rounded-xl px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Código Emergencial (6 dígitos)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="Ex: 849201"
                maxLength={8}
                className="w-full bg-[#0D131F] border border-[#1F2937] rounded-xl px-3.5 py-2 text-sm font-mono tracking-widest text-white text-center"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-[#0D131F] border border-[#1F2937] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1266C7] hover:bg-[#0D478F] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-connect-blue/30 transition-all disabled:opacity-50"
            >
              {loading ? "Atualizando..." : "Redefinir e Salvar Senha"}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep("request")}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Voltar para solicitar outro código
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
