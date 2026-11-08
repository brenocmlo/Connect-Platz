"use client";

import React, { useMemo, useState } from "react";
import { Menu, MessageCircle } from "lucide-react";
import type { DirectoryCity, Modalidade, NavigateFn } from "./types";
import { PortalLogo } from "./PortalUI";
import { PortalMobileMenu } from "./PortalMobileMenu";
import { PortalThemeToggle } from "./PortalThemeToggle";
import { ANCHOR_LINKS, scrollToId } from "./portalUtils";
import { useWaLink } from "./PortalSettingsContext";
import { PortalQuickLeadModal } from "./PortalQuickLeadModal";
import { PortalBairrosSelector } from "./PortalBairrosSelector";
import { PortalNavBairrosDropdown } from "./PortalNavBairrosDropdown";
import { PortalAllBairrosModal } from "./PortalAllBairrosModal";

interface PortalHeaderProps {
  cities: DirectoryCity[];
  comprarLocations?: string[];
  alugarLocations?: string[];
  temporadaLocations?: string[];
  repasseLocations?: string[];
  onNavigate: NavigateFn;
}

export function PortalHeader({
  cities,
  comprarLocations,
  alugarLocations,
  temporadaLocations,
  repasseLocations,
  onNavigate,
}: PortalHeaderProps) {
  const waLink = useWaLink();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [allBairrosModalOpen, setAllBairrosModalOpen] = useState(false);
  const [allBairrosModalidade, setAllBairrosModalidade] = useState<Modalidade>("VENDA");

  const openAllBairros = (mod: Modalidade = "VENDA") => {
    setAllBairrosModalidade(mod);
    setAllBairrosModalOpen(true);
  };

  const cityByBairro = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of cities) {
      for (const b of c.bairros || []) {
        map.set(b.nome.toLowerCase(), c.cidade.split(" (")[0]);
      }
    }
    return map;
  }, [cities]);

  const fallbackBairros = useMemo(() => {
    const fromDirectory = cities.flatMap((c) => (c.bairros || []).map((b) => b.nome)).filter(Boolean);
    if (fromDirectory.length > 0) {
      return Array.from(new Set(fromDirectory)).sort((a, b) => a.localeCompare(b, "pt-BR"));
    }
    return ["Porto das Dunas", "Meireles", "Aldeota", "Cocó", "Cumbuco"];
  }, [cities]);

  const finalComprar =
    comprarLocations && comprarLocations.length > 0 ? comprarLocations : fallbackBairros;
  const finalAlugar =
    alugarLocations && alugarLocations.length > 0 ? alugarLocations : fallbackBairros;
  const finalTemporada =
    temporadaLocations && temporadaLocations.length > 0 ? temporadaLocations : fallbackBairros;
  const finalRepasse =
    repasseLocations && repasseLocations.length > 0 ? repasseLocations : fallbackBairros;

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-portal-navy shadow-lg shadow-portal-navy-deep/20">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" aria-label="Connect Platz, página inicial">
          <PortalLogo />
        </a>

        <nav aria-label="Principal" className="hidden items-center lg:flex">
          <PortalNavBairrosDropdown
            label="Comprar"
            modalidade="VENDA"
            locations={finalComprar}
            cityByBairro={cityByBairro}
            onNavigate={onNavigate}
            onOpenAllBairros={() => openAllBairros("VENDA")}
          />
          <PortalNavBairrosDropdown
            label="Alugar"
            modalidade="ALUGUEL"
            locations={finalAlugar}
            cityByBairro={cityByBairro}
            onNavigate={onNavigate}
            onOpenAllBairros={() => openAllBairros("ALUGUEL")}
          />
          <PortalNavBairrosDropdown
            label="Temporada"
            modalidade="VERANEIO"
            locations={finalTemporada}
            cityByBairro={cityByBairro}
            onNavigate={onNavigate}
            onOpenAllBairros={() => openAllBairros("VERANEIO")}
          />
          <PortalNavBairrosDropdown
            label="Repasses"
            modalidade="REPASSE"
            locations={finalRepasse}
            cityByBairro={cityByBairro}
            onNavigate={onNavigate}
            onOpenAllBairros={() => openAllBairros("REPASSE")}
          />
          {ANCHOR_LINKS.map((link) => {
            if (link.id === "diretorio") {
              return (
                <PortalBairrosSelector
                  key="bairros-selector"
                  cities={cities}
                  onNavigate={onNavigate}
                  onOpenAllBairros={() => openAllBairros("VENDA")}
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
        comprarLocations={finalComprar}
        alugarLocations={finalAlugar}
        temporadaLocations={finalTemporada}
        repasseLocations={finalRepasse}
        onNavigate={onNavigate}
        onOpenAllBairros={openAllBairros}
      />

      <PortalQuickLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Falar com Especialista Connect Platz"
        subtitle="Informe seu nome e WhatsApp para ser atendido pelo corretor credenciado de plantão."
        defaultMessage="Olá! Gostaria de informações sobre imóveis com a Connect Platz."
        contextSource="header_nav_cta"
      />

      <PortalAllBairrosModal
        isOpen={allBairrosModalOpen}
        onClose={() => setAllBairrosModalOpen(false)}
        cities={cities}
        onNavigate={onNavigate}
        defaultModalidade={allBairrosModalidade}
      />
    </header>
  );
}
