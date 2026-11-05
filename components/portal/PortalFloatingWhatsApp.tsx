"use client";

import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useWaLink } from "./PortalSettingsContext";
import { PortalQuickLeadModal } from "./PortalQuickLeadModal";

export function PortalFloatingWhatsApp() {
  const waLink = useWaLink();
  const [modalOpen, setModalOpen] = useState(false);

  // Sem WhatsApp configurado no site, o botão flutuante não é exibido
  if (!waLink) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="Falar com corretor no WhatsApp"
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#16A34A] text-white shadow-xl shadow-emerald-900/30 ring-4 ring-white/70 transition-all hover:scale-105 hover:bg-[#15803D] active:scale-95 cursor-pointer"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <PortalQuickLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Atendimento Imediato via WhatsApp"
        subtitle="Informe seu nome e WhatsApp para ser atendido pelo corretor credenciado de plantão."
        defaultMessage="Olá! Vim pelo site da Connect Platz e gostaria de atendimento."
        contextSource="site_whatsapp_flutuante"
      />
    </>
  );
}
