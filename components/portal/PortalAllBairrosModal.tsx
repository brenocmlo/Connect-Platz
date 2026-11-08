"use client";

import React, { useMemo, useState } from "react";
import { X, Search, MapPin, Building2, ChevronRight, SlidersHorizontal } from "lucide-react";
import type { DirectoryCity, Modalidade, NavigateFn } from "./types";

interface PortalAllBairrosModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: DirectoryCity[];
  onNavigate: NavigateFn;
  defaultModalidade?: Modalidade;
}

interface FlattenedBairro {
  nome: string;
  cidade: string;
  total: number;
  modalidades: string[];
}

export function PortalAllBairrosModal({
  isOpen,
  onClose,
  cities,
  onNavigate,
  defaultModalidade = "VENDA",
}: PortalAllBairrosModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("TODAS");
  const [activeModalidade, setActiveModalidade] = useState<Modalidade>(defaultModalidade);

  const allCitiesList = useMemo(() => {
    return Array.from(new Set(cities.map((c) => c.cidade).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
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
    return list.sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, "pt-BR"));
  }, [cities]);

  const filteredBairros = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allBairros.filter((b) => {
      const matchCity = selectedCity === "TODAS" || b.cidade.toLowerCase() === selectedCity.toLowerCase();
      const matchSearch =
        !term || b.nome.toLowerCase().includes(term) || b.cidade.toLowerCase().includes(term);
      return matchCity && matchSearch;
    });
  }, [allBairros, selectedCity, searchTerm]);

  if (!isOpen) return null;

  const handleSelect = (bairroNome: string) => {
    onNavigate(activeModalidade, bairroNome);
    onClose();
  };

  const handleSelectCityAll = (cidadeNome: string) => {
    onNavigate(activeModalidade, cidadeNome === "TODAS" ? undefined : cidadeNome);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="all-bairros-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl border border-white/10 bg-[#0B132B]/95 text-white shadow-2xl shadow-black/60 backdrop-blur-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-connect-blue/20 text-sky-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 id="all-bairros-title" className="text-base sm:text-lg font-bold text-white">
                Todos os Bairros & Regiões
              </h2>
              <p className="text-xs text-white/60">
                {allBairros.length} bairros mapeados com imóveis em carteira
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="space-y-3 border-b border-white/10 p-4 sm:px-5">
          {/* Campo de Busca Rápida com Digitação */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome do bairro ou cidade para filtrar..."
              autoFocus
              className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-9 text-sm text-white placeholder-white/40 transition-colors focus:border-connect-blue focus:bg-[#0B132B] focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Chips de Cidades */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedCity("TODAS")}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                selectedCity === "TODAS"
                  ? "bg-connect-blue text-white shadow-md shadow-connect-blue/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Todas as Cidades ({allCitiesList.length})
            </button>
            {allCitiesList.map((cid) => (
              <button
                key={cid}
                type="button"
                onClick={() => setSelectedCity(cid)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  selectedCity === cid
                    ? "bg-connect-blue text-white shadow-md shadow-connect-blue/30"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cid}
              </button>
            ))}
          </div>
        </div>

        {/* Grade de Bairros */}
        <div className="flex-1 overflow-y-auto p-4 sm:px-5">
          {filteredBairros.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-white/50">
              <MapPin className="mb-2 h-8 w-8 text-white/20" />
              <p className="text-sm font-semibold">Nenhum bairro encontrado</p>
              <p className="text-xs text-white/40">
                Tente buscar por outro termo ou selecione &quot;Todas as Cidades&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {filteredBairros.map((b) => (
                <button
                  key={`${b.cidade}-${b.nome}`}
                  type="button"
                  onClick={() => handleSelect(b.nome)}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-all duration-200 hover:border-connect-blue/50 hover:bg-connect-blue hover:text-white hover:shadow-lg hover:shadow-connect-blue/20"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sky-400 group-hover:bg-white/20 group-hover:text-white">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="block truncate text-xs font-bold text-white group-hover:text-white">
                        {b.nome}
                      </span>
                      <span className="block text-[10px] text-white/50 group-hover:text-white/80">
                        {b.cidade}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/80 group-hover:bg-white/20">
                    {b.total} {b.total === 1 ? "imóvel" : "imóveis"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-xs text-white/60">
          <span>
            Mostrando <strong>{filteredBairros.length}</strong> de {allBairros.length} bairros
          </span>
          {selectedCity !== "TODAS" && (
            <button
              type="button"
              onClick={() => handleSelectCityAll(selectedCity)}
              className="flex items-center gap-1 font-bold text-sky-400 transition-colors hover:text-white hover:underline"
            >
              <span>Ver todos os imóveis em {selectedCity}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
