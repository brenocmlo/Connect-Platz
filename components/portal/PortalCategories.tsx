"use client";

import React from "react";
import type { PortalFilters } from "./types";
import { CarouselArrow, PortalSectionTitle, Reveal } from "./PortalUI";
import { useScrollCarousel } from "./useScrollCarousel";

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=75`;

const CATEGORIES: {
  tag: string;
  titulo: string;
  foto: string;
  filtros: Partial<PortalFilters>;
}[] = [
  { tag: "Pé na areia", titulo: "Casas de praia", foto: photo("photo-1499793983690-e29da59ef1c2"), filtros: { modalidade: "VERANEIO", tipoImovel: "Beach" } },
  { tag: "Compactos", titulo: "Studios e apartamentos", foto: photo("photo-1502672260266-1c1ef2d93688"), filtros: { modalidade: "VENDA", tipoImovel: "Apartamento" } },
  { tag: "Família", titulo: "Três quartos ou mais", foto: photo("photo-1600585154340-be6161a56a0c"), filtros: { quartosMin: "3" } },
  { tag: "Exclusivos", titulo: "Coberturas", foto: photo("photo-1600607687939-ce8a6c25118c"), filtros: { tipoImovel: "Cobertura" } },
  { tag: "Condomínio", titulo: "Casas e villas", foto: photo("photo-1564013799919-ab600027ffc6"), filtros: { tipoImovel: "Casa" } },
  { tag: "Férias", titulo: "Temporada no litoral", foto: photo("photo-1560448204-e02f11c3d0e2"), filtros: { modalidade: "VERANEIO" } },
];

export function PortalCategories({ onPick }: { onPick: (filtros: Partial<PortalFilters>) => void }) {
  const carousel = useScrollCarousel();

  return (
    <section className="bg-portal-sand py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <PortalSectionTitle
            align="center"
            lead="Sua vida mudou de fase?"
            title="Encontre o imóvel certo para o próximo capítulo."
          />
        </Reveal>

        <Reveal delay={0.1} className="relative mt-10 sm:mt-12">
          <div
            ref={carousel.ref}
            className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-6 sm:mx-0 sm:scroll-px-0 sm:px-0"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.titulo}
                type="button"
                onClick={() => onPick(cat.filtros)}
                className="group w-[78%] shrink-0 snap-start overflow-hidden rounded-xl bg-portal-surface text-center shadow-md shadow-portal-navy/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-portal-navy/10 sm:w-[290px]"
              >
                <span className="relative block aspect-[7/6] overflow-hidden">
                  <img
                    src={cat.foto}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-0 left-4 translate-y-1/2 rounded-md bg-portal-navy px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {cat.tag}
                  </span>
                </span>
                <span className="block px-4 pb-6 pt-7">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-portal-slate/80">
                    Imóveis
                  </span>
                  <span className="mt-1 block text-sm font-bold uppercase text-portal-ink transition-colors group-hover:text-connect-blue">
                    {cat.titulo}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <CarouselArrow
            direction="prev"
            onClick={carousel.prev}
            disabled={!carousel.canPrev}
            className="absolute -left-5 top-[38%] hidden -translate-y-1/2 md:flex"
          />
          <CarouselArrow
            direction="next"
            onClick={carousel.next}
            disabled={!carousel.canNext}
            className="absolute -right-5 top-[38%] hidden -translate-y-1/2 md:flex"
          />
        </Reveal>
      </div>
    </section>
  );
}
