"use client";

import React, { useState } from "react";
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
  LayoutGrid,
} from "lucide-react";
import { SiteAppearanceSection } from "./SiteAppearanceSection";
import { SiteHeroEditorSection } from "./SiteHeroEditorSection";
import { SiteVitrineManagerSection } from "./SiteVitrineManagerSection";
import { SiteVitrineShowcaseSection } from "./SiteVitrineShowcaseSection";
import { SiteContactBioSection } from "./SiteContactBioSection";
import { SiteCreditSimulatorSection } from "./SiteCreditSimulatorSection";
import { SiteAboutSection } from "./SiteAboutSection";
import { useSiteSettingsEditor } from "./useSiteSettingsEditor";
import { PropertyCardData } from "./PropertyProductCard";

type SubTab =
  | "HERO"
  | "CATEGORIAS"
  | "VITRINE"
  | "CREDITO"
  | "SOBRE"
  | "GERAL"
  | "APARENCIA"
  | "QUEM_SOU"
  | "CONTATO"
  | "PIXEL"
  | "LEGAL";

interface SiteSettingsTabProps {
  properties?: PropertyCardData[];
  onToggleLandingPage?: (id: string, current: boolean) => Promise<void>;
  onOpenEditImage?: (property: PropertyCardData) => void;
}

const SUB_TABS: { id: SubTab; label: string; icon: React.ElementType }[] = [
  { id: "HERO", label: "Hero & Capa do Site", icon: Sparkles },
  { id: "CATEGORIAS", label: "Vitrine de Capítulos", icon: LayoutGrid },
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

export function SiteSettingsTab({
  properties = [],
  onToggleLandingPage = async () => {},
  onOpenEditImage = () => {},
}: SiteSettingsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("HERO");
  const editor = useSiteSettingsEditor();

  return (
    <div className="space-y-6">
      {/* 1. Header de Configurações com Switch e Botão Salvar */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-connect-blue" />
            Editor do Site & Landing Page Pública
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personalize a capa do Hero, a vitrine de capítulos com imóveis reais e os canais públicos do portal.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-muted-foreground">Site Online</span>
            <button
              type="button"
              role="switch"
              aria-checked={editor.siteAtivo}
              onClick={() => editor.setSiteAtivo(!editor.siteAtivo)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-connect-blue ${
                editor.siteAtivo ? "bg-connect-blue" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  editor.siteAtivo ? "translate-x-5" : "translate-x-0"
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
            type="button"
            onClick={editor.handleSave}
            disabled={editor.saving}
            className="bg-connect-blue hover:bg-[#0D478F] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-md shadow-connect-blue/20 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {editor.saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>

      {/* 2. Sub-tabs horizontais no estilo shadcn TabsList */}
      <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1 overflow-x-auto border border-border/50">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
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
            heroImage={editor.heroImage}
            setHeroImage={editor.setHeroImage}
            heroTitle={editor.heroTitle}
            setHeroTitle={editor.setHeroTitle}
            heroHighlight={editor.heroHighlight}
            setHeroHighlight={editor.setHeroHighlight}
            heroSubtitle={editor.heroSubtitle}
            setHeroSubtitle={editor.setHeroSubtitle}
          />
        )}

        {activeSubTab === "CATEGORIAS" && (
          <SiteVitrineShowcaseSection
            vitrineSubtitulo={editor.vitrineSubtitulo}
            setVitrineSubtitulo={editor.setVitrineSubtitulo}
            vitrineTitulo={editor.vitrineTitulo}
            setVitrineTitulo={editor.setVitrineTitulo}
            vitrineCards={editor.vitrineCards}
            setVitrineCards={editor.setVitrineCards}
            properties={properties}
            onToggleLandingPage={onToggleLandingPage}
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
            taxaAnual={editor.simuladorTaxaAnual}
            setTaxaAnual={editor.setSimuladorTaxaAnual}
            prazoMeses={editor.simuladorPrazoMeses}
            setPrazoMeses={editor.setSimuladorPrazoMeses}
            comprometimento={editor.simuladorComprometimento}
            setComprometimento={editor.setSimuladorComprometimento}
            entradaMinima={editor.simuladorEntradaMinima}
            setEntradaMinima={editor.setSimuladorEntradaMinima}
          />
        )}

        {activeSubTab === "SOBRE" && (
          <SiteAboutSection
            sobreTitulo={editor.sobreTitulo}
            setSobreTitulo={editor.setSobreTitulo}
            sobreSubtitulo={editor.sobreSubtitulo}
            setSobreSubtitulo={editor.setSobreSubtitulo}
            sobreTexto={editor.sobreTexto}
            setSobreTexto={editor.setSobreTexto}
            sobreEstatistica1Valor={editor.sobreEstatistica1Valor}
            setSobreEstatistica1Valor={editor.setSobreEstatistica1Valor}
            sobreEstatistica1Rotulo={editor.sobreEstatistica1Rotulo}
            setSobreEstatistica1Rotulo={editor.setSobreEstatistica1Rotulo}
            sobreEstatistica2Valor={editor.sobreEstatistica2Valor}
            setSobreEstatistica2Valor={editor.setSobreEstatistica2Valor}
            sobreEstatistica2Rotulo={editor.sobreEstatistica2Rotulo}
            setSobreEstatistica2Rotulo={editor.setSobreEstatistica2Rotulo}
            sobreEstatistica3Valor={editor.sobreEstatistica3Valor}
            setSobreEstatistica3Valor={editor.setSobreEstatistica3Valor}
            sobreEstatistica3Rotulo={editor.sobreEstatistica3Rotulo}
            setSobreEstatistica3Rotulo={editor.setSobreEstatistica3Rotulo}
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
                  value={editor.siteTitle}
                  onChange={(e) => editor.setSiteTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Slogan Institucional
                </label>
                <input
                  type="text"
                  value={editor.siteSlogan}
                  onChange={(e) => editor.setSiteSlogan(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "APARENCIA" && (
          <SiteAppearanceSection
            themePreset={editor.themePreset}
            setThemePreset={editor.setThemePreset}
            primaryColor={editor.primaryColor}
            setPrimaryColor={editor.setPrimaryColor}
            secondaryColor={editor.secondaryColor}
            setSecondaryColor={editor.setSecondaryColor}
          />
        )}

        {["QUEM_SOU", "CONTATO", "PIXEL", "LEGAL"].includes(activeSubTab) && (
          <SiteContactBioSection
            type={activeSubTab as "QUEM_SOU" | "CONTATO" | "PIXEL" | "LEGAL"}
            corretorNome={editor.corretorNome}
            setCorretorNome={editor.setCorretorNome}
            whatsapp={editor.whatsapp}
            setWhatsapp={editor.setWhatsapp}
            email={editor.email}
            setEmail={editor.setEmail}
            pixelId={editor.pixelId}
            setPixelId={editor.setPixelId}
            creci={editor.creci}
            setCreci={editor.setCreci}
          />
        )}
      </div>
    </div>
  );
}
