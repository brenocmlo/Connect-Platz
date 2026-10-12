"use client";

import React from "react";
import { Tag, Waves, Search, Eye } from "lucide-react";

interface LiveHeroPreviewCardProps {
  heroImage: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
}

export function LiveHeroPreviewCard({
  heroImage,
  heroTitle,
  heroHighlight,
  heroSubtitle,
}: LiveHeroPreviewCardProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Eye className="w-4 h-4 text-connect-blue" />
          <span>Pré-visualização da Dobra Principal (Hero)</span>
        </h3>
        <span className="text-[11px] text-muted-foreground">
          Como os clientes veem na página inicial pública
        </span>
      </div>

      {/* Card Mockup fiel ao PortalHero */}
      <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg bg-[#0F2B48] min-h-[260px] sm:min-h-[290px] flex flex-col justify-center px-6 py-8">
        <img
          src={heroImage}
          alt="Hero Background Preview"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F2B48]/90 via-[#0F2B48]/60 to-[#0F2B48]/20 pointer-events-none" />

        <div className="relative z-10 max-w-lg space-y-2 text-white">
          <span className="text-sm font-normal block drop-shadow-sm text-slate-100">
            {heroTitle || "Seja qual for o seu momento de vida,"}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white drop-shadow">
            {heroHighlight || "a Connect Platz tem o imóvel certo para você."}
          </h1>
          <p className="text-xs text-white/80 max-w-sm leading-relaxed drop-shadow-sm">
            {heroSubtitle ||
              "Venda e temporada em Fortaleza e no litoral, com corretores especialistas e crédito facilitado."}
          </p>

          {/* Mockup da barra de busca do Hero */}
          <div className="pt-3 max-w-xs">
            <div className="inline-flex gap-1 bg-white/10 backdrop-blur-md rounded-t-lg p-1 text-[10px] font-bold">
              <span className="bg-connect-blue text-white px-2 py-0.5 rounded flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> Comprar
              </span>
              <span className="text-white/80 px-2 py-0.5 flex items-center gap-1">
                <Waves className="w-2.5 h-2.5" /> Temporada
              </span>
            </div>
            <div className="bg-white/95 rounded-b-lg rounded-tr-lg p-1.5 flex items-center gap-1 shadow-md text-[11px] text-slate-500">
              <Search className="w-3 h-3 text-slate-400 ml-1" />
              <span className="truncate">Bairro, praia ou cidade...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
