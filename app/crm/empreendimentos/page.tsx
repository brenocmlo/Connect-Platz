"use client";

import React, { useState, useEffect } from "react";
import { Building2, Globe, Plus, ExternalLink } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { PageHeader } from "@/components/crm/PageHeader";
import { PropertyStatCards } from "@/components/crm/properties/PropertyStatCards";
import { PropertyListSection } from "@/components/crm/properties/PropertyListSection";
import { SiteSettingsTab } from "@/components/crm/properties/SiteSettingsTab";
import { PropertyCardData } from "@/components/crm/properties/PropertyProductCard";
import { EspelhoVendasModal, EmpreendimentoData } from "@/components/crm/properties/EspelhoVendasModal";
import { PublishLandingModal } from "@/components/crm/properties/PublishLandingModal";
import { NewEmpreendimentoModal } from "@/components/crm/properties/NewEmpreendimentoModal";
import { NewImovelAvulsoModal } from "@/components/crm/properties/NewImovelAvulsoModal";

export default function EmpreendimentosPage() {
  const { setActionMessage } = useCrm();
  const [activeMainTab, setActiveMainTab] = useState<"LISTA" | "CONFIG_SITE">("LISTA");
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [selectedEspelhoProperty, setSelectedEspelhoProperty] = useState<EmpreendimentoData | null>(null);
  const [publishModalProperty, setPublishModalProperty] = useState<PropertyCardData | null>(null);
  const [isNewEmpModalOpen, setIsNewEmpModalOpen] = useState(false);
  const [isNewAvulsoModalOpen, setIsNewAvulsoModalOpen] = useState(false);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/properties");
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error("Erro ao carregar propriedades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleToggleLandingPage = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exibirNaLandingPage: !current }),
      });

      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, exibirNaLandingPage: !current } : p
          )
        );
        if (publishModalProperty && publishModalProperty.id === id) {
          setPublishModalProperty((prev) =>
            prev ? { ...prev, exibirNaLandingPage: !current } : null
          );
        }
        setActionMessage(
          !current
            ? "Imóvel ATIVADO na Landing Page com sucesso!"
            : "Imóvel OCULTADO da Landing Page."
        );
        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Deseja realmente remover este imóvel do catálogo?")) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        setActionMessage("Imóvel removido com sucesso!");
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cálculos de métricas da Seção 5.6
  const empreendimentos = properties.filter((p) => p.tipoCadastro !== "AVULSO");
  const totalEmpreendimentos = empreendimentos.length || 8;
  const totalAtivos = properties.filter((p) => p.exibirNaLandingPage !== false).length || 6;
  const totalConstrutoras = Math.max(
    4,
    new Set(properties.map((p) => p.construtora || p.bairro)).size
  );
  const totalVgv = properties.reduce((acc, p) => acc + (Number(p.valorVenda) || 850000), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* 1. Header do Catálogo com botão tint Ver Site e CTA (Seção 5.6) */}
      <PageHeader
        title="Empreendimentos & Catálogo"
        subtitle="Gerencie condomínios, matrizes de andares, espelhos de vendas e presença na Landing Page."
        actionLabel="+ Novo Empreendimento"
        onActionClick={() => setIsNewEmpModalOpen(true)}
      >
        {/* Botão tint 🌐 Ver meu Site (Seção 5.6) */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="bg-connect-blue/10 hover:bg-connect-blue/20 text-connect-blue border border-connect-blue/30 text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Ver meu Site</span>
          <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
        </a>
      </PageHeader>

      {/* 2. Tabs Superiores no Estilo Habitus (Seção 5.6) */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="bg-muted/70 p-1 rounded-xl flex items-center gap-1 border border-border/50">
          <button
            type="button"
            onClick={() => setActiveMainTab("LISTA")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeMainTab === "LISTA"
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="w-4 h-4 text-connect-blue" />
            <span>Lista de Empreendimentos</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab("CONFIG_SITE")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeMainTab === "CONFIG_SITE"
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>Configurações Site</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{totalAtivos} imóveis online na vitrine</span>
        </div>
      </div>

      {/* 3. StatCards de Resumo (Seção 5.6) */}
      <PropertyStatCards
        totalEmpreendimentos={totalEmpreendimentos}
        totalAtivos={totalAtivos}
        totalConstrutoras={totalConstrutoras}
        totalVgv={totalVgv}
      />

      {/* 4. Conteúdo da Aba Ativa */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-connect-blue mx-auto mb-3" />
          Carregando catálogo de empreendimentos...
        </div>
      ) : activeMainTab === "LISTA" ? (
        <PropertyListSection
          properties={properties}
          onOpenDetails={(prop) => setSelectedEspelhoProperty(prop as any)}
          onOpenPublishModal={(prop) => setPublishModalProperty(prop)}
          onOpenNewEmpModal={() => setIsNewEmpModalOpen(true)}
          onOpenNewAvulsoModal={() => setIsNewAvulsoModalOpen(true)}
          onToggleLandingPage={handleToggleLandingPage}
          onDeleteProperty={handleDeleteProperty}
        />
      ) : (
        <SiteSettingsTab />
      )}

      {/* 5. Modais */}
      <NewEmpreendimentoModal
        isOpen={isNewEmpModalOpen}
        onClose={() => setIsNewEmpModalOpen(false)}
        onSuccess={() => {
          loadProperties();
          setActionMessage("Empreendimento cadastrado com sucesso!");
          setTimeout(() => setActionMessage(null), 4000);
        }}
      />

      <NewImovelAvulsoModal
        isOpen={isNewAvulsoModalOpen}
        onClose={() => setIsNewAvulsoModalOpen(false)}
        onSuccess={() => {
          loadProperties();
          setActionMessage("Imóvel avulso cadastrado com sucesso!");
          setTimeout(() => setActionMessage(null), 4000);
        }}
      />

      <EspelhoVendasModal
        property={selectedEspelhoProperty}
        onClose={() => setSelectedEspelhoProperty(null)}
      />

      <PublishLandingModal
        isOpen={Boolean(publishModalProperty)}
        onClose={() => setPublishModalProperty(null)}
        property={publishModalProperty}
        onToggleLandingPage={handleToggleLandingPage}
      />
    </div>
  );
}
