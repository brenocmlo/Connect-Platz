"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bath,
  BedDouble,
  Car,
  MapPin,
  Ruler,
  X,
  Sparkles,
  Building,
  Check,
  MessageCircle,
  Calendar,
  Navigation,
} from "lucide-react";
import type { PropertyItem } from "./types";
import { FALLBACK_PHOTO, formatPrice, isTemporada, waLink } from "./portalUtils";
import { PropertyLocationTab } from "./PropertyLocationTab";
import { PortalLeadContactForm } from "./PortalLeadContactForm";

interface PortalContactModalProps {
  property: PropertyItem | null;
  onClose: () => void;
}

function ModalPanel({ property, onClose }: { property: PropertyItem; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"detalhes" | "localizacao" | "contato">("detalhes");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const c = property.caracteristicas || {};
  const specs = [
    { icon: Ruler, label: "Área", value: c.area_m2 ? `${c.area_m2} m²` : null },
    { icon: BedDouble, label: "Quartos", value: c.quartos ? `${c.quartos}` : null },
    { icon: Bath, label: "Suítes", value: c.suites ? `${c.suites}` : null },
    { icon: Car, label: "Vagas", value: c.vagas ? `${c.vagas}` : null },
  ].filter((s) => s.value);

  const price = formatPrice(property);
  const whatsAppDirectUrl = waLink(
    `Olá! Gostaria de mais informações sobre o imóvel "${property.nome}" (${price}) em ${property.bairro || "Fortaleza"}.`
  );

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-imovel-titulo"
      className="relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-portal-surface shadow-2xl sm:rounded-2xl md:flex-row"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Botão Fechar */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute right-3.5 top-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md shadow-md transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Lado Esquerdo: Foto de Capa & Status */}
      <div className="relative h-56 shrink-0 md:h-auto md:w-[42%] bg-portal-mist overflow-hidden">
        <img
          src={property.fotos?.[0] || FALLBACK_PHOTO}
          alt={property.nome}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
          <span className="rounded-full bg-connect-blue px-3 py-1 text-xs font-bold text-white shadow-sm">
            {isTemporada(property) ? "Temporada" : "Venda"}
          </span>
          {(property as any).estagioObra && (
            <span className="rounded-full bg-platz-gold px-3 py-1 text-xs font-bold text-portal-navy shadow-sm">
              {(property as any).estagioObra}
            </span>
          )}
        </div>

        {/* Rodapé da imagem com construtora */}
        {(property as any).construtora && (
          <div className="absolute bottom-3 left-3 right-3 text-white z-10 text-xs">
            <span className="text-[10px] uppercase font-semibold text-slate-300 block">Incorporação</span>
            <span className="font-bold flex items-center gap-1.5 text-sm">
              <Building className="w-4 h-4 text-platz-gold" />
              {(property as any).construtora}
            </span>
          </div>
        )}
      </div>

      {/* Lado Direito: Informações Completas + Abas */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col justify-between">
        <div>
          {/* Cabeçalho do Imóvel */}
          <div className="pr-8">
            <h2 id="modal-imovel-titulo" className="text-xl sm:text-2xl font-black text-portal-ink leading-tight">
              {property.nome}
            </h2>
            <div className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-portal-slate">
              <button
                type="button"
                onClick={() => setActiveTab("localizacao")}
                className="group flex items-center gap-1 text-left hover:text-connect-blue transition-colors"
                title="Ver localização detalhada e rotas"
              >
                <MapPin className="h-3.5 w-3.5 text-connect-blue shrink-0 group-hover:scale-110 transition-transform" />
                <span className="underline decoration-dotted underline-offset-2">
                  {[property.endereco, property.bairro, property.cidade].filter(Boolean).join(", ")}
                  {property.estado ? ` - ${property.estado}` : ""}
                </span>
              </button>
            </div>
          </div>

          {/* Preço em destaque */}
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-black text-connect-blue">{price}</p>
            {isTemporada(property) && <span className="text-xs text-portal-slate font-semibold">/ diária</span>}
          </div>

          {/* Especificações Técnicas (Área, Quartos, Suítes, Vagas) */}
          {specs.length > 0 && (
            <dl className="mt-3.5 grid grid-cols-4 gap-2 rounded-xl bg-portal-mist p-3 text-center border border-portal-line">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <Icon className="mx-auto h-4 w-4 text-connect-blue" />
                  <dt className="mt-1 text-[10px] font-bold uppercase tracking-wider text-portal-slate">{label}</dt>
                  <dd className="text-xs sm:text-sm font-black text-portal-ink">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Alternador de 3 Abas: Sobre o Imóvel & Lazer x Localização & Mapa x Falar com Corretor */}
          <div className="mt-4 flex border-b border-portal-line overflow-x-auto no-scrollbar gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("detalhes")}
              className={`pb-2 px-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === "detalhes"
                  ? "border-connect-blue text-connect-blue"
                  : "border-transparent text-portal-slate hover:text-portal-ink"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sobre o Imóvel & Lazer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("localizacao")}
              className={`pb-2 px-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === "localizacao"
                  ? "border-connect-blue text-connect-blue"
                  : "border-transparent text-portal-slate hover:text-portal-ink"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Localização & Mapa</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("contato")}
              className={`pb-2 px-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === "contato"
                  ? "border-connect-blue text-connect-blue"
                  : "border-transparent text-portal-slate hover:text-portal-ink"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Falar com o Corretor</span>
            </button>
          </div>

          {/* Conteúdo Aba 1: DETALHES, DESCRIÇÃO E DIFERENCIAIS */}
          {activeTab === "detalhes" && (
            <div className="mt-4 space-y-4 text-xs">
              {/* Descrição do Imóvel */}
              {property.descricao ? (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-portal-slate block">
                    Descrição do Empreendimento
                  </span>
                  <p className="text-portal-ink leading-relaxed text-xs sm:text-sm">
                    {property.descricao}
                  </p>
                </div>
              ) : (
                <p className="text-portal-slate text-xs italic">
                  Empreendimento de alto padrão com localização privilegiada e acabamento nobre.
                </p>
              )}

              {/* Diferenciais e Lazer */}
              {property.diferenciais && property.diferenciais.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-portal-line">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-portal-slate block">
                    Diferenciais & Áreas Comuns
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {property.diferenciais.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg bg-portal-mist/80 border border-portal-line text-[11px] font-semibold text-portal-ink"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações Rápidas na Aba de Detalhes */}
              <div className="pt-3 border-t border-portal-line flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("localizacao")}
                  className="h-11 px-3.5 rounded-xl border border-portal-line bg-portal-surface hover:bg-portal-mist text-portal-ink font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  title="Ver localização detalhada e mapa"
                >
                  <MapPin className="w-4 h-4 text-connect-blue" />
                  <span>Ver Mapa & Localização</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("contato")}
                  className="flex-1 h-11 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-connect-blue/20 transition-all hover:scale-[1.01]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar Visita</span>
                </button>
                <a
                  href={whatsAppDirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-11 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-green-600/20 transition-all hover:scale-[1.01]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}

          {/* Conteúdo Aba 2: LOCALIZAÇÃO & MAPA (CONSUMO DA API DE LOCALIZAÇÃO) */}
          {activeTab === "localizacao" && (
            <div className="mt-4">
              <PropertyLocationTab property={property} />
            </div>
          )}

          {/* Conteúdo Aba 3: FORMULÁRIO DE CONTATO COM CORRETOR */}
          {activeTab === "contato" && (
            <div className="mt-4">
              <PortalLeadContactForm
                propertyId={property.id}
                propertyNome={property.nome}
                whatsAppDirectUrl={whatsAppDirectUrl}
                onClose={onClose}
              />
            </div>
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
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
