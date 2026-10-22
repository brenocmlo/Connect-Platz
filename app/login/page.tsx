"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Building2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("robson@connectplatz.com.br");
  const [password, setPassword] = useState("ConnectPlatz2026@");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha na autenticação");
      }

      // Redirecionamento completo para garantir despacho imediato dos cookies HTTP
      window.location.href = "/crm";
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#080C14] px-4 py-6 sm:py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-connect-blue/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-platz-gold/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-connect-blue/15 border border-connect-blue/40 text-blue-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-connect-blue shrink-0" />
            <span>Autenticação Segura • RLS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            CONNECT <span className="text-[#D9BB4C]">PLATZ</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Robson Carvalho CRM & ERP Imobiliário
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs sm:text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
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
                  className="w-full bg-[#0D131F] border border-[#1F2937] focus:border-connect-blue rounded-xl pl-10 pr-4 py-3 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-connect-blue transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#0D131F] border border-[#1F2937] focus:border-connect-blue rounded-xl pl-10 pr-4 py-3 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-connect-blue transition-all"
                />
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
                Protegido por hash bcrypt salt rounds 12.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1266C7] hover:bg-[#0D478F] active:scale-[0.99] text-white font-bold py-3 sm:py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-connect-blue/30 transition-all disabled:opacity-50 text-sm sm:text-base cursor-pointer"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Help (Tap to auto-fill) */}
          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-[#1F2937] text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-300 text-center">Toque para preencher (Demonstração):</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("robson@connectplatz.com.br");
                  setPassword("ConnectPlatz2026@");
                }}
                className="p-2 rounded-lg bg-[#0D131F] border border-[#1F2937] hover:border-connect-blue text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-[#D9BB4C] text-[11px]">Admin / Gestor</div>
                <div className="text-[10px] text-slate-400 truncate">robson@...</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("lucas.corretor@connectplatz.com.br");
                  setPassword("ConnectPlatz2026@");
                }}
                className="p-2 rounded-lg bg-[#0D131F] border border-[#1F2937] hover:border-connect-blue text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-blue-400 text-[11px]">Corretor</div>
                <div className="text-[10px] text-slate-400 truncate">lucas...@...</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-5 sm:mt-6 text-[11px] sm:text-xs text-slate-500">
          Connect Platz Imobiliária © 2026 • Todos os direitos reservados
        </div>
      </div>
    </div>
  );
}
