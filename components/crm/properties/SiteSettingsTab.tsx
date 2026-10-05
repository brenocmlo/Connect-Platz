"use client";

import React, { useState } from "react";
import {
  Globe,
  Palette,
  User,
  Megaphone,
  Phone,
  Code,
  Shield,
  Save,
  ExternalLink,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { SiteAppearanceSection } from "./SiteAppearanceSection";

type SubTab = "GERAL" | "APARENCIA" | "QUEM_SOU" | "CTA" | "CONTATO" | "PIXEL" | "LEGAL";

export function SiteSettingsTab() {
  const { setActionMessage } = useCrm();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("GERAL");
  const [siteAtivo, setSiteAtivo] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [themePreset, setThemePreset] = useState("connect-blue");
  const [primaryColor, setPrimaryColor] = useState("#1266C7");
  const [secondaryColor, setSecondaryColor] = useState("#D9BB4C");
  const [siteTitle, setSiteTitle] = useState("Connect Platz Imóveis & Veraneio");
  const [siteSlogan, setSiteSlogan] = useState("Os melhores lançamentos e imóveis no Ceará");
  const [corretorNome, setCorretorNome] = useState("Connect Platz Negócios Imobiliários");
  const [creci, setCreci] = useState("CRECI 12345-J");
  const [whatsapp, setWhatsapp] = useState("(85) 99999-0001");
  const [email, setEmail] = useState("contato@connectplatz.com.br");
  const [pixelId, setPixelId] = useState("");
  const [heroTitle, setHeroTitle] = useState("Encontre o imóvel dos seus sonhos!");
  const [heroSubtitle, setHeroSubtitle] = useState("Apartamentos, casas em condomínio e opções de veraneio exclusivas.");

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setActionMessage("Configurações do Site Vitrine salvas com sucesso!");
      setTimeout(() => setActionMessage(null), 3000);
    }, 600);
  };

  const subTabs = [
    { id: "GERAL", label: "Geral", icon: Globe },
    { id: "APARENCIA", label: "Aparência", icon: Palette },
    { id: "QUEM_SOU", label: "Quem Sou Eu", icon: User },
    { id: "CTA", label: "CTA & Hero", icon: Megaphone },
    { id: "CONTATO", label: "Contato", icon: Phone },
    { id: "PIXEL", label: "Pixel Facebook", icon: Code },
    { id: "LEGAL", label: "Legal & CRECI", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header de Configurações com Switch e Botão Salvar (Seção 5.6) */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-connect-blue" />
            Configurações do Site Vitrine / Landing Page
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personalize a identidade visual, chamadas para ação e informações de contato exibidas para seus clientes.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Switch Site Ativo */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-muted-foreground">Site Ativo</span>
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
            <span>Ver Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Botão Salvar Alterações */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-connect-blue hover:bg-[#0D478F] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-md shadow-connect-blue/20 transition-all hover:scale-105"
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
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Domínio Personalizado
                </label>
                <input
                  type="text"
                  placeholder="imoveis.suaempresa.com.br"
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

        {activeSubTab === "QUEM_SOU" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Apresentação da Imobiliária / Corretor</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={corretorNome}
                  onChange={(e) => setCorretorNome(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Biografia / Apresentação Institucional
                </label>
                <textarea
                  rows={4}
                  defaultValue="Especialistas em intermediação de imóveis de alto padrão, lançamentos na planta e investimentos imobiliários com segurança jurídica e atendimento personalizado."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "CTA" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Dobra Principal (Hero & Chamadas)</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Título de Impacto no Hero
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Subtítulo Explicativo
                </label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "CONTATO" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Canais Oficiais de Atendimento</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  WhatsApp Oficial para Leads
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  E-mail de Contato
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "PIXEL" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Rastreamento de Tráfego e Anúncios</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  ID do Meta Pixel (Facebook Ads)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 123456789012345"
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Os eventos PageView, ViewContent e Contact serão disparados automaticamente nas visitas ao site.
              </p>
            </div>
          </div>
        )}

        {activeSubTab === "LEGAL" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Conformidade e Registro Profissional</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Número do CRECI
                </label>
                <input
                  type="text"
                  value={creci}
                  onChange={(e) => setCreci(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
