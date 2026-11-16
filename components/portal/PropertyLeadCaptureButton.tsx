"use client";

import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { initUtmCapture } from "@/lib/tracking/utmCapture";
import { PortalQuickLeadModal } from "./PortalQuickLeadModal";

interface PropertyLeadCaptureButtonProps {
  propertyId: string;
  propertyNome: string;
  propertyCidade?: string | null;
  propertySlug: string;
  variant?: "header" | "sidebar";
  trackPageView?: boolean;
}

export function PropertyLeadCaptureButton({
  propertyId,
  propertyNome,
  propertyCidade,
  propertySlug,
  variant = "header",
  trackPageView = false,
}: PropertyLeadCaptureButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    initUtmCapture();

    if (trackPageView && typeof window !== "undefined") {
      try {
        if ((window as any).fbq) {
          (window as any).fbq("track", "ViewContent", {
            content_name: propertyNome,
            content_ids: [propertyId],
            content_type: "product",
          });
        }
      } catch {}
    }
  }, [propertyId, propertyNome, trackPageView]);

  const defaultMessage = `Olá! Gostaria de mais informações sobre o imóvel: ${propertyNome}${
    propertyCidade ? ` (${propertyCidade})` : ""
  }.`;

  return (
    <>
      {variant === "header" ? (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp Corretor</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Falar no WhatsApp com o Corretor</span>
        </button>
      )}

      <PortalQuickLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Atendimento — ${propertyNome}`}
        subtitle="Informe seu nome e WhatsApp para falar agora com o corretor responsável."
        defaultMessage={defaultMessage}
        contextSource={`imovel_${propertySlug}`}
        propertyId={propertyId}
        propertyNome={propertyNome}
      />
    </>
  );
}
