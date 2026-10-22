"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, MessageCircle } from "lucide-react";

interface PortalLeadContactFormProps {
  propertyId: string;
  propertyNome: string;
  whatsAppDirectUrl: string;
  onClose: () => void;
}

const inputClass =
  "h-11 w-full rounded-xl border border-portal-field bg-portal-surface px-3 text-sm text-portal-ink placeholder:text-slate-500 focus:border-connect-blue focus:outline-none focus:ring-2 focus:ring-connect-blue/30";

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

  useEffect(() => {
    if (!corretorAtribuido) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [corretorAtribuido, onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/leads/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, telefone, email, propertyId, propertyNome, mensagem }),
      });
      const data = await res.json();
      if (res.ok) setCorretorAtribuido(data.assignedCorretor || "Equipe de Plantão");
      else setErro(data.error || "Erro ao registrar interesse.");
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
        <div role="status" className="mt-4 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <strong className="block text-sm">Solicitação registrada com sucesso!</strong>
            <span>O corretor <strong>{corretorAtribuido}</strong> da Connect Platz entrará em contato em instantes.</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3.5 grid gap-3 text-xs">
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
              className="flex-1 h-11 rounded-xl bg-connect-blue text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-connect-blue/20 transition-all hover:bg-connect-deep-blue disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar Interesse"}
            </button>
            <a
              href={whatsAppDirectUrl}
              target="_blank"
              rel="noreferrer"
              className="h-11 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all shrink-0"
              title="Chamar no WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
