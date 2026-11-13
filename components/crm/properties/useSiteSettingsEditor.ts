"use client";

import { useState, useEffect } from "react";
import { useCrm } from "@/components/crm/CrmContext";
import {
  DEFAULT_VITRINE_SUBTITULO,
  DEFAULT_VITRINE_TITULO,
  type VitrineCardConfig,
} from "@/lib/domain/portal/vitrineShowcase";

export function useSiteSettingsEditor() {
  const { setActionMessage } = useCrm();
  const [siteAtivo, setSiteAtivo] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heroImage, setHeroImage] = useState(
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80"
  );
  const [heroTitle, setHeroTitle] = useState("Seja qual for o seu momento de vida,");
  const [heroHighlight, setHeroHighlight] = useState("a Connect Platz tem o imóvel certo para você.");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Venda e temporada em Fortaleza e no litoral, com corretores especialistas e crédito facilitado."
  );
  const [themePreset, setThemePreset] = useState("connect-blue");
  const [primaryColor, setPrimaryColor] = useState("#1266C7");
  const [secondaryColor, setSecondaryColor] = useState("#D9BB4C");
  const [siteTitle, setSiteTitle] = useState("Connect Platz Imóveis & Veraneio");
  const [siteSlogan, setSiteSlogan] = useState("");
  const [corretorNome, setCorretorNome] = useState("");
  const [creci, setCreci] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [pixelId, setPixelId] = useState("");

  const [simuladorTaxaAnual, setSimuladorTaxaAnual] = useState(0.105);
  const [simuladorPrazoMeses, setSimuladorPrazoMeses] = useState(360);
  const [simuladorComprometimento, setSimuladorComprometimento] = useState(0.3);
  const [simuladorEntradaMinima, setSimuladorEntradaMinima] = useState(0.2);

  const [sobreTitulo, setSobreTitulo] = useState("POR QUE A CONNECT PLATZ?");
  const [sobreSubtitulo, setSobreSubtitulo] = useState(
    "Comprar, vender ou alugar é uma decisão importante. Você merece a confiança de quem conhece a região."
  );
  const [sobreTexto, setSobreTexto] = useState(
    "Somos especialistas no mercado imobiliário do Ceará, com foco em lançamentos, revendas e aluguel de temporada."
  );
  const [sobreEstatistica1Valor, setSobreEstatistica1Valor] = useState("120+");
  const [sobreEstatistica1Rotulo, setSobreEstatistica1Rotulo] = useState("imóveis ativos");
  const [sobreEstatistica2Valor, setSobreEstatistica2Valor] = useState("8");
  const [sobreEstatistica2Rotulo, setSobreEstatistica2Rotulo] = useState("cidades do Ceará");
  const [sobreEstatistica3Valor, setSobreEstatistica3Valor] = useState("45+");
  const [sobreEstatistica3Rotulo, setSobreEstatistica3Rotulo] = useState("temporada no litoral");

  const [vitrineSubtitulo, setVitrineSubtitulo] = useState(DEFAULT_VITRINE_SUBTITULO);
  const [vitrineTitulo, setVitrineTitulo] = useState(DEFAULT_VITRINE_TITULO);
  const [vitrineCards, setVitrineCards] = useState<VitrineCardConfig[]>([]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/site-settings", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const s = data?.settings;
        if (!s) return;
        if (s.heroImage) setHeroImage(s.heroImage);
        if (s.heroTitle) setHeroTitle(s.heroTitle);
        if (s.heroHighlight) setHeroHighlight(s.heroHighlight);
        if (s.heroSubtitle) setHeroSubtitle(s.heroSubtitle);
        if (s.themePreset) setThemePreset(s.themePreset);
        if (s.primaryColor) setPrimaryColor(s.primaryColor);
        if (s.secondaryColor) setSecondaryColor(s.secondaryColor);
        if (s.siteTitle) setSiteTitle(s.siteTitle);
        setSiteSlogan(s.siteSlogan || "");
        setCorretorNome(s.corretorNome || "");
        setCreci(s.creci || "");
        setWhatsapp(s.whatsapp || "");
        setEmail(s.email || "");
        if (s.pixelId !== undefined) setPixelId(s.pixelId);
        if (s.siteAtivo !== undefined) setSiteAtivo(s.siteAtivo);
        if (typeof s.simuladorTaxaAnual === "number") setSimuladorTaxaAnual(s.simuladorTaxaAnual);
        if (typeof s.simuladorPrazoMeses === "number") setSimuladorPrazoMeses(s.simuladorPrazoMeses);
        if (typeof s.simuladorComprometimento === "number") setSimuladorComprometimento(s.simuladorComprometimento);
        if (typeof s.simuladorEntradaMinima === "number") setSimuladorEntradaMinima(s.simuladorEntradaMinima);
        if (s.sobreTitulo) setSobreTitulo(s.sobreTitulo);
        if (s.sobreSubtitulo) setSobreSubtitulo(s.sobreSubtitulo);
        if (s.sobreTexto) setSobreTexto(s.sobreTexto);
        if (s.sobreEstatistica1Valor) setSobreEstatistica1Valor(s.sobreEstatistica1Valor);
        if (s.sobreEstatistica1Rotulo) setSobreEstatistica1Rotulo(s.sobreEstatistica1Rotulo);
        if (s.sobreEstatistica2Valor) setSobreEstatistica2Valor(s.sobreEstatistica2Valor);
        if (s.sobreEstatistica2Rotulo) setSobreEstatistica2Rotulo(s.sobreEstatistica2Rotulo);
        if (s.sobreEstatistica3Valor) setSobreEstatistica3Valor(s.sobreEstatistica3Valor);
        if (s.sobreEstatistica3Rotulo) setSobreEstatistica3Rotulo(s.sobreEstatistica3Rotulo);
        if (s.vitrineSubtitulo !== undefined) setVitrineSubtitulo(s.vitrineSubtitulo || DEFAULT_VITRINE_SUBTITULO);
        if (s.vitrineTitulo !== undefined) setVitrineTitulo(s.vitrineTitulo || DEFAULT_VITRINE_TITULO);
        if (Array.isArray(s.vitrineCards)) setVitrineCards(s.vitrineCards);
      } catch (err) {
        console.warn("Erro ao buscar configurações do site:", err);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        heroImage,
        heroTitle,
        heroHighlight,
        heroSubtitle,
        themePreset,
        primaryColor,
        secondaryColor,
        siteTitle,
        siteSlogan,
        corretorNome,
        creci,
        whatsapp,
        email,
        pixelId,
        siteAtivo,
        simuladorTaxaAnual,
        simuladorPrazoMeses,
        simuladorComprometimento,
        simuladorEntradaMinima,
        sobreTitulo,
        sobreSubtitulo,
        sobreTexto,
        sobreEstatistica1Valor,
        sobreEstatistica1Rotulo,
        sobreEstatistica2Valor,
        sobreEstatistica2Rotulo,
        sobreEstatistica3Valor,
        sobreEstatistica3Rotulo,
        vitrineSubtitulo: vitrineSubtitulo.trim() || DEFAULT_VITRINE_SUBTITULO,
        vitrineTitulo: vitrineTitulo.trim() || DEFAULT_VITRINE_TITULO,
        vitrineCards: vitrineCards.slice(0, 12).map((c, idx) => ({
          id: (c.id || `vitrine-${idx + 1}`).trim(),
          propertyId: (c.propertyId || "").trim(),
          tag: (c.tag || "Destaque").trim(),
          eyebrow: (c.eyebrow || "Imóveis").trim(),
          titulo: (c.titulo || "Imóvel Connect Platz").trim(),
          foto: (c.foto || "").trim(),
          modalidade: c.modalidade || "",
          tipoImovel: c.tipoImovel || "TODOS",
          quartosMin: (c.quartosMin || "") as "" | "2" | "3" | "4",
        })),
      };

      const res = await fetch("/api/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setActionMessage("Configurações do site e vitrine salvas com sucesso!");
      } else {
        const data = await res.json().catch(() => ({}));
        setActionMessage(data.error || "Não foi possível salvar as configurações do site.");
      }
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setActionMessage("Falha de conexão: as configurações não foram salvas.");
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  return {
    siteAtivo, setSiteAtivo, saving, handleSave,
    heroImage, setHeroImage, heroTitle, setHeroTitle, heroHighlight, setHeroHighlight, heroSubtitle, setHeroSubtitle,
    themePreset, setThemePreset, primaryColor, setPrimaryColor, secondaryColor, setSecondaryColor,
    siteTitle, setSiteTitle, siteSlogan, setSiteSlogan,
    corretorNome, setCorretorNome, creci, setCreci, whatsapp, setWhatsapp, email, setEmail, pixelId, setPixelId,
    simuladorTaxaAnual, setSimuladorTaxaAnual, simuladorPrazoMeses, setSimuladorPrazoMeses,
    simuladorComprometimento, setSimuladorComprometimento, simuladorEntradaMinima, setSimuladorEntradaMinima,
    sobreTitulo, setSobreTitulo, sobreSubtitulo, setSobreSubtitulo, sobreTexto, setSobreTexto,
    sobreEstatistica1Valor, setSobreEstatistica1Valor, sobreEstatistica1Rotulo, setSobreEstatistica1Rotulo,
    sobreEstatistica2Valor, setSobreEstatistica2Valor, sobreEstatistica2Rotulo, setSobreEstatistica2Rotulo,
    sobreEstatistica3Valor, setSobreEstatistica3Valor, sobreEstatistica3Rotulo, setSobreEstatistica3Rotulo,
    vitrineSubtitulo, setVitrineSubtitulo, vitrineTitulo, setVitrineTitulo, vitrineCards, setVitrineCards,
  };
}
