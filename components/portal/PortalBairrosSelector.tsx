"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, MapPin, Building2, Search } from "lucide-react";
import type { DirectoryCity, NavigateFn } from "./types";
import { scrollToId } from "./portalUtils";

interface PortalBairrosSelectorProps {
  cities: DirectoryCity[];
  onNavigate: NavigateFn;
  onOpenAllBairros?: () => void;
}

interface FlattenedBairro {
  nome: string;
  cidade: string;
  total: number;
  modalidades: string[];
}

export function PortalBairrosSelector({ cities, onNavigate, onOpenAllBairros }: PortalBairrosSelectorProps) {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const allCities = useMemo(() => {
    return cities.map((c) => c.cidade).filter(Boolean).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [cities]);

  const allBairros = useMemo<FlattenedBairro[]>(() => {
    const list: FlattenedBairro[] = [];
    for (const city of cities) {
      if (!city.bairros) continue;
      for (const b of city.bairros) {
        list.push({
          nome: b.nome,
          cidade: city.cidade,
          total: b.total,
          modalidades: b.modalidades,
        });
      }
    }
    return list.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [cities]);

  const filteredBairros = useMemo(() => {
    return allBairros.filter((b) => {
      const matchCity = !selectedCity || b.cidade.toLowerCase() === selectedCity.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        b.nome.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        b.cidade.toLowerCase().includes(searchTerm.toLowerCase().trim());
      return matchCity && matchSearch;
    });
  }, [allBairros, selectedCity, searchTerm]);

  const handleSelectBairro = (bairroNome: string) => {
    onNavigate("VENDA", bairroNome);
  };

  const handleSelectCityOnly = (cidadeNome: string) => {
    onNavigate("VENDA", cidadeNome);
  };

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label="Abrir seletor de bairros"
        className="flex h-[72px] items-center gap-1.5 px-3 text-sm font-semibold text-white/90 transition-colors hover:text-white"
      >
        <MapPin className="h-4 w-4 text-platz-gold shrink-0" />
        <span>Bairros</span>
        {allBairros.length > 0 && (
          <span className="rounded-full bg-connect-blue/30 px-1.5 py-0.2 text-[10px] font-bold text-sky-300">
            {allBairros.length}
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-white/60 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
      </button>

      <div className="invisible absolute left-0 top-full w-80 translate-y-2 rounded-2xl border border-white/10 bg-[#0B132B]/95 p-3.5 opacity-0 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-200 ease-habitus group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 z-50">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-platz-gold">
            <Building2 className="h-3.5 w-3.5" /> Bairros com Imóveis
          </span>
          <span className="text-[11px] text-white/50">{allBairros.length} cadastrados</span>
        </div>

        <div className="mt-3 space-y-2">
          {/* Seletor de Cidade */}
          <div>
            <label htmlFor="bairros-city-filter" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-white/60">
              Cidade:
            </label>
            <div className="relative">
              <select
                id="bairros-city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/15 bg-white/5 px-3 py-2 pr-8 text-xs font-medium text-white transition-colors hover:border-white/30 focus:border-connect-blue focus:bg-[#0B132B] focus:outline-none"
              >
                <option value="" className="bg-[#0B132B] text-white">
                  Todas as cidades ({allCities.length})
                </option>
                {allCities.map((cid) => (
                  <option key={cid} value={cid} className="bg-[#0B132B] text-white">
                    {cid}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/60" />
            </div>
          </div>

          {/* Busca rápida de Bairro */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar bairro..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white placeholder-white/40 transition-colors focus:border-connect-blue focus:outline-none"
            />
          </div>
        </div>

        {/* Lista de Bairros (máx 20 exibidos) */}
        <div className="no-scrollbar mt-3 max-h-56 overflow-y-auto space-y-1 pr-0.5">
          {filteredBairros.length === 0 ? (
            <div className="py-6 text-center text-xs text-white/50">
              Nenhum bairro cadastrado {selectedCity ? `em ${selectedCity}` : ""}.
            </div>
          ) : (
            filteredBairros.slice(0, 20).map((b) => (
              <button
                key={`${b.cidade}-${b.nome}`}
                type="button"
                onClick={() => handleSelectBairro(b.nome)}
                className="group/bairro flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-medium text-white/90 transition-all hover:bg-connect-blue hover:text-white"
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="h-3 w-3 text-sky-400 shrink-0 group-hover/bairro:text-white" />
                  <span className="truncate">{b.nome}</span>
                </div>
                <div className="ml-2 flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-white/50 group-hover/bairro:text-white/80">
                    {b.cidade}
                  </span>
                  <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-bold text-white/80 group-hover/bairro:bg-white/20">
                    {b.total}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Ações Rápidas no Rodapé */}
        <div className="mt-2.5 border-t border-white/10 pt-2 px-1 space-y-1.5 text-[11px]">
          {onOpenAllBairros && (
            <button
              type="button"
              onClick={onOpenAllBairros}
              className="flex w-full items-center justify-between font-bold text-platz-gold transition-colors hover:text-white"
            >
              <span>Ver todos os {allBairros.length} bairros</span>
              <span>→</span>
            </button>
          )}
          <div className="flex items-center justify-between">
            {selectedCity ? (
              <button
                type="button"
                onClick={() => handleSelectCityOnly(selectedCity)}
                className="font-bold text-sky-400 transition-colors hover:text-white hover:underline"
              >
                Ver todos em {selectedCity}
              </button>
            ) : <span />}
            <button
              type="button"
              onClick={() => scrollToId("diretorio")}
              className="font-medium text-white/60 transition-colors hover:text-platz-gold"
            >
              Guia completo ↓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}