"use client";

import React, { useState } from "react";
import { Bath, BedDouble, Car, ChevronLeft, ChevronRight, MapPin, MessageCircle, Ruler } from "lucide-react";
import type { PropertyItem } from "./types";
import { FALLBACK_PHOTO, formatPrice, isTemporada, waLink } from "./portalUtils";

export type { PropertyItem } from "./types";

interface PortalPropertyCardProps {
  property: PropertyItem;
  onSelect: (prop: PropertyItem) => void;
  className?: string;
}

function PhotoSlider({ property, onSelect }: { property: PropertyItem; onSelect: () => void }) {
  const fotos = property.fotos?.length ? property.fotos : [FALLBACK_PHOTO];
  const [index, setIndex] = useState(0);
  const step = (dir: 1 | -1) => setIndex((i) => (i + dir + fotos.length) % fotos.length);
  const temporada = isTemporada(property);

  return (
    <div className="relative aspect-[3/2] overflow-hidden bg-portal-sand">
      <button type="button" onClick={onSelect} className="block h-full w-full" aria-label={`Ver detalhes de ${property.nome}`}>
        <img
          src={fotos[index]}
          alt={property.nome}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </button>

      <span
        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
          temporada ? "bg-platz-gold text-portal-navy" : "bg-connect-blue/90 text-white"
        }`}
      >
        {temporada ? "Temporada" : "Venda"}
      </span>

      {fotos.length > 1 && (
        <>
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => step(dir)}
              aria-label={dir === -1 ? "Foto anterior" : "Próxima foto"}
              className={`absolute bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-portal-navy/60 text-white backdrop-blur-sm transition-opacity hover:bg-portal-navy/80 md:opacity-0 md:group-hover:opacity-100 ${
                dir === -1 ? "left-3" : "right-3"
              }`}
            >
              {dir === -1 ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ))}
          <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {fotos.slice(0, 5).map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full bg-white transition-all ${i === index ? "w-4" : "w-1.5 opacity-60"}`} />
            ))}
          </span>
        </>
      )}
    </div>
  );
}

export function PortalPropertyCard({ property, onSelect, className = "" }: PortalPropertyCardProps) {
  const c = property.caracteristicas || {};
  const specs = [
    { icon: BedDouble, value: c.quartos, label: "quartos" },
    { icon: Bath, value: c.suites, label: "suítes" },
    { icon: Car, value: c.vagas, label: "vagas" },
    { icon: Ruler, value: c.area_m2 ? `${c.area_m2} m²` : undefined, label: "área" },
  ].filter((s) => s.value);
  const price = formatPrice(property);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-xl border border-portal-line bg-portal-surface shadow-md shadow-portal-navy/5 transition-all duration-300 hover:-translate-y-1 hover:border-connect-blue/40 hover:shadow-xl hover:shadow-portal-navy/10 ${className}`}
    >
      <PhotoSlider property={property} onSelect={() => onSelect(property)} />

      <div className="flex flex-1 flex-col p-4">
        <p className="text-lg font-bold text-portal-ink">{price}</p>

        {specs.length > 0 && (
          <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-portal-slate">
            {specs.map(({ icon: Icon, value, label }) => (
              <li key={label} className="flex items-center gap-1.5" title={label}>
                <Icon className="h-4 w-4 text-connect-blue" />
                {value}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => onSelect(property)}
          className="mt-3 text-left text-sm font-semibold text-portal-ink transition-colors hover:text-connect-blue"
        >
          {property.nome}
        </button>
        <p className="mt-1 flex items-start gap-1 text-sm text-portal-slate">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">
            {[property.bairro, property.cidade].filter(Boolean).join(", ")}
            {property.estado ? ` - ${property.estado}` : ""}
          </span>
        </p>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => onSelect(property)}
            className="h-10 flex-1 rounded-lg border border-connect-blue/30 text-sm font-semibold text-connect-blue transition-colors hover:bg-connect-blue hover:text-white active:scale-[0.98]"
          >
            Ver detalhes
          </button>
          <a
            href={waLink(`Olá! Gostaria de informações sobre o imóvel "${property.nome}" (${price}).`)}
            target="_blank"
            rel="noreferrer"
            aria-label="Conversar no WhatsApp sobre este imóvel"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#16A34A] text-white transition-colors hover:bg-[#15803D] active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
