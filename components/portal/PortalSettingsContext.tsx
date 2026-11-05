"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildWhatsAppUrl, normalizeBrPhone } from "@/lib/utils/phone";

// Contatos públicos configurados em Empreendimentos > Configurações Site (/api/site-settings).
export interface PortalPublicSettings {
  whatsapp: string;
  email: string;
  corretorNome: string;
  creci: string;
  simuladorTaxaAnual?: number;
  simuladorPrazoMeses?: number;
  simuladorComprometimento?: number;
  simuladorEntradaMinima?: number;
  sobreTitulo?: string;
  sobreSubtitulo?: string;
  sobreTexto?: string;
  sobreEstatistica1Valor?: string;
  sobreEstatistica1Rotulo?: string;
  sobreEstatistica2Valor?: string;
  sobreEstatistica2Rotulo?: string;
  sobreEstatistica3Valor?: string;
  sobreEstatistica3Rotulo?: string;
  sobreEstatistica4Valor?: string;
  sobreEstatistica4Rotulo?: string;
  customPropertyTypes?: string[];
}

const EMPTY: PortalPublicSettings = {
  whatsapp: "",
  email: "",
  corretorNome: "",
  creci: "",
  simuladorTaxaAnual: 0.105,
  simuladorPrazoMeses: 360,
  simuladorComprometimento: 0.3,
  simuladorEntradaMinima: 0.2,
};

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
          simuladorTaxaAnual: typeof s.simuladorTaxaAnual === "number" ? s.simuladorTaxaAnual : 0.105,
          simuladorPrazoMeses: typeof s.simuladorPrazoMeses === "number" ? s.simuladorPrazoMeses : 360,
          simuladorComprometimento: typeof s.simuladorComprometimento === "number" ? s.simuladorComprometimento : 0.3,
          simuladorEntradaMinima: typeof s.simuladorEntradaMinima === "number" ? s.simuladorEntradaMinima : 0.2,
          sobreTitulo: s.sobreTitulo || undefined,
          sobreSubtitulo: s.sobreSubtitulo || undefined,
          sobreTexto: s.sobreTexto || undefined,
          sobreEstatistica1Valor: s.sobreEstatistica1Valor || undefined,
          sobreEstatistica1Rotulo: s.sobreEstatistica1Rotulo || undefined,
          sobreEstatistica2Valor: s.sobreEstatistica2Valor || undefined,
          sobreEstatistica2Rotulo: s.sobreEstatistica2Rotulo || undefined,
          sobreEstatistica3Valor: s.sobreEstatistica3Valor || undefined,
          sobreEstatistica3Rotulo: s.sobreEstatistica3Rotulo || undefined,
          sobreEstatistica4Valor: s.sobreEstatistica4Valor || undefined,
          sobreEstatistica4Rotulo: s.sobreEstatistica4Rotulo || undefined,
          customPropertyTypes: s.customPropertyTypes || undefined,
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
