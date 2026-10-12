"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Sparkles,
  Link as LinkIcon,
  Check,
  Loader2,
} from "lucide-react";
import { LiveHeroPreviewCard } from "./LiveHeroPreviewCard";

interface SiteHeroEditorSectionProps {
  heroImage: string;
  setHeroImage: (url: string) => void;
  heroTitle: string;
  setHeroTitle: (title: string) => void;
  heroHighlight: string;
  setHeroHighlight: (highlight: string) => void;
  heroSubtitle: string;
  setHeroSubtitle: (subtitle: string) => void;
}

const HERO_BG_PRESETS = [
  {
    title: "Mansão com Piscina ao Entardecer",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80",
  },
  {
    title: "Fachada Minimalista Contemporânea",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80",
  },
  {
    title: "Resort Tropical Frente Mar",
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80",
  },
  {
    title: "Living Sofisticado com Vista Panorâmica",
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80",
  },
];

export function SiteHeroEditorSection({
  heroImage,
  setHeroImage,
  heroTitle,
  setHeroTitle,
  heroHighlight,
  setHeroHighlight,
  heroSubtitle,
  setHeroSubtitle,
}: SiteHeroEditorSectionProps) {
  const [imageTab, setImageTab] = useState<"PRESETS" | "UPLOAD" | "URL">("PRESETS");
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(heroImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem válida (PNG, JPG, WebP).");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.urls && data.urls.length > 0) {
        const uploadedUrl = data.urls[0];
        setHeroImage(uploadedUrl);
        setUrlInput(uploadedUrl);
      } else {
        alert(data.error || "Erro no upload da foto.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha ao enviar imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setHeroImage(urlInput.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Preview da Dobra Principal (Live Hero Preview) */}
      <LiveHeroPreviewCard
        heroImage={heroImage}
        heroTitle={heroTitle}
        heroHighlight={heroHighlight}
        heroSubtitle={heroSubtitle}
      />

      {/* 2. Customização da Imagem de Fundo */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold text-foreground block uppercase tracking-wider">
          Imagem de Fundo do Hero (Capa do Site)
        </label>

        {/* Seletor de modo (Presets, Upload, URL) */}
        <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1 border border-border/50 text-xs font-bold max-w-md">
          <button
            type="button"
            onClick={() => setImageTab("PRESETS")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              imageTab === "PRESETS"
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-platz-gold" />
            <span>Presets Oficiais</span>
          </button>
          <button
            type="button"
            onClick={() => setImageTab("UPLOAD")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              imageTab === "UPLOAD"
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-connect-blue" />
            <span>Fazer Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setImageTab("URL")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              imageTab === "URL"
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>URL Direta</span>
          </button>
        </div>

        {/* Presets Grid */}
        {imageTab === "PRESETS" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {HERO_BG_PRESETS.map((preset, idx) => {
              const isSelected = heroImage === preset.url;
              return (
                <div
                  key={idx}
                  onClick={() => setHeroImage(preset.url)}
                  className={`relative aspect-video rounded-xl overflow-hidden border cursor-pointer group transition-all ${
                    isSelected
                      ? "border-connect-blue ring-2 ring-connect-blue/30 scale-[1.02] shadow-md"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/45 group-hover:bg-black/25 transition-colors" />
                  <div className="absolute bottom-1.5 left-2 right-2 text-white text-[11px] font-bold leading-tight drop-shadow">
                    {preset.title}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-connect-blue text-white rounded-full p-1 shadow">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Zone */}
        {imageTab === "UPLOAD" && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-connect-blue/60 rounded-xl p-6 text-center cursor-pointer bg-card/60 hover:bg-muted/40 transition-all flex flex-col items-center justify-center gap-2 max-w-lg"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-connect-blue">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold">Enviando foto para o servidor...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-connect-blue/10 flex items-center justify-center text-connect-blue">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Clique para selecionar foto de capa
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Recomendado: 1920x1080 ou 2560x1440 em formato paisagem (16:9)
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* URL Input */}
        {imageTab === "URL" && (
          <div className="flex gap-2 max-w-lg">
            <input
              type="url"
              placeholder="https://exemplo.com/foto-hero.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-4 py-2 rounded-lg bg-connect-blue/10 hover:bg-connect-blue text-connect-blue hover:text-white border border-connect-blue/30 text-xs font-bold transition-colors"
            >
              Aplicar Imagem
            </button>
          </div>
        )}
      </div>

      {/* 3. Textos do Hero */}
      <div className="space-y-3 pt-3 border-t border-border">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Textos e Chamadas do Hero
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Linha 1 — Introdução
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
              placeholder="Seja qual for o seu momento de vida,"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Linha 2 — Destaque em Caixa Alta
            </label>
            <input
              type="text"
              value={heroHighlight}
              onChange={(e) => setHeroHighlight(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-bold focus:ring-2 focus:ring-connect-blue focus:outline-none"
              placeholder="a Connect Platz tem o imóvel certo para você."
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Linha 3 — Subtítulo Explicativo
          </label>
          <textarea
            rows={2}
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
            placeholder="Venda e temporada em Fortaleza e no litoral, com corretores especialistas e crédito facilitado."
          />
        </div>
      </div>
    </div>
  );
}
