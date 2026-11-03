"use client";

import React from "react";
import { Globe, Check } from "lucide-react";

interface MetaSitePixelCardProps {
  pixelId: string;
  isActive: boolean;
  onChangePixelId: (v: string) => void;
  onToggleActive: (active: boolean) => void;
}

export function MetaSitePixelCard({
  pixelId,
  isActive,
  onChangePixelId,
  onToggleActive,
}: MetaSitePixelCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between hover:border-connect-blue/40 transition-colors animate-fade-in-up">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-connect-blue/10 text-connect-blue">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Landing Page & Catálogo Público
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => onToggleActive(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                isActive
                  ? "bg-connect-blue border-connect-blue text-white shadow-xs"
                  : "border-border bg-background"
              }`}
            >
              {isActive && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className="text-xs font-semibold text-foreground">Ativo</span>
          </label>
        </div>

        <h3 className="text-base font-bold text-foreground tracking-tight">
          ID do Pixel do Site (Meta)
        </h3>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
          ID do Pixel do Site (Meta Events Manager)
        </p>

        <div className="mt-3">
          <input
            type="text"
            placeholder="Ex: 1088120237434119"
            value={pixelId}
            onChange={(e) => onChangePixelId(e.target.value.replace(/\D/g, ""))}
            maxLength={25}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue transition-all"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/60">
        {pixelId ? (
          <>
            ID configurado: <span className="font-mono font-semibold text-foreground">{pixelId}</span>. Dispara automaticamente{" "}
            <span className="text-foreground font-medium">PageView</span>,{" "}
            <span className="text-foreground font-medium">ViewContent</span>,{" "}
            <span className="text-foreground font-medium">AddToCart</span>,{" "}
            <span className="text-foreground font-medium">InitiateCheckout</span> e{" "}
            <span className="text-foreground font-medium">Lead</span>.
          </>
        ) : (
          "Cole o ID numérico do seu Pixel criado no Gerenciador de Eventos da Meta para ativar o rastreamento automático do catálogo."
        )}
      </p>
    </div>
  );
}
