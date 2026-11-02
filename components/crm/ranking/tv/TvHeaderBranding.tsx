// components/crm/ranking/tv/TvHeaderBranding.tsx
// Cabeçalho institucional superior com Logo e Slogan da Imobiliária (Estilo Habitus).

"use client";

import React from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";

interface TvHeaderBrandingProps {
  nome: string;
  logoUrl: string | null;
  slogan: string;
}

export function TvHeaderBranding({ nome, logoUrl, slogan }: TvHeaderBrandingProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-2 pb-1">
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <div className="relative h-10 w-36 sm:h-12 sm:w-44">
            <Image
              src={logoUrl}
              alt={nome}
              fill
              className="object-contain object-center"
              priority
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-white">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1266C7] to-[#0D478F] flex items-center justify-center shadow-lg shadow-[#1266C7]/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
              {nome}
            </span>
          </div>
        )}
      </div>

      {slogan && (
        <span className="text-[11px] sm:text-xs font-medium tracking-widest text-slate-400 uppercase mt-0.5">
          {slogan}
        </span>
      )}
    </div>
  );
}
