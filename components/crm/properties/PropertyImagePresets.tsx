"use client";

import React from "react";
import { Check } from "lucide-react";

export interface ArchitecturalPreset {
  title: string;
  url: string;
  tipo: string;
}

export const ARCHITECTURAL_PRESETS: ArchitecturalPreset[] = [
  {
    title: "Fachada Contemporânea",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
    tipo: "Casa / Mansão",
  },
  {
    title: "Resort Pé na Areia",
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80",
    tipo: "Praia / Litoral",
  },
  {
    title: "Edifício Alto Padrão",
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
    tipo: "Torre / Meireles",
  },
  {
    title: "Piscina com Deck & Solarium",
    url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80",
    tipo: "Lazer / Veraneio",
  },
  {
    title: "Living Integrado & Vista Mar",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
    tipo: "Apartamento",
  },
  {
    title: "Studio Contemporâneo",
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80",
    tipo: "Compacto / Studio",
  },
];

interface PropertyImagePresetsProps {
  selectedImage: string;
  onSelect: (url: string) => void;
}

export function PropertyImagePresets({
  selectedImage,
  onSelect,
}: PropertyImagePresetsProps) {
  return (
    <div className="space-y-2">
      <span className="text-[11px] text-muted-foreground block">
        Escolha uma foto arquitetônica de alta resolução com 1 clique:
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
        {ARCHITECTURAL_PRESETS.map((preset, idx) => {
          const isCurrent = selectedImage === preset.url;
          return (
            <div
              key={idx}
              onClick={() => onSelect(preset.url)}
              className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer group transition-all ${
                isCurrent
                  ? "border-connect-blue ring-2 ring-connect-blue/30 scale-[1.02]"
                  : "border-border hover:border-border/80"
              }`}
            >
              <img
                src={preset.url}
                alt={preset.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-1 left-1.5 right-1 text-white text-[10px] font-bold truncate drop-shadow">
                {preset.title}
              </div>
              {isCurrent && (
                <div className="absolute top-1 right-1 bg-connect-blue text-white rounded-full p-0.5 shadow">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
