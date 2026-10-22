"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin,
  Compass,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Palmtree,
  Utensils,
  ShoppingBag,
  Milestone,
  Radio,
  Loader2,
} from "lucide-react";
import type { PropertyItem } from "./types";
import { formatCep, getGoogleMapsNavigationUrl, getWazeNavigationUrl } from "@/lib/services/location";

interface PropertyLocationTabProps {
  property: PropertyItem;
}

interface LocationPayload {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude?: number;
  longitude?: number;
  service?: string;
  addressFormatted: string;
  wazeUrl: string;
  googleMapsUrl: string;
  osmEmbedUrl: string;
  pois: { label: string; iconType: "beach" | "shopping" | "food" | "route" | "nature" }[];
}

export function PropertyLocationTab({ property }: PropertyLocationTabProps) {
  const [data, setData] = useState<LocationPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchLocation() {
      setLoading(true);
      try {
        // Somente parâmetros preenchidos: sem dados de localização a API responde 400
        const query = new URLSearchParams();
        const params: Record<string, unknown> = {
          slug: property.slug,
          cep: property.cep,
          bairro: property.bairro,
          cidade: property.cidade,
          estado: property.estado,
          endereco: property.endereco,
          latitude: property.latitude,
          longitude: property.longitude,
        };
        for (const [k, v] of Object.entries(params)) {
          if (v !== null && v !== undefined && v !== "") query.set(k, String(v));
        }
        const res = await fetch(`/api/location/property?${query.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (mounted && json.data) setData(json.data);
        } else if (mounted) {
          setData(null);
        }
      } catch (err) {
        console.error("Erro ao carregar dados de localização:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchLocation();
    return () => {
      mounted = false;
    };
  }, [property]);

  const handleCopy = () => {
    const textToCopy =
      data?.addressFormatted ||
      [property.endereco, property.bairro, [property.cidade, property.estado].filter(Boolean).join(" - ")].filter(Boolean).join(", ");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getPoiIcon = (type: string) => {
    switch (type) {
      case "beach":
        return <Palmtree className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case "food":
        return <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case "shopping":
        return <ShoppingBag className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      default:
        return <Milestone className="w-3.5 h-3.5 text-connect-blue shrink-0" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-portal-slate">
        <Loader2 className="w-6 h-6 animate-spin text-connect-blue" />
        <span className="text-xs font-semibold">Consultando localização do imóvel...</span>
      </div>
    );
  }

  const lat = data?.latitude;
  const lng = data?.longitude;
  const hasCoords = typeof lat === "number" && typeof lng === "number";
  const serviceName =
    data?.service === "informado"
      ? "Coordenadas cadastradas do imóvel"
      : data?.service === "nominatim"
      ? "OpenStreetMap (endereço geocodificado)"
      : data?.service === "brasilapi-centroide"
      ? "BrasilAPI (aproximado pelo município)"
      : "Endereço sem coordenadas";
  const enderecoFallback = [property.endereco, property.bairro, [property.cidade, property.estado].filter(Boolean).join(" - ")]
    .filter(Boolean)
    .join(", ");

  if (!data && !enderecoFallback) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-portal-slate">
        <MapPin className="h-6 w-6 text-connect-blue" />
        <span className="text-xs font-semibold">Localização não informada para este imóvel.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Header do Status da API de Localização */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-connect-blue/10 border border-connect-blue/20">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold text-connect-blue">
            API de Localização Ativa:
          </span>
          <span className="text-[11px] font-semibold text-portal-ink">{serviceName}</span>
        </div>

        {data?.cep && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-portal-surface border border-portal-line text-[11px] font-mono font-bold text-portal-ink">
            <span>CEP {formatCep(data.cep)}</span>
            <button
              type="button"
              onClick={handleCopy}
              title="Copiar endereço completo"
              className="hover:text-connect-blue text-portal-slate transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* 2. Coordenadas de GPS e Endereço Detalhado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        <div className="p-2.5 rounded-xl bg-portal-mist/80 border border-portal-line flex items-start gap-2">
          <MapPin className="w-4 h-4 text-connect-blue shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-portal-slate block">
              Endereço Registrado
            </span>
            <p className="font-semibold text-portal-ink leading-tight">
              {data?.logradouro || property.endereco || property.bairro}
            </p>
            <p className="text-[10px] text-portal-slate">
              {property.bairro}, {property.cidade} - {property.estado}
            </p>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-portal-mist/80 border border-portal-line flex items-start gap-2">
          <Radio className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-portal-slate block">
              Coordenadas de Satélite (GPS)
            </span>
            <p className="font-mono font-bold text-portal-ink text-xs">
              {hasCoords ? `${lat!.toFixed(5)}, ${lng!.toFixed(5)}` : "Não disponível"}
            </p>
            {hasCoords && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Compass className="w-3 h-3" /> {data?.service === "brasilapi-centroide" ? "Ponto aproximado" : "Ponto georreferenciado"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Mapa Interativo (Maptech com tiles otimizados) */}
      {hasCoords && (
      <div className="relative rounded-xl overflow-hidden border border-portal-line bg-portal-navy/5 shadow-inner">
        <div className="h-44 w-full relative">
          <iframe
            title={`Mapa de localização - ${property.nome}`}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={data?.osmEmbedUrl}
            className="w-full h-full filter saturate-150 contrast-105"
          />
          {/* Card Flutuante com Nome do Imóvel */}
          <div className="absolute top-2.5 left-2.5 z-10 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-white shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-connect-blue" />
            <span className="text-xs font-bold truncate max-w-[200px]">{property.nome}</span>
          </div>
        </div>
      </div>
      )}

      {/* 4. Pontos de Interesse e Mobilidade da Região */}
      {data?.pois && data.pois.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-portal-slate block">
            Pontos de Interesse & Mobilidade Urbana
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {data.pois.map((poi, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-lg bg-portal-mist/60 border border-portal-line text-[11px] font-medium text-portal-ink"
              >
                {getPoiIcon(poi.iconType)}
                <span className="truncate">{poi.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Ações Rápidas de Navegação (Waze & Google Maps) */}
      <div className="pt-2 border-t border-portal-line flex flex-col sm:flex-row gap-2">
        <a
          href={data?.wazeUrl || getWazeNavigationUrl({ address: enderecoFallback })}
          target="_blank"
          rel="noreferrer"
          className="flex-1 h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Traçar Rota no Waze</span>
        </a>

        <a
          href={data?.googleMapsUrl || getGoogleMapsNavigationUrl({ address: enderecoFallback })}
          target="_blank"
          rel="noreferrer"
          className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Abrir no Google Maps</span>
        </a>

        <button
          type="button"
          onClick={handleCopy}
          className="h-10 px-3.5 rounded-xl border border-portal-line bg-portal-surface hover:bg-portal-mist text-portal-ink font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          title="Copiar Endereço Completo"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-portal-slate" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
