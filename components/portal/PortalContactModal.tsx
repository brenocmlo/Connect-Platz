"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Bath, BedDouble, Car, CheckCircle2, MapPin, Ruler, X } from "lucide-react";
import type { PropertyItem } from "./types";
import { FALLBACK_PHOTO, formatPrice, isTemporada } from "./portalUtils";

interface PortalContactModalProps {
  property: PropertyItem | null;
  onClose: () => void;
}

const inputClass =
  "h-12 w-full rounded-lg border border-portal-field bg-portal-surface px-3 text-base text-portal-ink placeholder:text-slate-500 focus:border-connect-blue focus:outline-none focus:ring-2 focus:ring-connect-blue/30 sm:text-sm";

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-portal-ink">
        {label}
      </label>
      {children}
    </div>
  );
}

function ModalPanel({ property, onClose }: { property: PropertyItem; onClose: () => void }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [corretorAtribuido, setCorretorAtribuido] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

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
        body: JSON.stringify({ nome, telefone, email, propertyId: property.id, propertyNome: property.nome, mensagem }),
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

  const c = property.caracteristicas || {};
  const specs = [
    { icon: Ruler, label: "Área", value: c.area_m2 ? `${c.area_m2} m²` : null },
    { icon: BedDouble, label: "Quartos", value: c.quartos },
    { icon: Bath, label: "Suítes", value: c.suites },
    { icon: Car, label: "Vagas", value: c.vagas },
  ].filter((s) => s.value);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-imovel-titulo"
      className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-portal-surface shadow-2xl sm:rounded-2xl md:flex-row"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-portal-surface/90 text-portal-ink shadow-md transition-colors hover:bg-portal-surface"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative h-52 shrink-0 md:h-auto md:w-[44%]">
        <img src={property.fotos?.[0] || FALLBACK_PHOTO} alt={property.nome} className="h-full w-full object-cover" />
      </div>

      <div className="flex-1 overflow-y-auto p-5 sm:p-7">
        <span className="inline-flex rounded-full bg-connect-blue/10 px-3 py-1 text-xs font-semibold text-connect-blue">
          {isTemporada(property) ? "Temporada" : "Venda"}
        </span>
        <h2 id="modal-imovel-titulo" className="mt-3 pr-8 text-xl font-extrabold text-portal-ink">
          {property.nome}
        </h2>
        <p className="mt-1 flex items-center gap-1 text-sm text-portal-slate">
          <MapPin className="h-3.5 w-3.5" />
          {[property.bairro, property.cidade].filter(Boolean).join(", ")}
        </p>
        <p className="mt-3 text-2xl font-extrabold text-connect-blue">{formatPrice(property)}</p>

        {specs.length > 0 && (
          <dl className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-portal-mist p-3 text-center">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <Icon className="mx-auto h-4 w-4 text-connect-blue" />
                <dt className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-portal-slate">{label}</dt>
                <dd className="text-sm font-bold text-portal-ink">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-6 border-t border-portal-line pt-5">
          <h3 className="text-base font-bold text-portal-ink">Fale com o corretor deste imóvel</h3>
          <p className="mt-1 text-sm text-portal-slate">
            Receba a ficha completa e agende uma visita presencial ou por vídeo.
          </p>

          {corretorAtribuido ? (
            <div role="status" className="mt-4 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-200">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p>
                <strong className="block">Solicitação registrada!</strong>
                O corretor <strong>{corretorAtribuido}</strong> vai falar com você pelo WhatsApp em instantes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="lead-nome" label="Seu nome">
                  <input id="lead-nome" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" className={inputClass} />
                </Field>
                <Field id="lead-tel" label="WhatsApp">
                  <input id="lead-tel" type="tel" required value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(85) 99999-9999" className={inputClass} />
                </Field>
              </div>
              <Field id="lead-email" label="E-mail (opcional)">
                <input id="lead-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className={inputClass} />
              </Field>
              <Field id="lead-msg" label="Mensagem (opcional)">
                <textarea
                  id="lead-msg"
                  rows={2}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Quero saber das condições de pagamento e agendar uma visita."
                  className={`${inputClass} h-auto py-3`}
                />
              </Field>
              {erro && (
                <p role="alert" className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {erro}
                </p>
              )}
              <button
                type="submit"
                disabled={enviando}
                className="h-12 rounded-full bg-connect-blue text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-connect-blue/25 transition-all hover:scale-[1.01] hover:bg-connect-deep-blue active:scale-[0.98] disabled:opacity-60"
              >
                {enviando ? "Enviando..." : "Enviar interesse"}
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function PortalContactModal({ property, onClose }: PortalContactModalProps) {
  return (
    <AnimatePresence>
      {property && (
        <motion.div
          key={property.id}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalPanel property={property} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
