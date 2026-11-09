"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, MapPin, Search, ArrowRight, Building2 } from "lucide-react";
import type { Modalidade, NavigateFn } from "./types";

interface PortalNavBairrosDropdownProps {
  label: string;
  modalidade: Modalidade;
  locations: string[];
  cityByBairro: Map<string, string>;
  onNavigate: NavigateFn;
  onOpenAllBairros: () => void;
}

const MAX_DISPLAY_ITEMS = 20;

export function PortalNavBairrosDropdown({
  label,
  modalidade,
  locations,
  cityByBairro,
  onNavigate,
  onOpenAllBairros,
}: PortalNavBairrosDropdownProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLocations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return locations;
    return locations.filter((loc) => {
      const matchLoc = loc.toLowerCase().includes(term);
      const matchCity = cityByBairro.get(loc.toLowerCase())?.toLowerCase().includes(term);
      return matchLoc || matchCity;
    });
  }, [locations, searchTerm, cityByBairro]);

  const displayedLocations = useMemo(() => {
    return filteredLocations.slice(0, MAX_DISPLAY_ITEMS);
  }, [filteredLocations]);

  const hasMoreThanLimit = filteredLocations.length > MAX_DISPLAY_ITEMS;

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

      <div className="invisible absolute left-0 top-full w-80 translate-y-2 rounded-2xl border border-white/10 bg-[#0B132B]/95 p-3 opacity-0 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-200 ease-habitus group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 z-50">
        {/* Topo do Dropdown */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2 px-1">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-platz-gold">
            <Building2 className="h-3.5 w-3.5" /> Bairros ({locations.length})
          </span>
          <span className="text-[10px] text-white/50">
            {searchTerm
              ? `${filteredLocations.length} encontrados`
              : `Top ${Math.min(locations.length, MAX_DISPLAY_ITEMS)}`}
          </span>
        </div>

        {/* Menu de Digitação / Busca Rápida */}
        <div className="mt-2.5 relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite para buscar bairro..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white placeholder-white/40 transition-colors focus:border-connect-blue focus:bg-[#0B132B] focus:outline-none"
          />
        </div>

        {/* Lista de Bairros (máx 20 exibidos) */}
        <div className="no-scrollbar mt-2 max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
          {displayedLocations.length === 0 ? (
            <div className="py-5 text-center text-xs text-white/50">
              Nenhum bairro encontrado para &quot;{searchTerm}&quot;.
            </div>
          ) : (
            displayedLocations.map((loc) => {
              const cidade = cityByBairro.get(loc.toLowerCase());
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => onNavigate(modalidade, loc)}
                  className="group/bairro flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-white/90 transition-all hover:bg-connect-blue hover:text-white"
                >
                  <span className="flex items-center gap-2 truncate">
                    <MapPin className="h-3 w-3 text-platz-gold shrink-0 group-hover/bairro:text-white" />
                    <span className="truncate">{loc}</span>
                  </span>
                  {cidade && (
                    <span className="text-[10px] font-semibold text-white/50 shrink-0 group-hover/bairro:text-white/80">
                      {cidade}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Ações do Rodapé: Ver todos os bairros e Ver todos os imóveis */}
        <div className="mt-2 border-t border-white/10 pt-2 space-y-1">
          <button
            type="button"
            onClick={onOpenAllBairros}
            className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-bold text-platz-gold transition-colors hover:bg-white/5"
          >
            <span>Ver todos os {locations.length} bairros</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate(modalidade)}
            className="block w-full rounded-xl px-2.5 py-1 text-left text-[11px] font-semibold text-sky-400 transition-colors hover:text-white hover:underline"
          >
            Ver todos os imóveis em {label}
          </button>
        </div>
      </div>
    </div>
  );
}
