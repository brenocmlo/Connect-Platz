"use client";

import React, { useState } from "react";
import { MapPin } from "lucide-react";
import type { DirectoryCity } from "./types";
import { CarouselArrow, PortalSectionTitle, Reveal } from "./PortalUI";
import { useScrollCarousel } from "./useScrollCarousel";

export type { DirectoryCity } from "./types";

type DirectoryTab = "COMPRAR" | "TEMPORADA";

interface PortalDirectoryProps {
  directoryCities: DirectoryCity[];
  onFilterClick: (cidade: string, modalidade: "VENDA" | "VERANEIO", item: string) => void;
}

const TABS: { id: DirectoryTab; label: string }[] = [
  { id: "COMPRAR", label: "Comprar" },
  { id: "TEMPORADA", label: "Temporada" },
];

export function PortalDirectory({ directoryCities, onFilterClick }: PortalDirectoryProps) {
  const [tab, setTab] = useState<DirectoryTab>("COMPRAR");
  const carousel = useScrollCarousel();

  if (directoryCities.length === 0) return null;

  return (
    <section id="diretorio" className="scroll-mt-[72px] bg-portal-sand py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <PortalSectionTitle
            title="IMÓVEIS À VENDA E PARA TEMPORADA"
            subtitle="Encontre o imóvel ideal nas cidades com imóveis publicados pela Connect Platz."
          />
        </Reveal>

        <div role="tablist" aria-label="Tipo de negócio" className="mt-8 inline-flex rounded-full bg-portal-surface p-1 shadow-md shadow-portal-navy/10">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                  active ? "bg-connect-blue text-white shadow-md shadow-connect-blue/30" : "text-portal-ink hover:text-connect-blue"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div
          ref={carousel.ref}
          className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-px-4 px-4 sm:mx-0 sm:scroll-px-0 sm:px-0"
        >
          {directoryCities
            .filter((city) => (tab === "COMPRAR" ? city.comprar : city.alugar).length > 0)
            .map((city) => {
            const items = tab === "COMPRAR" ? city.comprar : city.alugar;
            const activeModalidade = tab === "COMPRAR" ? "VENDA" : "VERANEIO_TEMPORADA";
            const relevantBairros = (city.bairros || []).filter(
              (b) => b.modalidades.includes(activeModalidade) || b.modalidades.includes("AMBOS")
            );
            return (
              <div key={city.cidade} className="w-[260px] shrink-0 snap-start">
                <h3 className="text-base font-bold text-portal-ink">{city.cidade}</h3>
                <ul className="mt-4 space-y-3">
                  {items.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() =>
                          onFilterClick(city.cidade, tab === "COMPRAR" ? "VENDA" : "VERANEIO", item)
                        }
                        className="text-left text-sm leading-relaxed text-portal-slate transition-colors hover:text-connect-blue hover:underline"
                      >
                        {tab === "TEMPORADA" ? item.replace(/para alugar/i, "para temporada") : item}
                      </button>
                    </li>
                  ))}
                </ul>

                {relevantBairros.length > 0 && (
                  <div className="mt-5 border-t border-portal-line/60 pt-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-portal-slate">
                      <MapPin className="h-3 w-3 text-connect-blue" /> Bairros ({relevantBairros.length})
                    </span>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {relevantBairros.map((bairro) => (
                        <button
                          key={bairro.nome}
                          type="button"
                          onClick={() =>
                            onFilterClick(bairro.nome, tab === "COMPRAR" ? "VENDA" : "VERANEIO", bairro.nome)
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-portal-field bg-portal-surface px-2.5 py-1 text-xs font-medium text-portal-ink shadow-sm transition-all hover:border-connect-blue hover:bg-connect-blue hover:text-white"
                        >
                          <span>{bairro.nome}</span>
                          <span className="text-[10px] opacity-60">({bairro.total})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center gap-3 sm:justify-end">
          <CarouselArrow direction="prev" onClick={carousel.prev} disabled={!carousel.canPrev} />
          <CarouselArrow direction="next" onClick={carousel.next} disabled={!carousel.canNext} />
        </div>
      </div>
    </section>
  );
}
