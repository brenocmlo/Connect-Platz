"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, MessageCircle } from "lucide-react";
import { getCapturedUtmData } from "@/lib/tracking/utmCapture";

interface PortalLeadContactFormProps {
  propertyId: string;
  propertyNome: string;
  whatsAppDirectUrl: string | null;
  onClose: () => void;
}

const inputClass =
  "h-11 w-full rounded-xl border border-portal-field bg-portal-surface px-3 text-sm text-portal-ink placeholder:text-portal-slate focus:border-connect-blue focus:outline-none focus:ring-2 focus:ring-connect-blue/30";

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-portal-ink">
        {label}
      </label>
      {children}
    </div>
  );
}

export function PortalLeadContactForm({
  propertyId,
  propertyNome,
  whatsAppDirectUrl,
  onClose,
}: PortalLeadContactFormProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [corretorAtribuido, setCorretorAtribuido] = useState<string | null>(null);
  const [corretorTelefone, setCorretorTelefone] = useState<string | null>(null);

  useEffect(() => {
    if (!corretorAtribuido) return;
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [corretorAtribuido, onClose]);

  const handleSubmit = async (e: FormEvent, redirectWhatsApp: boolean = false) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) {
      setErro("Por favor, preencha seu nome e WhatsApp para direcionarmos o atendimento.");
      return;
    }
    setEnviando(true);
    setErro(null);

    const utmData = getCapturedUtmData();
    const eventId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `lead_${Date.now()}`;

    // Disparo no navegador via Meta Pixel e GA4 (se ativos)
    try {
      if (typeof window !== "undefined" && window.fbq) {
        window.fbq(
          "track",
          "Lead",
          {
            content_name: propertyNome,
            content_category: "Imóvel",
          },
          { eventID: eventId }
        );
      }
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "generate_lead", {
          event_label: propertyNome,
          value: 1,
        });
      }
    } catch {}

    try {
      const res = await fetch("/api/leads/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.trim(),
          email: email.trim(),
          propertyId,
          propertyNome,
          mensagem,
          eventId,
          ...utmData,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const corretorName = data.assignedCorretor || "Equipe de Plantão";
        const phone = data.assignedCorretorPhone || "85999990001";
        setCorretorAtribuido(corretorName);
        setCorretorTelefone(phone);

        if (redirectWhatsApp) {
          const cleanPhone = String(phone).replace(/\D/g, "");
          const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
            `Olá ${corretorName}! Vim pelo site da Connect Platz e tenho interesse no imóvel "${propertyNome}".\n\n(Nome: ${nome.trim()} • WhatsApp: ${telefone.trim()})`
          )}`;
          window.open(waUrl, "_blank", "noopener,noreferrer");
        }
      } else {
        setErro(data.error || "Erro ao registrar interesse.");
      }
    } catch (err) {
      console.error(err);
      setErro("Falha de conexão ao enviar seus dados. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-portal-ink">Fale com o corretor responsável</h3>
      <p className="mt-0.5 text-xs text-portal-slate">
        Receba a tabela completa, fluxo de pagamento e tire suas dúvidas por WhatsApp.
      </p>

      {corretorAtribuido ? (
        <div role="status" className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-200">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <strong className="block text-sm">Solicitação registrada com sucesso!</strong>
              <span>O corretor <strong>{corretorAtribuido}</strong> da Connect Platz entrará em contato em instantes.</span>
            </div>
          </div>
          {corretorTelefone && (
            <a
              href={`https://wa.me/55${corretorTelefone.replace(/\D/g, "")}?text=${encodeURIComponent(
                `Olá ${corretorAtribuido}! Vim pelo site da Connect Platz e tenho interesse no imóvel "${propertyNome}".`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-md transition-all self-start mt-1"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Falar com {corretorAtribuido} no WhatsApp agora</span>
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={(e) => handleSubmit(e, false)} className="mt-3.5 grid gap-3 text-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="lead-nome" label="Seu nome completo *">
              <input id="lead-nome" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Robson Carvalho" className={inputClass} />
            </Field>
            <Field id="lead-tel" label="WhatsApp *">
              <input id="lead-tel" type="tel" required value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(85) 99999-9999" className={inputClass} />
            </Field>
          </div>
          <Field id="lead-email" label="E-mail (opcional)">
            <input id="lead-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className={inputClass} />
          </Field>
          <Field id="lead-msg" label="Mensagem">
            <textarea
              id="lead-msg"
              rows={2}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Gostaria de agendar uma visita e saber as condições de pagamento..."
              className={`${inputClass} h-auto py-2.5 resize-none`}
            />
          </Field>
          {erro && (
            <p role="alert" className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{erro}</span>
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 h-11 rounded-xl bg-connect-blue text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-connect-blue/20 transition-all hover:bg-connect-deep-blue disabled:opacity-60 cursor-pointer"
            >
              {enviando ? "Enviando..." : "Enviar Interesse"}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={enviando}
              className="h-11 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-60"
              title="Salvar e abrir WhatsApp com corretor"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
