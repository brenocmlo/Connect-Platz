"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { waLink } from "./portalUtils";

export function PortalFloatingWhatsApp() {
  return (
    <a
      href={waLink("Olá! Vim pelo site da Connect Platz e gostaria de atendimento.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com corretor no WhatsApp"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#16A34A] text-white shadow-xl shadow-emerald-900/30 ring-4 ring-white/70 transition-all hover:scale-105 hover:bg-[#15803D] active:scale-95"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
