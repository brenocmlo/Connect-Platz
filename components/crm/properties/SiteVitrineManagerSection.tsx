"use client";

import React, { useState } from "react";
import {
  Globe,
  Camera,
  Search,
  Building2,
  CheckCircle2,
  Eye,
  ExternalLink,
} from "lucide-react";
import { PropertyCardData } from "./PropertyProductCard";

interface SiteVitrineManagerSectionProps {
  properties: PropertyCardData[];
  onToggleLandingPage: (id: string, current: boolean) => Promise<void>;
  onOpenEditImage: (property: PropertyCardData) => void;
}

export function SiteVitrineManagerSection({
  properties,
  onToggleLandingPage,
  onOpenEditImage,
}: SiteVitrineManagerSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = properties.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.nome || "").toLowerCase().includes(term) ||
      (p.bairro || "").toLowerCase().includes(term) ||
      (p.cidade || "").toLowerCase().includes(term)
    );
  });

  const activeCount = properties.filter((p) => p.exibirNaLandingPage !== false).length;

  return (
    <div className="space-y-4">
      {/* Header com contadores e busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>Imóveis em Destaque na Vitrine Pública</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Defina quais imóveis e fotos aparecem para o público na Landing Page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{activeCount} de {properties.length} online</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filtrar imóveis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
            />
          </div>
        </div>
      </div>

      {/* Grid de Imóveis para Gestão da Vitrine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {filtered.map((prop) => {
          const isNaLanding = prop.exibirNaLandingPage !== false;
          const cover =
            prop.fotos && prop.fotos.length > 0 ? prop.fotos[0] : null;

          return (
            <div
              key={prop.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                isNaLanding
                  ? "bg-card border-border hover:border-connect-blue/40 shadow-sm"
                  : "bg-muted/30 border-border/60 opacity-60 hover:opacity-100"
              }`}
            >
              {/* Thumbnail com foto de capa */}
              <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0 group">
                {cover ? (
                  <img
                    src={cover}
                    alt={prop.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Building2 className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                )}
                {/* Botão sobre a foto para alterar rapidamente */}
                <button
                  type="button"
                  onClick={() => onOpenEditImage(prop)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  title="Alterar Foto"
                >
                  <Camera className="w-4 h-4 text-platz-gold" />
                </button>
              </div>

              {/* Informações do Imóvel */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {prop.nome}
                  </h4>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      isNaLanding
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isNaLanding ? "Online" : "Oculto"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {prop.bairro || "Centro"}, {prop.cidade || "Fortaleza"}
                </p>
                <p className="text-xs font-black text-connect-blue mt-0.5">
                  {prop.valorVenda
                    ? `R$ ${Number(prop.valorVenda).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}`
                    : "Consulte"}
                </p>
              </div>

              {/* Ações: Botão Alterar Foto + Switch de Publicação */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenEditImage(prop)}
                  className="px-2.5 py-1.5 rounded-lg border border-border hover:border-connect-blue/40 bg-muted/60 hover:bg-connect-blue hover:text-white text-foreground text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Alterar Imagem da Capa"
                >
                  <Camera className="w-3.5 h-3.5 text-platz-gold" />
                  <span className="hidden sm:inline">Foto</span>
                </button>

                {/* Switch de Ativação na Landing */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isNaLanding}
                  onClick={() => onToggleLandingPage(prop.id, isNaLanding)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isNaLanding ? "bg-emerald-500" : "bg-muted"
                  }`}
                  title={isNaLanding ? "Ocultar do site" : "Publicar no site"}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isNaLanding ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
