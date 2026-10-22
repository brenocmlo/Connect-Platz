"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildWhatsAppUrl, normalizeBrPhone } from "@/lib/utils/phone";

// Contatos públicos configurados em Empreendimentos > Configurações Site (/api/site-settings).
export interface PortalPublicSettings {
  whatsapp: string;
  email: string;
  corretorNome: string;
  creci: string;
}

const EMPTY: PortalPublicSettings = { whatsapp: "", email: "", corretorNome: "", creci: "" };

const PortalSettingsContext = createContext<{ settings: PortalPublicSettings; loaded: boolean }>({
  settings: EMPTY,
  loaded: false,
});

export function PortalSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PortalPublicSettings>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/site-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.settings) return;
        const s = data.settings;
        setSettings({
          whatsapp: s.whatsapp || "",
          email: s.email || "",
          corretorNome: s.corretorNome || "",
          creci: s.creci || "",
        });
      })
      .catch(() => undefined)
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ settings, loaded }), [settings, loaded]);
  return <PortalSettingsContext.Provider value={value}>{children}</PortalSettingsContext.Provider>;
}

export function usePortalSettings() {
  return useContext(PortalSettingsContext).settings;
}

/**
 * Gerador de links wa.me com o WhatsApp configurado no site.
 * Retorna null quando não há número válido — o botão correspondente deve ser ocultado.
 */
export function useWaLink(): ((message: string) => string) | null {
  const { whatsapp } = usePortalSettings();
  return useMemo(() => {
    const digits = normalizeBrPhone(whatsapp);
    if (digits.length < 10) return null;
    return (message: string) => buildWhatsAppUrl(digits, message);
  }, [whatsapp]);
}
