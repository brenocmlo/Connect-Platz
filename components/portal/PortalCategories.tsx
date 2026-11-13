"use client";

import React, { useEffect, useMemo } from "react";
import type { PortalFilters, PropertyItem } from "./types";
import { CarouselArrow, PortalSectionTitle, Reveal } from "./PortalUI";
import { useScrollCarousel } from "./useScrollCarousel";
import { usePortalSettingsState } from "./PortalSettingsContext";
import {
  DEFAULT_VITRINE_SUBTITULO,
  DEFAULT_VITRINE_TITULO,
  resolveVitrineShowcaseCards,
} from "@/lib/domain/portal/vitrineShowcase";

interface PortalCategoriesProps {
  properties?: PropertyItem[];
  loading?: boolean;
  onSelectProperty?: (property: PropertyItem) => void;
  onPick: (filtros: Partial<PortalFilters>) => void;
}

export function PortalCategories({
  properties = [],
  loading = false,
  onSelectProperty,
  onPick,
}: PortalCategoriesProps) {
  const carousel = useScrollCarousel();
  const { settings, loaded: settingsLoaded } = usePortalSettingsState();
  const isWaiting = loading || !settingsLoaded;

  const lead = settings.vitrineSubtitulo || DEFAULT_VITRINE_SUBTITULO;
  const title = settings.vitrineTitulo || DEFAULT_VITRINE_TITULO;

  const cards = useMemo(
    () => resolveVitrineShowcaseCards(settings.vitrineCards, properties),
    [settings.vitrineCards, properties]
  );

  useEffect(() => {
    carousel.update();
  }, [cards, isWaiting, carousel.node]); // eslint-disable-line react-hooks/exhaustive-deps

  const centerDesktop = !isWaiting && cards.length <= 3 ? "lg:justify-center" : "";

  return (
    <section
      aria-roledescription="carousel"
      aria-label={title}
      className="bg-portal-sand py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <PortalSectionTitle align="center" lead={lead} title={title} />
        </Reveal>

        <Reveal delay={0.1} className="relative mt-10 sm:mt-12">
          {isWaiting ? (
            <div className="no-scrollbar -mx-4 flex gap-5 overflow-hidden px-4 pb-6 sm:mx-0 sm:px-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[78%] shrink-0 overflow-hidden rounded-xl bg-portal-surface shadow-md shadow-portal-navy/5 sm:w-[290px]"
                >
                  <div className="aspect-[7/6] animate-pulse bg-portal-line" />
                  <div className="space-y-2 px-4 pb-6 pt-7">
                    <div className="mx-auto h-3 w-16 animate-pulse rounded bg-portal-line" />
                    <div className="mx-auto h-4 w-40 animate-pulse rounded bg-portal-line" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={carousel.ref}
              className={`no-scrollbar -mx-4 flex touch-pan-x snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-6 sm:mx-0 sm:scroll-px-0 sm:px-0 ${centerDesktop}`}
            >
              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} de ${cards.length}: ${card.titulo}`}
                  className="w-[78%] shrink-0 snap-start sm:w-[290px]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (card.linkedProperty && onSelectProperty) {
                        onSelectProperty(card.linkedProperty);
                        return;
                      }
                      onPick(card.filtros || {});
                    }}
                    className="group block h-full w-full overflow-hidden rounded-xl bg-portal-surface text-center shadow-md shadow-portal-navy/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-portal-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue"
                  >
                    {/* overflow-hidden isolado no container interno da foto para nunca cortar a tag pill translate-y-1/2 */}
                    <span className="relative block aspect-[7/6]">
                      <span className="block h-full w-full overflow-hidden rounded-t-xl bg-portal-sand">
                        <img
                          src={card.foto}
                          alt={card.titulo}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </span>
                      <span className="absolute bottom-0 left-4 z-10 max-w-[calc(100%-2rem)] translate-y-1/2 truncate rounded-md bg-portal-navy px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                        {card.tag}
                      </span>
                    </span>
                    <span className="block px-4 pb-6 pt-7">
                      <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-portal-slate/80">
                        {card.eyebrow}
                      </span>
                      <span className="mt-1 block truncate text-sm font-bold uppercase text-portal-ink transition-colors group-hover:text-connect-blue">
                        {card.titulo}
                      </span>
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {!isWaiting && (
            <>
              <CarouselArrow
                direction="prev"
                onClick={carousel.prev}
                disabled={!carousel.canPrev}
                className="absolute -left-5 top-[38%] hidden md:flex"
              />
              <CarouselArrow
                direction="next"
                onClick={carousel.next}
                disabled={!carousel.canNext}
                className="absolute -right-5 top-[38%] hidden md:flex"
              />
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}
