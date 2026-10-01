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

      // Salva token no localStorage para requisições de cliente
      localStorage.setItem("connect_platz_token", data.token);
      localStorage.setItem("connect_platz_user", JSON.stringify(data.user));

      router.push("/crm");
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080C14] px-4 py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-connect-blue/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-platz-gold/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-connect-blue/15 border border-connect-blue/40 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-connect-blue" />
            Autenticação Segura • Bcrypt & RLS
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            CONNECT <span className="text-[#D9BB4C]">PLATZ</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Robson Carvalho CRM & ERP Imobiliário
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu.email@connectplatz.com.br"
                  className="w-full bg-[#0D131F] border border-[#1F2937] focus:border-connect-blue rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-connect-blue transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#0D131F] border border-[#1F2937] focus:border-connect-blue rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-connect-blue transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Protegido por hash bcrypt salt rounds 12.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1266C7] hover:bg-[#0D478F] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-connect-blue/30 transition-all disabled:opacity-50"
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

          {/* Quick Demo Credentials Help */}
          <div className="mt-6 pt-6 border-t border-[#1F2937] text-xs text-slate-400 space-y-1 text-center">
            <p className="font-semibold text-slate-300">Credenciais de Demonstração:</p>
            <p>Admin: <span className="text-[#D9BB4C]">robson@connectplatz.com.br</span></p>
            <p>Corretor: <span className="text-blue-400">lucas.corretor@connectplatz.com.br</span></p>
            <p>Senha: <span className="text-slate-300 font-mono">ConnectPlatz2026@</span></p>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          Connect Platz Imobiliária © 2026 • Todos os direitos reservados
        </div>
      </div>
    </div>
  );
}
