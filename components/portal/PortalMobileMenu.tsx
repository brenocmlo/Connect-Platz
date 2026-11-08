"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MapPin, MessageCircle, UserRound, X } from "lucide-react";
import type { DirectoryCity, NavigateFn } from "./types";
import { PortalLogo } from "./PortalUI";
import { ANCHOR_LINKS, cityLabel, scrollToId } from "./portalUtils";
import { useWaLink } from "./PortalSettingsContext";

interface PortalMobileMenuProps {
  open: boolean;
  onClose: () => void;
  cities: DirectoryCity[];
  comprarLocations?: string[];
  alugarLocations?: string[];
  temporadaLocations?: string[];
  repasseLocations?: string[];
  onNavigate: NavigateFn;
}

const GROUPS = [
  { label: "Comprar", modalidade: "VENDA" as const },
  { label: "Alugar", modalidade: "ALUGUEL" as const },
  { label: "Temporada", modalidade: "VERANEIO" as const },
  { label: "Repasses", modalidade: "REPASSE" as const },
];

export function PortalMobileMenu({
  open,
  onClose,
  cities,
  comprarLocations = [],
  alugarLocations = [],
  temporadaLocations = [],
  repasseLocations = [],
  onNavigate,
}: PortalMobileMenuProps) {
  const waLink = useWaLink();
  const [expanded, setExpanded] = useState<string | null>("Comprar");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const go = (fn: () => void) => {
    onClose();
    // Aguarda o drawer fechar para o scroll suave não brigar com o overflow travado.
    setTimeout(fn, 220);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col bg-portal-navy text-white lg:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-4">
              <PortalLogo subtitle={false} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar menu"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/25"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Menu mobile" className="flex-1 overflow-y-auto px-4 py-4">
              {GROUPS.map((group) => {
                const isOpen = expanded === group.label;
                const groupLocations =
                  group.modalidade === "VENDA"
                    ? comprarLocations
                    : group.modalidade === "ALUGUEL"
                    ? alugarLocations
                    : group.modalidade === "VERANEIO"
                    ? temporadaLocations
                    : repasseLocations;
                return (
                  <div key={group.label} className="border-b border-white/10">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : group.label)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between py-4 text-base font-semibold"
                    >
                      {group.label}
                      <ChevronDown className={`h-5 w-5 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="grid gap-1 pb-4">
                        {groupLocations.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => go(() => onNavigate(group.modalidade, loc))}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-white/80 active:bg-white/10"
                          >
                            <MapPin className="h-3.5 w-3.5 text-platz-gold shrink-0" />
                            <span>{loc}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => go(() => onNavigate(group.modalidade))}
                          className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-platz-gold active:bg-white/10"
                        >
                          Ver todos os imóveis
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {ANCHOR_LINKS.map((link) => {
                if (link.id === "diretorio") {
                  const isOpen = expanded === "Bairros";
                  return (
                    <div key={link.id} className="border-b border-white/10">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : "Bairros")}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between py-4 text-base font-semibold"
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-platz-gold" />
                          <span>Bairros por Cidade</span>
                        </span>
                        <ChevronDown className={`h-5 w-5 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="space-y-4 pb-4">
                          {cities.map((c) => (
                            <div key={c.cidade} className="rounded-xl border border-white/10 bg-white/5 p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-platz-gold">
                                  {c.cidade}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => go(() => onNavigate("VENDA", c.cidade))}
                                  className="text-[11px] text-sky-400 hover:underline"
                                >
                                  Ver todos
                                </button>
                              </div>
                              {c.bairros && c.bairros.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {c.bairros.map((b) => (
                                    <button
                                      key={b.nome}
                                      type="button"
                                      onClick={() => go(() => onNavigate("VENDA", b.nome))}
                                      className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/90 active:bg-connect-blue"
                                    >
                                      {b.nome} ({b.total})
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-1 text-[11px] text-white/40">Nenhum bairro com imóveis no momento.</p>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => go(() => scrollToId("diretorio"))}
                            className="block w-full text-center text-xs font-semibold text-platz-gold py-1"
                          >
                            Ir para o Diretório Completo ↓
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => go(() => scrollToId(link.id))}
                    className="block w-full border-b border-white/10 py-4 text-left text-base font-semibold"
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {waLink && (
            <div className="grid gap-2 border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <a
                href={waLink("Olá! Gostaria de informações sobre imóveis com a Connect Platz.")}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#16A34A] text-sm font-bold"
              >
                <MessageCircle className="h-4 w-4" />
                Falar com corretor
              </a>
            </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
