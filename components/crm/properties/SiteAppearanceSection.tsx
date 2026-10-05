"use client";

import React from "react";

interface SiteAppearanceSectionProps {
  themePreset: string;
  setThemePreset: (preset: string) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
}

export function SiteAppearanceSection({
  themePreset,
  setThemePreset,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
}: SiteAppearanceSectionProps) {
  const presets = [
    { id: "connect-blue", name: "Connect Blue (Padrão)", color: "#1266C7", gold: "#D9BB4C" },
    { id: "modern-navy", name: "Modern Navy", color: "#0F2B48", gold: "#E5A93C" },
    { id: "gold-prestige", name: "Gold Prestige", color: "#161B26", gold: "#F8DA56" },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Presets de Tema da Vitrine</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => setThemePreset(preset.id)}
              className={`border rounded-xl p-3.5 cursor-pointer transition-all ${
                themePreset === preset.id
                  ? "border-connect-blue bg-connect-blue/5 shadow-sm"
                  : "border-border hover:border-border/80"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.color }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.gold }} />
              </div>
              <span className="text-xs font-bold text-foreground">{preset.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-border">
        <h3 className="text-sm font-bold text-foreground">Color Pickers Customizados</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Cor Primária (Botões & Destaques)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Cor Secundária (Dourado / Acentos)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
