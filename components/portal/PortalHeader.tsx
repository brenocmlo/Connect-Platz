"use client";

import React, { useState } from "react";
import { ChevronDown, Menu, MessageCircle, UserRound } from "lucide-react";
import type { DirectoryCity, NavigateFn } from "./types";
import { PortalLogo } from "./PortalUI";
import { PortalMobileMenu } from "./PortalMobileMenu";
import { PortalThemeToggle } from "./PortalThemeToggle";
import { ANCHOR_LINKS, cityLabel, scrollToId, waLink } from "./portalUtils";

interface PortalHeaderProps {
  cities: DirectoryCity[];
  onNavigate: NavigateFn;
}

function NavDropdown({
  label,
  modalidade,
  cities,
  onNavigate,
}: {
  label: string;
  modalidade: "VENDA" | "VERANEIO";
  cities: DirectoryCity[];
  onNavigate: NavigateFn;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onNavigate(modalidade)}
        className="flex h-[72px] items-center gap-1 px-3 text-sm font-medium text-white/90 transition-colors hover:text-white"
      >
        {label}
        <ChevronDown className="h-4 w-4 text-white/60 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
      </button>
      <div className="invisible absolute left-0 top-full w-60 translate-y-2 rounded-xl border border-portal-line bg-portal-surface p-2 opacity-0 shadow-2xl shadow-portal-navy/20 transition-all duration-200 ease-habitus group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        {cities.map((c) => (
          <button
            key={c.cidade}
            type="button"
            onClick={() => onNavigate(modalidade, cityLabel(c.cidade))}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-portal-ink transition-colors hover:bg-connect-blue hover:text-white"
          >
            {c.cidade}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onNavigate(modalidade)}
          className="mt-1 block w-full rounded-lg border-t border-portal-line px-3 py-2 text-left text-sm font-semibold text-connect-blue transition-colors hover:bg-connect-blue hover:text-white"
        >
          Ver todos os imóveis
        </button>
      </div>
    </div>
  );
}

export function PortalHeader({ cities, onNavigate }: PortalHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-portal-navy shadow-lg shadow-portal-navy-deep/20">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" aria-label="Connect Platz, página inicial">
          <PortalLogo />
        </a>

        <nav aria-label="Principal" className="hidden items-center lg:flex">
          <NavDropdown label="Comprar" modalidade="VENDA" cities={cities} onNavigate={onNavigate} />
          <NavDropdown label="Temporada" modalidade="VERANEIO" cities={cities} onNavigate={onNavigate} />
          {ANCHOR_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToId(link.id)}
              className="h-[72px] px-3 text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="/login"
            className="hidden items-center gap-2 rounded-lg border border-white/25 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:border-white/60 md:inline-flex"
          >
            <UserRound className="h-4 w-4" />
            Área do corretor
          </a>
          <a
            href={waLink("Olá! Gostaria de informações sobre imóveis com a Connect Platz.")}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] hover:bg-[#15803D] active:scale-[0.98] sm:inline-flex"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com corretor
          </a>
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
    </header>
  );
}
