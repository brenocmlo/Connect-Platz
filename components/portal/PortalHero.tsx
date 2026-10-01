"use client";

import React from "react";
import { Search, Building2, Waves, MapPin } from "lucide-react";

interface PortalHeroProps {
  modalidadeFiltro: "TODOS" | "VENDA" | "VERANEIO";
  setModalidadeFiltro: (mod: "TODOS" | "VENDA" | "VERANEIO") => void;
  localizacao: string;
  setLocalizacao: (loc: string) => void;
  tipoImovel: string;
  setTipoImovel: (t: string) => void;
  quartosMin: string;
  setQuartosMin: (q: string) => void;
  totalEncontrados: number;
}

export function PortalHero({
  modalidadeFiltro,
  setModalidadeFiltro,
  localizacao,
  setLocalizacao,
  tipoImovel,
  setTipoImovel,
  quartosMin,
  setQuartosMin,
  totalEncontrados,
}: PortalHeroProps) {
  return (
    <section className="relative pt-12 pb-16 px-6 bg-gradient-to-b from-[#0D131F] via-[#0A0E17] to-[#080C14]">
      <div className="max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-connect-blue/15 border border-connect-blue/30 text-blue-400 text-xs font-bold">
          <span>Imóveis de Alto Padrão & Temporada no Ceará</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
          Encontre seu próximo imóvel com a <span className="text-connect-blue">Connect</span>{" "}
          <span className="text-[#D9BB4C]">Platz</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Venda, locação de temporada no litoral e assessoria de crédito imobiliário completa em Fortaleza e Aquiraz.
        </p>

        {/* BARRA DE PESQUISA & FILTROS */}
        <div className="max-w-4xl mx-auto pt-6 text-left">
          <div className="bg-[#111827] border border-[#1F2937] p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4">
            {/* Seletor Venda vs Temporada */}
            <div className="flex items-center gap-2 border-b border-[#1F2937] pb-4">
              <button
                onClick={() => setModalidadeFiltro("VENDA")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  modalidadeFiltro === "VENDA"
                    ? "bg-[#1266C7] text-white shadow-md shadow-connect-blue/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Comprar Imóvel
              </button>
              <button
                onClick={() => setModalidadeFiltro("VERANEIO")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  modalidadeFiltro === "VERANEIO"
                    ? "bg-[#D9BB4C] text-black shadow-md shadow-[#D9BB4C]/30"
                    : "text-[#F8DA56] hover:text-white"
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                Aluguel de Veraneio (Temporada)
              </button>
            </div>

            {/* Inputs de Filtro */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Localização Desejada
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    placeholder="Bairro, praia ou cidade (ex: Meireles, Porto das Dunas)"
                    className="w-full bg-[#080C14] border border-[#1F2937] focus:border-connect-blue rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tipo de Imóvel
                </label>
                <select
                  value={tipoImovel}
                  onChange={(e) => setTipoImovel(e.target.value)}
                  className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl px-3 py-2.5 text-white focus:outline-none"
                >
                  <option value="TODOS">Todos os Tipos</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Casa">Casa / Villa</option>
                  <option value="Cobertura">Cobertura</option>
                  <option value="Beach">Casa de Praia</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Quartos
                </label>
                <select
                  value={quartosMin}
                  onChange={(e) => setQuartosMin(e.target.value)}
                  className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl px-3 py-2.5 text-white focus:outline-none"
                >
                  <option value="TODOS">Qualquer qtd</option>
                  <option value="2">2+ Quartos</option>
                  <option value="3">3+ Quartos</option>
                  <option value="4">4+ Quartos</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1F2937] flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Mostrando <strong className="text-white">{totalEncontrados}</strong> imóveis encontrados
              </span>
              <a
                href="#vitrine"
                className="bg-[#1266C7] hover:bg-[#0D478F] text-white text-xs font-extrabold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-connect-blue/30 transition-all"
              >
                <Search className="w-4 h-4" />
                Buscar Imóveis
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
