"use client";

import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Share2,
  FileText,
  MessageSquare,
  Check,
  Compass,
  Navigation,
  ExternalLink,
  Ruler,
  BedDouble,
  Bath,
  Car,
  Sparkles,
  Globe,
  ImageOff,
} from "lucide-react";
import { PropertyCardData } from "./PropertyProductCard";
import { PropertyModalShell } from "./PropertyModalShell";
import { REGIONAL_POIS } from "@/lib/services/location";
import {
  buildFichaText,
  copyText,
  formatPropertyAddress,
  formatPropertyPrice,
  propertyNavigation,
  propertyPublicUrl,
  propertySpecs,
} from "./propertyFicha";

interface PropertyDetailsModalProps {
  property: PropertyCardData | null;
  onClose: () => void;
  onOpenMaterials?: (property: PropertyCardData) => void;
}

const SPEC_ICONS: Record<string, React.ElementType> = { area_m2: Ruler, quartos: BedDouble, suites: Bath, vagas: Car };

export function PropertyDetailsModal({ property, onClose, onOpenMaterials }: PropertyDetailsModalProps) {
  const [copied, setCopied] = useState<"ok" | "erro" | null>(null);

  const p = property;
  const specs = p ? propertySpecs(p) : [];
  const address = p ? formatPropertyAddress(p) : "";
  const nav = p ? propertyNavigation(p) : { hasAny: false, wazeUrl: null, googleMapsUrl: null };
  const pois = (p?.bairro && REGIONAL_POIS[p.bairro]) || [];
  const hasCoords = p?.latitude != null && p?.longitude != null;

  const handleCopyFicha = async () => {
    if (!p) return;
    const ok = await copyText(buildFichaText(p, window.location.origin));
    setCopied(ok ? "ok" : "erro");
    setTimeout(() => setCopied(null), 2200);
  };

  const handleWhatsApp = () => {
    if (!p) return;
    const text = `Olá! Segue a ficha comercial:\n\n${buildFichaText(p, window.location.origin)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <PropertyModalShell open={Boolean(p)} onClose={onClose} maxWidth="max-w-3xl" ariaLabel={p ? `Ficha de ${p.nome}` : "Ficha do imóvel"}>
      {p && (
        <div className="space-y-5">
          {/* 1. Cabeçalho com construtora e badges */}
          <div className="space-y-1.5 border-b border-border pb-4 pr-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-connect-blue px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {p.modalidade === "VERANEIO_TEMPORADA" ? "Temporada" : p.modalidade === "AMBOS" ? "Venda e Temporada" : "Venda"}
              </span>
              {p.estagioObra && (
                <span className="rounded-full border border-platz-gold/40 bg-platz-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-platz-gold">
                  {p.estagioObra}
                </span>
              )}
              {p.construtora && (
                <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 text-connect-blue" />
                  {p.construtora}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black leading-tight text-foreground sm:text-3xl">{p.nome}</h2>
            {address && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-connect-blue" />
                <span>{address}</span>
              </p>
            )}
          </div>

          {/* 2. Foto de capa */}
          <div className="relative h-56 overflow-hidden rounded-2xl border border-border bg-muted sm:h-64">
            {p.fotos?.[0] ? (
              <img src={p.fotos[0]} alt={p.nome} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-connect-blue/15 to-connect-blue/5 text-connect-blue">
                <ImageOff className="h-8 w-8" />
                <span className="text-xs font-semibold">Sem foto cadastrada</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-white/80">Valor Comercial</span>
                <p className="text-2xl font-black text-white sm:text-3xl">{formatPropertyPrice(p)}</p>
              </div>
              {p.exibirNaLandingPage && (
                <span className="flex items-center gap-1 rounded-full border border-emerald-400/50 bg-emerald-500/25 px-2.5 py-1 text-[10px] font-bold text-white">
                  <Globe className="h-3 w-3" /> Online na Vitrine
                </span>
              )}
            </div>
          </div>

          {/* 3. Especificações */}
          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {specs.map(({ key, label, value }) => {
                const Icon = SPEC_ICONS[key] || Ruler;
                return (
                  <div key={key} className="rounded-xl border border-border bg-muted/40 p-3 text-center">
                    <Icon className="mx-auto mb-1 h-4 w-4 text-connect-blue" />
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
                    <span className="text-sm font-black text-foreground">{value}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Descrição */}
          <div className="space-y-1.5 rounded-2xl border border-border bg-muted/40 p-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Descrição</span>
            {p.descricao ? (
              <p className="whitespace-pre-line text-xs leading-relaxed text-foreground sm:text-sm">{p.descricao}</p>
            ) : (
              <p className="text-xs italic text-muted-foreground">Nenhuma descrição cadastrada.</p>
            )}
          </div>

          {/* 5. Diferenciais */}
          {p.diferenciais && p.diferenciais.length > 0 && (
            <div className="space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Diferenciais & Lazer</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {p.diferenciais.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-semibold text-foreground">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-platz-gold" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Localização e rotas */}
          <div className="space-y-2.5 rounded-2xl border border-border bg-muted/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Compass className="h-3.5 w-3.5 text-connect-blue" />
                Localização & Rotas
              </span>
              {nav.hasAny ? (
                <div className="flex items-center gap-2">
                  <a href={nav.wazeUrl!} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:underline dark:text-sky-400">
                    <Navigation className="h-3 w-3" /> Waze
                  </a>
                  <span className="text-muted-foreground">•</span>
                  <a href={nav.googleMapsUrl!} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline dark:text-emerald-400">
                    <ExternalLink className="h-3 w-3" /> Google Maps
                  </a>
                </div>
              ) : (
                <span className="text-[11px] text-muted-foreground">Endereço não cadastrado</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {hasCoords
                ? `Coordenadas: ${Number(p.latitude).toFixed(5)}, ${Number(p.longitude).toFixed(5)}`
                : "Sem coordenadas: as rotas usam o endereço cadastrado."}
            </p>
            {pois.length > 0 && (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {pois.map((poi) => (
                  <div key={poi.label} className="flex items-center gap-2 text-[11px] text-foreground">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-connect-blue" />
                    <span className="truncate">{poi.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. Ações comerciais */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCopyFicha}
              title={propertyPublicUrl(p, "") ? "Copia os dados e o link público do imóvel" : "Imóvel fora da vitrine: a ficha é copiada sem link público"}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto"
            >
              {copied === "ok" ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4 text-connect-blue" />}
              <span>{copied === "ok" ? "Ficha copiada!" : copied === "erro" ? "Não foi possível copiar" : "Copiar Ficha"}</span>
            </button>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              {onOpenMaterials && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMaterials(p);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 py-2.5 text-xs font-bold text-foreground transition-all hover:border-connect-blue/40 sm:flex-none"
                >
                  <FileText className="h-4 w-4 text-connect-blue" />
                  <span>Materiais & Tabela</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#22C55E] px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-[#16A34A] sm:flex-none"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PropertyModalShell>
  );
}
