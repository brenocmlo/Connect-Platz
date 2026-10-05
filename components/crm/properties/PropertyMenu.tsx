"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Eye,
  Globe,
  MessageSquare,
  Share2,
  Trash2,
  Check,
} from "lucide-react";

interface PropertyMenuProps {
  propertyId: string;
  propertyName: string;
  isNaLanding: boolean;
  onOpenDetails: () => void;
  onOpenPublishModal: () => void;
  onDelete?: () => void;
}

export function PropertyMenu({
  propertyId,
  propertyName,
  isNaLanding,
  onOpenDetails,
  onOpenPublishModal,
  onDelete,
}: PropertyMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/espelho/${propertyId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1500);
  };

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `Olá! Segue informações sobre o empreendimento "${propertyName}":\nConfira os detalhes e disponibilidade.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Botão quadrado primário no canto superior esquerdo (Seção 5.6) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="Opções do empreendimento"
        className="w-8 h-8 rounded-lg bg-connect-blue text-white shadow-md flex items-center justify-center hover:bg-connect-blue/90 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-connect-blue"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-52 rounded-xl bg-card border border-border shadow-xl py-1.5 z-50 text-xs font-medium animate-fadeIn">
          {/* 1. Ver Detalhes */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onOpenDetails();
            }}
            className="w-full text-left px-3 py-2 text-foreground hover:bg-connect-blue hover:text-white flex items-center gap-2.5 transition-colors"
          >
            <Eye className="w-4 h-4 text-connect-blue group-hover:text-white" />
            <span>Ver Espelho / Detalhes</span>
          </button>

          {/* 2. Subir na Landing Page */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onOpenPublishModal();
            }}
            className="w-full text-left px-3 py-2 text-foreground hover:bg-connect-blue hover:text-white flex items-center gap-2.5 transition-colors"
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>{isNaLanding ? "Gerenciar na Landing" : "Subir na Landing Page"}</span>
          </button>

          {/* 3. Compartilhar via WhatsApp wa.me */}
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full text-left px-3 py-2 text-foreground hover:bg-connect-blue hover:text-white flex items-center gap-2.5 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span>Enviar no WhatsApp</span>
          </button>

          {/* 4. Copiar link do imóvel */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full text-left px-3 py-2 text-foreground hover:bg-connect-blue hover:text-white flex items-center gap-2.5 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Share2 className="w-4 h-4 text-muted-foreground" />
            )}
            <span>{copied ? "Link Copiado!" : "Copiar Link Público"}</span>
          </button>

          {/* 5. Excluir */}
          {onDelete && (
            <div className="border-t border-border mt-1 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onDelete();
                }}
                className="w-full text-left px-3 py-2 text-destructive hover:bg-destructive hover:text-white flex items-center gap-2.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Empreendimento</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
