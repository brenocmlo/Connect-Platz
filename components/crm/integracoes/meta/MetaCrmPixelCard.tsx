"use client";

import React from "react";
import { Filter, Check } from "lucide-react";

interface MetaCrmPixelCardProps {
  pixelId: string;
  isActive: boolean;
  sitePixelIdFallback: string;
  onChangePixelId: (v: string) => void;
  onToggleActive: (active: boolean) => void;
}

export function MetaCrmPixelCard({
  pixelId,
  isActive,
  sitePixelIdFallback,
  onChangePixelId,
  onToggleActive,
}: MetaCrmPixelCardProps) {
  const effectiveId = pixelId || sitePixelIdFallback;

  return (
    <div className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between hover:border-connect-blue/40 transition-colors animate-fade-in-up">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-platz-gold/15 text-platz-gold-dark dark:text-platz-gold">
              <Filter className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Funil Comercial & Fechamento de Vendas
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
          ID do Pixel do CRM (Meta)
        </h3>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
          ID do Pixel do CRM (Deixe em branco para usar o mesmo Pixel do site)
        </p>

        <div className="mt-3">
          <input
            type="text"
            placeholder={
              sitePixelIdFallback
                ? `Usando Pixel do site (${sitePixelIdFallback})`
                : "Ex: 1088120237434119 ou um Pixel exclusivo do CRM"
            }
            value={pixelId}
            onChange={(e) => onChangePixelId(e.target.value.replace(/\D/g, ""))}
            maxLength={25}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue transition-all"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/60">
        Dispara conversões quando o corretor movimenta o lead ou o financeiro formaliza o contrato:{" "}
        <span className="text-foreground font-medium">Schedule</span> (Em Contato / Visita Agendada),{" "}
        <span className="text-foreground font-medium">InitiateCheckout</span> (Proposta / Orçamento Enviado) e{" "}
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Purchase</span> (Venda Ganha com VGV em R$).
        {effectiveId && (
          <span className="block mt-1 text-[11px] text-muted-foreground">
            Pixel ativo para CRM: <span className="font-mono text-foreground font-medium">{effectiveId}</span>
          </span>
        )}
      </p>
    </div>
  );
}
