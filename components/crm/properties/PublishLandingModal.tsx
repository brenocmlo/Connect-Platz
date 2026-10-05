"use client";

import React, { useState } from "react";
import {
  X,
  Globe,
  Share2,
  Check,
  ExternalLink,
  MessageSquare,
  Building2,
  Sparkles,
  Info,
} from "lucide-react";

interface PublishLandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    nome: string;
    slug?: string;
    bairro?: string | null;
    cidade?: string | null;
    valorVenda?: number | null;
    exibirNaLandingPage?: boolean;
    fotos?: string[];
  } | null;
  onToggleLandingPage: (id: string, current: boolean) => Promise<void>;
}

export function PublishLandingModal({
  isOpen,
  onClose,
  property,
  onToggleLandingPage,
}: PublishLandingModalProps) {
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  if (!isOpen || !property) return null;

  const isNaLanding = property.exibirNaLandingPage !== false;
  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/espelho/${property.slug || property.id}`;

  const handleToggle = async () => {
    try {
      setIsUpdating(true);
      await onToggleLandingPage(property.id, isNaLanding);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const text = encodeURIComponent(
      `Olá! Confira este imóvel exclusivo na Connect Platz: "${property.nome}" em ${property.bairro || ""}, ${property.cidade || ""}.\nVeja mais em: ${publicUrl}`
    );
    const targetUrl = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(targetUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header do Modal */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-connect-blue/10 flex items-center justify-center text-connect-blue">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Publicação na Landing Page
              </h2>
              <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                {property.nome}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 space-y-5">
          {/* Card de Status na Landing Page */}
          <div className="bg-muted/40 border border-border rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isNaLanding ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                  }`}
                />
                <span className="text-xs font-bold text-foreground">
                  Status: {isNaLanding ? "Visível no Site Vitrine" : "Oculto no Site"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isNaLanding
                  ? "Este imóvel está publicado e recebendo visitas na sua vitrine oficial."
                  : "Ative para exibir este imóvel imediatamente na vitrine pública para clientes."}
              </p>
            </div>

            <button
              onClick={handleToggle}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isNaLanding
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-connect-blue hover:bg-[#0D478F] text-white"
              }`}
            >
              {isUpdating
                ? "Atualizando..."
                : isNaLanding
                ? "Desativar"
                : "Ativar na Landing"}
            </button>
          </div>

          {/* Link para ver o site vitrine oficial */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-muted-foreground">Quer ver como está a sua vitrine?</span>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-connect-blue font-bold flex items-center gap-1 hover:underline"
            >
              Ver Landing Page Completa
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Seção WhatsApp Direct wa.me */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-xs font-bold text-foreground block">
              Enviar Ficha para Cliente via WhatsApp
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="(DDD) 99999-9999 (opcional)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
              />
              <button
                onClick={handleSendWhatsApp}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all hover:scale-105"
              >
                <MessageSquare className="w-4 h-4" />
                Enviar wa.me
              </button>
            </div>
          </div>

          {/* Opção de Compartilhar Link (guardada em memória / preservada) */}
          <div className="space-y-1.5 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                Link do Espelho / Catálogo
              </label>
              <span className="text-[10px] text-muted-foreground">Salvo na memória</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 bg-muted/60 border border-border rounded-xl px-3 py-2 text-[11px] font-mono text-muted-foreground select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="bg-card border border-border hover:bg-muted text-foreground p-2 rounded-xl text-xs font-bold transition-colors"
                title="Copiar link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Callout de Ajuda no Estilo Habitus */}
          <div className="bg-connect-blue/5 border border-connect-blue/20 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-muted-foreground">
            <Info className="w-4 h-4 text-connect-blue flex-shrink-0 mt-0.5" />
            <p>
              Ao ativar na Landing Page, as fotos, tabela de andares e preço base são sincronizados instantaneamente no portal público Connect Platz sem recarregar o sistema.
            </p>
          </div>
        </div>

        {/* Rodapé Fixo */}
        <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
