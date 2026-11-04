"use client";

import React, { useState } from "react";
import { X, MessageCircle, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { getCapturedUtmData } from "@/lib/tracking/utmCapture";

interface PortalQuickLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  defaultMessage?: string;
  contextSource?: string;
  propertyNome?: string;
}

export function PortalQuickLeadModal({
  isOpen,
  onClose,
  title = "Falar com Corretor no WhatsApp",
  subtitle = "Receba atendimento personalizado pelo corretor especialista de plantão.",
  defaultMessage = "Olá! Gostaria de mais informações sobre os imóveis da Connect Platz.",
  contextSource = "site_whatsapp_flutuante",
  propertyNome,
}: PortalQuickLeadModalProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) {
      setError("Por favor, informe seu nome e WhatsApp.");
      return;
    }

    setLoading(true);
    setError(null);

    const utmData = getCapturedUtmData();
    const eventId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `lead_${Date.now()}`;

    try {
      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "Lead", { content_name: propertyNome || "Contato Rápido WhatsApp" }, { eventID: eventId });
      }
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "generate_lead", { event_label: propertyNome || "WhatsApp Flutuante" });
      }
    } catch {}

    try {
      const res = await fetch("/api/leads/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.trim(),
          propertyNome,
          mensagem: defaultMessage,
          eventId,
          utmSource: utmData.utmSource || contextSource,
          ...utmData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao registrar contato.");

      setSuccess(true);
      const cleanPhone = String(data.assignedCorretorPhone || "85999990001").replace(/\D/g, "");
      const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
        `${defaultMessage}\n\n(Solicitante: ${nome.trim()} • WhatsApp: ${telefone.trim()})`
      )}`;

      setTimeout(() => {
        window.open(waUrl, "_blank", "noopener,noreferrer");
        onClose();
        setSuccess(false);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Erro de conexão ao enviar seus dados.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-portal-surface border border-portal-field w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-portal-ink">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-portal-slate hover:text-portal-ink hover:bg-portal-sand transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-portal-ink">{title}</h3>
            <p className="text-xs text-portal-slate">{subtitle}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-scale-up">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="block text-sm">Dados salvos com sucesso!</strong>
              <span>Conectando com o corretor responsável no WhatsApp...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-xs font-semibold text-portal-ink mb-1">Seu nome completo *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Ana Silva"
                className="h-11 w-full rounded-xl border border-portal-field bg-portal-surface px-3 text-sm text-portal-ink focus:border-connect-blue focus:outline-none focus:ring-2 focus:ring-connect-blue/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-portal-ink mb-1">Seu WhatsApp com DDD *</label>
              <input
                type="tel"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(85) 99999-9999"
                className="h-11 w-full rounded-xl border border-portal-field bg-portal-surface px-3 text-sm text-portal-ink focus:border-connect-blue focus:outline-none focus:ring-2 focus:ring-connect-blue/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                "Conectando ao Corretor..."
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  <span>Continuar para o WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
