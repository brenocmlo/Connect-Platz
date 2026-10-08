"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, LayoutGrid, SearchX, X } from "lucide-react";
import type { Modalidade, PortalFilters, PropertyItem } from "./types";
import { PortalPropertyCard } from "./PortalPropertyCard";
import { CarouselArrow, PortalSectionTitle, Reveal } from "./PortalUI";
import { useScrollCarousel } from "./useScrollCarousel";
import { hasActiveFilters } from "./portalUtils";

interface PortalListingsProps {
  properties: PropertyItem[];
  totalCount: number;
  loading: boolean;
  error: boolean;
  filters: PortalFilters;
  onModalidade: (m: Modalidade) => void;
  onReset: () => void;
  onSelect: (p: PropertyItem) => void;
}

const CHIPS: { id: Modalidade; label: string }[] = [
  { id: "TODOS", label: "Todos" },
  { id: "VENDA", label: "Venda" },
  { id: "VERANEIO", label: "Temporada" },
];

const CARD_WIDTH = "w-[86%] shrink-0 snap-start sm:w-[300px] xl:w-[296px]";

function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-portal-line bg-portal-surface ${className}`}>
      <div className="aspect-[3/2] animate-pulse bg-portal-line" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-1/2 animate-pulse rounded bg-portal-line" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-portal-sand" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-portal-sand" />
        <div className="h-10 animate-pulse rounded-lg bg-portal-sand" />
      </div>
    </div>
  );
}

function StatusMessage({ icon: Icon, title, text, action }: { icon: typeof SearchX; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-portal-field bg-portal-surface px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-connect-blue/10 text-connect-blue">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-semibold text-portal-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-portal-slate">{text}</p>
      {action}
    </div>
  );
}

export function PortalListings({
  properties,
  totalCount,
  loading,
  error,
  filters,
  onModalidade,
  onReset,
  onSelect,
}: PortalListingsProps) {
  const [gridView, setGridView] = useState(false);
  const carousel = useScrollCarousel();
  const filtering = hasActiveFilters(filters);

  // Ao trocar filtros, volta o carrossel ao início e recalcula as setas.
  useEffect(() => {
    carousel.node?.scrollTo({ left: 0 });
    carousel.update();
  }, [properties, gridView, carousel.node]); // eslint-disable-line react-hooks/exhaustive-deps

  const subtitle = loading
    ? "Carregando o portfólio atualizado..."
    : filtering
      ? `${properties.length} de ${totalCount} imóveis correspondem à sua busca.`
      : `${totalCount} imóveis disponíveis, atualizados em tempo real.`;

  const renderBody = () => {
    if (loading) {
      return (
        <div className="no-scrollbar -mx-4 flex gap-4 overflow-hidden px-4 sm:mx-0 sm:px-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} className={CARD_WIDTH} />
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <StatusMessage
          icon={AlertCircle}
          title="Não foi possível carregar os imóveis"
          text="Verifique sua conexão e recarregue a página. Se preferir, fale com um corretor pelo WhatsApp."
        />
      );
    }
    if (properties.length === 0) {
      return (
        <StatusMessage
          icon={SearchX}
          title="Nenhum imóvel encontrado"
          text="Tente ampliar a região, a faixa de preço ou o número de quartos."
          action={
            <button
              type="button"
              onClick={onReset}
              className="mt-5 rounded-full bg-connect-blue px-6 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:bg-connect-deep-blue"
            >
              Limpar filtros
            </button>
          }
        />
      );
    }
    if (gridView) {
      return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((p) => (
            <PortalPropertyCard key={p.id} property={p} onSelect={onSelect} />
          ))}
        </div>
      );
    }
    return (
      <div className="relative">
        <div
          ref={carousel.ref}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 sm:mx-0 sm:scroll-px-0 sm:px-0"
        >
          {properties.map((p) => (
            <PortalPropertyCard key={p.id} property={p} onSelect={onSelect} className={CARD_WIDTH} />
          ))}
        </div>
        <CarouselArrow direction="prev" onClick={carousel.prev} disabled={!carousel.canPrev} className="absolute -left-5 top-[30%] hidden md:flex" />
        <CarouselArrow direction="next" onClick={carousel.next} disabled={!carousel.canNext} className="absolute -right-5 top-[30%] hidden md:flex" />
      </div>
    );
  };

  const showToggle = !loading && !error && properties.length > 1;

  return (
    <section id="vitrine" className="scroll-mt-[72px] bg-portal-mist py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <PortalSectionTitle eyebrow="Seleção especial" title="IMÓVEIS EM DESTAQUE" subtitle={subtitle} />
        </Reveal>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {CHIPS.map((chip) => {
            const active = filters.modalidade === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onModalidade(chip.id)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-connect-blue text-white shadow-md shadow-connect-blue/25"
                    : "border border-portal-field bg-portal-surface text-portal-ink hover:border-connect-blue/50"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
          {filtering && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-portal-slate transition-colors hover:text-connect-blue"
            >
              <X className="h-4 w-4" />
              Limpar filtros
            </button>
          )}
        </div>

        <Reveal delay={0.1} className="mt-8">
          {renderBody()}
        </Reveal>

        {showToggle && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setGridView((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full bg-connect-blue px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-connect-blue/25 transition-all hover:scale-[1.02] hover:bg-connect-deep-blue hover:shadow-connect-blue/35 active:scale-[0.98]"
            >
              <LayoutGrid className="h-4 w-4" />
              {gridView ? "Voltar ao carrossel" : "Ver todos os imóveis"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
