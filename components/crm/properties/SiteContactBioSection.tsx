"use client";

import React from "react";

interface SiteContactBioSectionProps {
  type: "QUEM_SOU" | "CONTATO" | "PIXEL" | "LEGAL";
  corretorNome?: string;
  setCorretorNome?: (v: string) => void;
  whatsapp?: string;
  setWhatsapp?: (v: string) => void;
  email?: string;
  setEmail?: (v: string) => void;
  pixelId?: string;
  setPixelId?: (v: string) => void;
  creci?: string;
  setCreci?: (v: string) => void;
}

export function SiteContactBioSection({
  type,
  corretorNome = "",
  setCorretorNome = () => {},
  whatsapp = "",
  setWhatsapp = () => {},
  email = "",
  setEmail = () => {},
  pixelId = "",
  setPixelId = () => {},
  creci = "",
  setCreci = () => {},
}: SiteContactBioSectionProps) {
  if (type === "QUEM_SOU") {
    return (
      <div className="space-y-4 max-w-2xl">
        <h3 className="text-sm font-bold text-foreground">Apresentação da Imobiliária / Corretor</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Nome de Exibição
            </label>
            <input
              type="text"
              value={corretorNome}
              onChange={(e) => setCorretorNome(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Biografia / Apresentação Institucional
            </label>
            <textarea
              rows={4}
              defaultValue="Especialistas em intermediação de imóveis de alto padrão, lançamentos na planta e investimentos imobiliários com segurança jurídica e atendimento personalizado."
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  if (type === "CONTATO") {
    return (
      <div className="space-y-4 max-w-2xl">
        <h3 className="text-sm font-bold text-foreground">Canais Oficiais de Atendimento</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              WhatsApp Oficial para Leads
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              E-mail de Contato
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  if (type === "PIXEL") {
    return (
      <div className="space-y-4 max-w-2xl">
        <h3 className="text-sm font-bold text-foreground">Rastreamento de Tráfego e Anúncios</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              ID do Meta Pixel (Facebook Ads)
            </label>
            <input
              type="text"
              placeholder="Ex: 123456789012345"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  if (type === "LEGAL") {
    return (
      <div className="space-y-4 max-w-2xl">
        <h3 className="text-sm font-bold text-foreground">Conformidade e Registro Profissional</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Número do CRECI
            </label>
            <input
              type="text"
              value={creci}
              onChange={(e) => setCreci(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
