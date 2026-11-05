"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Palette,
  User,
  Phone,
  Code,
  Shield,
  Save,
  ExternalLink,
  Sparkles,
  Building2,
  Calculator,
  Users,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { SiteAppearanceSection } from "./SiteAppearanceSection";
import { SiteHeroEditorSection } from "./SiteHeroEditorSection";
import { SiteVitrineManagerSection } from "./SiteVitrineManagerSection";
import { SiteContactBioSection } from "./SiteContactBioSection";
import { SiteCreditSimulatorSection } from "./SiteCreditSimulatorSection";
import { SiteAboutSection } from "./SiteAboutSection";
import { PropertyCardData } from "./PropertyProductCard";

type SubTab = "HERO" | "VITRINE" | "CREDITO" | "SOBRE" | "GERAL" | "APARENCIA" | "QUEM_SOU" | "CONTATO" | "PIXEL" | "LEGAL";

interface SiteSettingsTabProps {
  properties?: PropertyCardData[];
  onToggleLandingPage?: (id: string, current: boolean) => Promise<void>;
  onOpenEditImage?: (property: PropertyCardData) => void;
}

export function SiteSettingsTab({
  properties = [],
  onToggleLandingPage = async () => {},
  onOpenEditImage = () => {},
}: SiteSettingsTabProps) {
  const { setActionMessage } = useCrm();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("HERO");
  const [siteAtivo, setSiteAtivo] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados das configurações do site
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

  // Regras de Simulação de Crédito (Item 27)
  const [simuladorTaxaAnual, setSimuladorTaxaAnual] = useState(0.105);
  const [simuladorPrazoMeses, setSimuladorPrazoMeses] = useState(360);
  const [simuladorComprometimento, setSimuladorComprometimento] = useState(0.3);
  const [simuladorEntradaMinima, setSimuladorEntradaMinima] = useState(0.2);

  // Sobre Nós Editável (Item 28)
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

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/site-settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            const s = data.settings;
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
          }
        }
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
      };

      const res = await fetch("/api/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setActionMessage("Configurações do Site e Hero salvas com sucesso!");
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

  const subTabs = [
    { id: "HERO", label: "Hero & Capa do Site", icon: Sparkles },
    { id: "VITRINE", label: "Imóveis na Vitrine", icon: Building2 },
    { id: "CREDITO", label: "Simulador de Crédito", icon: Calculator },
    { id: "SOBRE", label: "Sobre Nós", icon: Users },
    { id: "GERAL", label: "Identidade & SEO", icon: Globe },
    { id: "APARENCIA", label: "Cores & Tema", icon: Palette },
    { id: "QUEM_SOU", label: "Quem Sou Eu", icon: User },
    { id: "CONTATO", label: "Canais Oficiais", icon: Phone },
    { id: "PIXEL", label: "Pixel Facebook", icon: Code },
    { id: "LEGAL", label: "CRECI & Legal", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header de Configurações com Switch e Botão Salvar (Seção 5.6) */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-connect-blue" />
            Editor do Site & Landing Page Pública
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personalize a imagem da capa do Hero, chamadas de impacto e catálogo de imóveis exibidos na vitrine.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-muted-foreground">Site Online</span>
            <button
              type="button"
              role="switch"
              aria-checked={siteAtivo}
              onClick={() => setSiteAtivo(!siteAtivo)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-connect-blue ${
                siteAtivo ? "bg-connect-blue" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  siteAtivo ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            <span>Ver no Ar</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-connect-blue hover:bg-[#0D478F] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-md shadow-connect-blue/20 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>

      {/* 2. Sub-tabs horizontais no estilo shadcn TabsList */}
      <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1 overflow-x-auto border border-border/50">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? "bg-card text-foreground shadow-sm border border-border/70"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-connect-blue" : ""}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Conteúdo da Sub-aba Ativa */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {activeSubTab === "HERO" && (
          <SiteHeroEditorSection
            heroImage={heroImage}
            setHeroImage={setHeroImage}
            heroTitle={heroTitle}
            setHeroTitle={setHeroTitle}
            heroHighlight={heroHighlight}
            setHeroHighlight={setHeroHighlight}
            heroSubtitle={heroSubtitle}
            setHeroSubtitle={setHeroSubtitle}
          />
        )}

        {activeSubTab === "VITRINE" && (
          <SiteVitrineManagerSection
            properties={properties}
            onToggleLandingPage={onToggleLandingPage}
            onOpenEditImage={onOpenEditImage}
          />
        )}

        {activeSubTab === "CREDITO" && (
          <SiteCreditSimulatorSection
            taxaAnual={simuladorTaxaAnual}
            setTaxaAnual={setSimuladorTaxaAnual}
            prazoMeses={simuladorPrazoMeses}
            setPrazoMeses={setSimuladorPrazoMeses}
            comprometimento={simuladorComprometimento}
            setComprometimento={setSimuladorComprometimento}
            entradaMinima={simuladorEntradaMinima}
            setEntradaMinima={setSimuladorEntradaMinima}
          />
        )}

        {activeSubTab === "SOBRE" && (
          <SiteAboutSection
            sobreTitulo={sobreTitulo}
            setSobreTitulo={setSobreTitulo}
            sobreSubtitulo={sobreSubtitulo}
            setSobreSubtitulo={setSobreSubtitulo}
            sobreTexto={sobreTexto}
            setSobreTexto={setSobreTexto}
            sobreEstatistica1Valor={sobreEstatistica1Valor}
            setSobreEstatistica1Valor={setSobreEstatistica1Valor}
            sobreEstatistica1Rotulo={sobreEstatistica1Rotulo}
            setSobreEstatistica1Rotulo={setSobreEstatistica1Rotulo}
            sobreEstatistica2Valor={sobreEstatistica2Valor}
            setSobreEstatistica2Valor={setSobreEstatistica2Valor}
            sobreEstatistica2Rotulo={sobreEstatistica2Rotulo}
            setSobreEstatistica2Rotulo={setSobreEstatistica2Rotulo}
            sobreEstatistica3Valor={sobreEstatistica3Valor}
            setSobreEstatistica3Valor={setSobreEstatistica3Valor}
            sobreEstatistica3Rotulo={sobreEstatistica3Rotulo}
            setSobreEstatistica3Rotulo={setSobreEstatistica3Rotulo}
          />
        )}

        {activeSubTab === "GERAL" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Identidade & SEO do Site</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Título da Página (SEO Title)
                </label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Slogan Institucional
                </label>
                <input
                  type="text"
                  value={siteSlogan}
                  onChange={(e) => setSiteSlogan(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "APARENCIA" && (
          <SiteAppearanceSection
            themePreset={themePreset}
            setThemePreset={setThemePreset}
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
            secondaryColor={secondaryColor}
            setSecondaryColor={setSecondaryColor}
          />
        )}

        {["QUEM_SOU", "CONTATO", "PIXEL", "LEGAL"].includes(activeSubTab) && (
          <SiteContactBioSection
            type={activeSubTab as "QUEM_SOU" | "CONTATO" | "PIXEL" | "LEGAL"}
            corretorNome={corretorNome}
            setCorretorNome={setCorretorNome}
            whatsapp={whatsapp}
            setWhatsapp={setWhatsapp}
            email={email}
            setEmail={setEmail}
            pixelId={pixelId}
            setPixelId={setPixelId}
            creci={creci}
            setCreci={setCreci}
          />
        )}
      </div>
    </div>
  );
}
