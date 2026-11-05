"use client";

import React, { useState } from "react";
import { ChevronDown, Menu, MessageCircle } from "lucide-react";
import type { DirectoryCity, NavigateFn } from "./types";
import { PortalLogo } from "./PortalUI";
import { PortalMobileMenu } from "./PortalMobileMenu";
import { PortalThemeToggle } from "./PortalThemeToggle";
import { ANCHOR_LINKS, cityLabel, scrollToId } from "./portalUtils";
import { useWaLink } from "./PortalSettingsContext";
import { PortalQuickLeadModal } from "./PortalQuickLeadModal";
import { PortalBairrosSelector } from "./PortalBairrosSelector";

interface PortalHeaderProps {
  cities: DirectoryCity[];
  comprarLocations?: string[];
  temporadaLocations?: string[];
  onNavigate: NavigateFn;
}

function NavDropdown({
  label,
  modalidade,
  locations,
  onNavigate,
}: {
  label: string;
  modalidade: "VENDA" | "VERANEIO";
  locations: string[];
  onNavigate: NavigateFn;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onNavigate(modalidade)}
        className="flex h-[72px] items-center gap-1.5 px-3 text-sm font-semibold text-white/90 transition-colors hover:text-white"
      >
        <span>{label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-white/60 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
      </button>
      <div className="invisible absolute left-0 top-full w-56 translate-y-2 rounded-2xl border border-white/10 bg-[#0B132B]/95 backdrop-blur-xl p-2 opacity-0 shadow-2xl shadow-black/40 transition-all duration-200 ease-habitus group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 z-50">
        <div className="space-y-0.5">
          {locations.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => onNavigate(modalidade, loc)}
              className="block w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-white/90 transition-all hover:bg-[#1266C7] hover:text-white"
            >
              {loc}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onNavigate(modalidade)}
          className="mt-1.5 block w-full rounded-xl border-t border-white/10 pt-2 px-3.5 py-2 text-left text-xs font-bold text-sky-400 transition-colors hover:bg-[#1266C7] hover:text-white"
        >
          Ver todos os imóveis
        </button>
      </div>
    </div>
  );
}

export function PortalHeader({
  cities,
  comprarLocations,
  temporadaLocations,
  onNavigate,
}: PortalHeaderProps) {
  const waLink = useWaLink();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const defaultComprar = ["Aquiraz", "Fortaleza"];
  const defaultTemporada = ["Aquiraz", "Fortaleza"];

  const finalComprar =
    comprarLocations && comprarLocations.length > 0 ? comprarLocations : defaultComprar;
  const finalTemporada =
    temporadaLocations && temporadaLocations.length > 0 ? temporadaLocations : defaultTemporada;

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-portal-navy shadow-lg shadow-portal-navy-deep/20">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" aria-label="Connect Platz, página inicial">
          <PortalLogo />
        </a>

        <nav aria-label="Principal" className="hidden items-center lg:flex">
          <NavDropdown label="Comprar" modalidade="VENDA" locations={finalComprar} onNavigate={onNavigate} />
          <NavDropdown label="Temporada" modalidade="VERANEIO" locations={finalTemporada} onNavigate={onNavigate} />
          {ANCHOR_LINKS.map((link) => {
            if (link.id === "diretorio") {
              return (
                <PortalBairrosSelector
                  key="bairros-selector"
                  cities={cities}
                  onNavigate={onNavigate}
                />
              );
            }
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToId(link.id)}
                className="h-[72px] px-3 text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {waLink && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="hidden items-center gap-2 rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] hover:bg-[#15803D] active:scale-[0.98] sm:inline-flex cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com corretor
          </button>
          )}
          <PortalThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/30 text-white transition-colors hover:border-white/70 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <PortalMobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        cities={cities}
        onNavigate={onNavigate}
      />

      <PortalQuickLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Falar com Especialista Connect Platz"
        subtitle="Informe seu nome e WhatsApp para ser atendido pelo corretor credenciado de plantão."
        defaultMessage="Olá! Gostaria de informações sobre imóveis com a Connect Platz."
        contextSource="header_nav_cta"
      />
    </header>
  );
}
