"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DirectoryCity {
  cidade: string;
  estado: string;
  comprar: string[];
  alugar: string[];
}

interface PortalDirectoryProps {
  directoryCities: DirectoryCity[];
  directoryTab: "COMPRAR" | "ALUGAR";
  setDirectoryTab: (tab: "COMPRAR" | "ALUGAR") => void;
  directoryPage: number;
  setDirectoryPage: React.Dispatch<React.SetStateAction<number>>;
  onFilterClick: (cidade: string, modalidade: "VENDA" | "VERANEIO") => void;
}

export function PortalDirectory({
  directoryCities,
  directoryTab,
  setDirectoryTab,
  directoryPage,
  setDirectoryPage,
  onFilterClick,
}: PortalDirectoryProps) {
  return (
    <section id="diretorio" className="bg-[#0D1424] border-y border-[#1F2937] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header da Seção Idêntico ao Estilo RE/MAX */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            IMÓVEIS À VENDA E PARA ALUGAR
          </h2>
          <div className="w-14 h-1.5 bg-[#DC2626] rounded-full mt-2 mb-3" />
          <p className="text-xs sm:text-sm text-slate-400">
            Encontre o imóvel ideal nas principais cidades e regiões atendidas pela Connect Platz
          </p>
        </div>

        {/* Botões de Alternância (COMPRAR e ALUGAR) */}
        <div className="flex items-center gap-2 mb-10">
          <button
            onClick={() => setDirectoryTab("COMPRAR")}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              directoryTab === "COMPRAR"
                ? "bg-[#DC2626] text-white shadow-lg shadow-[#DC2626]/30"
                : "bg-white text-slate-800 hover:bg-slate-200"
            }`}
          >
            COMPRAR
          </button>
          <button
            onClick={() => setDirectoryTab("ALUGAR")}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              directoryTab === "ALUGAR"
                ? "bg-[#DC2626] text-white shadow-lg shadow-[#DC2626]/30"
                : "bg-white text-slate-800 hover:bg-slate-200"
            }`}
          >
            ALUGAR (VERANEIO)
          </button>
        </div>

        {/* Colunas por Cidade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {directoryCities.map((cityGroup, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-sm font-bold text-white tracking-tight">
                {cityGroup.cidade}
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                {(directoryTab === "COMPRAR" ? cityGroup.comprar : cityGroup.alugar).map(
                  (item, itemIdx) => (
                    <li key={itemIdx}>
                      <button
                        onClick={() =>
                          onFilterClick(
                            cityGroup.cidade.split(" ")[0],
                            directoryTab === "COMPRAR" ? "VENDA" : "VERANEIO"
                          )
                        }
                        className="hover:text-white hover:underline text-left transition-colors leading-relaxed"
                      >
                        {item}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Setas de Navegação / Paginação */}
        <div className="flex justify-end items-center gap-2 mt-10">
          <button
            onClick={() => setDirectoryPage((p) => Math.max(0, p - 1))}
            className="w-10 h-10 rounded-full border border-slate-600 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
            title="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDirectoryPage((p) => p + 1)}
            className="w-10 h-10 rounded-full border border-slate-600 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
            title="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
