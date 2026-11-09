"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Building, Image as ImageIcon } from "lucide-react";
import { FALLBACK_PHOTO } from "./portalUtils";

interface PortalModalGalleryProps {
  fotos?: string[];
  nome: string;
  modalidadeBadge: string;
  estagioObra?: string | null;
  construtora?: string | null;
}

export function PortalModalGallery({
  fotos = [],
  nome,
  modalidadeBadge,
  estagioObra,
  construtora,
}: PortalModalGalleryProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const validFotos = fotos && fotos.length > 0 ? fotos : [FALLBACK_PHOTO];
  const hasMultiple = validFotos.length > 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === 0 ? validFotos.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === validFotos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative h-64 shrink-0 md:h-auto md:w-[42%] bg-portal-mist overflow-hidden group select-none">
      {/* Imagem Atual */}
      <img
        src={validFotos[currentIdx] || FALLBACK_PHOTO}
        alt={`${nome} - Foto ${currentIdx + 1}`}
        className="h-full w-full object-cover transition-opacity duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none" />

      {/* Badges no topo esquerdo */}
      <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
        <span className="rounded-full bg-connect-blue px-3 py-1 text-xs font-bold text-white shadow-sm">
          {modalidadeBadge}
        </span>
        {estagioObra && (
          <span className="rounded-full bg-platz-gold px-3 py-1 text-xs font-bold text-portal-navy shadow-sm">
            {estagioObra}
          </span>
        )}
      </div>

      {/* Contador de fotos (ex: 2 / 6) */}
      {hasMultiple && (
        <div className="absolute top-3.5 right-14 z-10 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm border border-white/10">
          <ImageIcon className="w-3 h-3 text-platz-gold" />
          <span>
            {currentIdx + 1} / {validFotos.length}
          </span>
        </div>
      )}

      {/* Setas de Navegação (Anterior / Próxima) */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Foto anterior"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all hover:bg-black/85 hover:scale-110 active:scale-95 border border-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Próxima foto"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all hover:bg-black/85 hover:scale-110 active:scale-95 border border-white/10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots / Indicadores de Navegação */}
          <div className="absolute bottom-11 left-0 right-0 z-10 flex items-center justify-center gap-1.5 px-3">
            {validFotos.slice(0, 10).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIdx(idx);
                }}
                aria-label={`Ir para foto ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIdx
                    ? "w-5 bg-white shadow-xs"
                    : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
            {validFotos.length > 10 && (
              <span className="text-[9px] text-white/60 font-mono">+{validFotos.length - 10}</span>
            )}
          </div>
        </>
      )}

      {/* Rodapé da imagem com construtora */}
      {construtora && (
        <div className="absolute bottom-3 left-3 right-3 text-white z-10 text-xs">
          <span className="text-[10px] uppercase font-semibold text-white/80 block">Incorporação</span>
          <span className="font-bold flex items-center gap-1.5 text-sm">
            <Building className="w-4 h-4 text-platz-gold" />
            {construtora}
          </span>
        </div>
      )}
    </div>
  );
}
