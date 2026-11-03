"use client";

import React, { useMemo, useState } from "react";
import { Link2, Copy, Check, Sparkles } from "lucide-react";

export function UtmGeneratorCard() {
  const defaultBaseUrl = typeof window !== "undefined" ? window.location.origin : "https://connectplatz.com.br";

  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [utmSource, setUtmSource] = useState("meta_ads");
  const [utmMedium, setUtmMedium] = useState("cpc");
  const [utmCampaign, setUtmCampaign] = useState("lancamento_alto_padrao_2026");
  const [utmContent, setUtmContent] = useState("video_01_drone_praia");
  const [utmTerm, setUtmTerm] = useState("");
  const [copied, setCopied] = useState(false);

  // Computa a URL final em tempo real
  const finalUrl = useMemo(() => {
    try {
      const cleanBase = baseUrl.trim() || "https://connectplatz.com.br";
      const url = new URL(cleanBase.startsWith("http") ? cleanBase : `https://${cleanBase}`);

      if (utmSource.trim()) url.searchParams.set("utm_source", utmSource.trim().toLowerCase());
      if (utmMedium.trim()) url.searchParams.set("utm_medium", utmMedium.trim().toLowerCase());
      if (utmCampaign.trim()) url.searchParams.set("utm_campaign", utmCampaign.trim().toLowerCase());
      if (utmContent.trim()) url.searchParams.set("utm_content", utmContent.trim());
      if (utmTerm.trim()) url.searchParams.set("utm_term", utmTerm.trim());

      return url.toString();
    } catch {
      return baseUrl;
    }
  }, [baseUrl, utmSource, utmMedium, utmCampaign, utmContent, utmTerm]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-connect-blue/40 transition-colors animate-fade-in-up space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-connect-blue/10 text-connect-blue">
            <Link2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Rastreamento de Campanhas
          </span>
        </div>
        <h3 className="text-base font-bold text-foreground tracking-tight">
          Gerador de URL com Parâmetros UTM
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Monte links padronizados para seus anúncios no Gerenciador da Meta Ads e Google Ads. Todo lead gerado será separado automaticamente por UTM no CRM.
        </p>
      </div>

      <div className="space-y-3">
        {/* URL de Destino */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
            URL de Destino do Site
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://connectplatz.com.br/imoveis/alphaville"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue transition-all"
          />
        </div>

        {/* Source & Medium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              UTM_Source (Origem)
            </label>
            <input
              type="text"
              list="utm-source-suggestions"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              placeholder="meta_ads"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue transition-all"
            />
            <datalist id="utm-source-suggestions">
              <option value="meta_ads" />
              <option value="instagram" />
              <option value="facebook" />
              <option value="google_ads" />
              <option value="whatsapp" />
              <option value="portal_zap" />
            </datalist>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              UTM_Medium (Mídia / Canal)
            </label>
            <input
              type="text"
              list="utm-medium-suggestions"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              placeholder="cpc"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue transition-all"
            />
            <datalist id="utm-medium-suggestions">
              <option value="cpc" />
              <option value="stories" />
              <option value="feed" />
              <option value="reels" />
              <option value="bio" />
              <option value="organico" />
            </datalist>
          </div>
        </div>

        {/* Campaign & Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              UTM_Campaign (Campanha)
            </label>
            <input
              type="text"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="Ex: lancamento_eusebio_2026"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              UTM_Content (Criativo / Anúncio)
            </label>
            <input
              type="text"
              value={utmContent}
              onChange={(e) => setUtmContent(e.target.value)}
              placeholder="Ex: video_01_carrossel_precos"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue transition-all"
            />
          </div>
        </div>

        {/* Term */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
            UTM_Term (Público / Conjunto de Anúncios - Opcional)
          </label>
          <input
            type="text"
            value={utmTerm}
            onChange={(e) => setUtmTerm(e.target.value)}
            placeholder="Ex: interessados_alto_padrao_fortaleza"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue transition-all"
          />
        </div>
      </div>

      {/* URL Final Rastreável */}
      <div className="pt-3 border-t border-border/60 space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
          URL Final Rastreável
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={finalUrl}
            className="w-full bg-muted/60 border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground selection:bg-connect-blue selection:text-white"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-connect-blue hover:bg-connect-blue-dark transition-all shrink-0 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copiado!" : "Copiar URL"}
          </button>
        </div>
      </div>
    </div>
  );
}
