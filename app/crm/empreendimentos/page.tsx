"use client";

import React, { useState, useEffect } from "react";
import { Building2, Globe, Plus, ExternalLink } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { PageHeader } from "@/components/crm/PageHeader";
import { PropertyStatCards } from "@/components/crm/properties/PropertyStatCards";
import { PropertyListSection } from "@/components/crm/properties/PropertyListSection";
import { SiteSettingsTab } from "@/components/crm/properties/SiteSettingsTab";
import { PropertyCardData } from "@/components/crm/properties/PropertyProductCard";
import { PropertyDetailsModal } from "@/components/crm/properties/PropertyDetailsModal";
import { PublishLandingModal } from "@/components/crm/properties/PublishLandingModal";
import { PropertyMaterialsModal } from "@/components/crm/properties/PropertyMaterialsModal";
import { NewEmpreendimentoModal } from "@/components/crm/properties/NewEmpreendimentoModal";
import { NewImovelAvulsoModal } from "@/components/crm/properties/NewImovelAvulsoModal";
import { EditPropertyImageModal } from "@/components/crm/properties/EditPropertyImageModal";

export default function EmpreendimentosPage() {
  const { user, setActionMessage } = useCrm();
  const canManage = user?.role === "ADMINISTRADOR";
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<"LISTA" | "CONFIG_SITE">("LISTA");
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [selectedDetailsProperty, setSelectedDetailsProperty] = useState<PropertyCardData | null>(null);
  const [publishModalProperty, setPublishModalProperty] = useState<PropertyCardData | null>(null);
  const [materialsProperty, setMaterialsProperty] = useState<PropertyCardData | null>(null);
  const [editImageProperty, setEditImageProperty] = useState<PropertyCardData | null>(null);
  const [isNewEmpModalOpen, setIsNewEmpModalOpen] = useState(false);
  const [isNewAvulsoModalOpen, setIsNewAvulsoModalOpen] = useState(false);

  const notify = (msg: string, ms = 3500) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), ms);
  };

  const readError = async (res: Response, fallback: string) =>
    ((await res.json().catch(() => null)) as { error?: string } | null)?.error || fallback;

  const loadProperties = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await fetch("/api/properties", { cache: "no-store" });
      if (!res.ok) throw new Error(await readError(res, "Não foi possível carregar o catálogo."));
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err: any) {
      console.error("Erro ao carregar propriedades:", err);
      setLoadError(err.message || "Não foi possível carregar o catálogo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Atualização otimista: aplica, chama a API e desfaz em caso de erro
  const handleToggleLandingPage = async (id: string, current: boolean) => {
    if (!canManage) return notify("Apenas administradores podem alterar a vitrine.");
    const apply = (value: boolean) => {
      setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, exibirNaLandingPage: value } : p)));
      setPublishModalProperty((prev) => (prev && prev.id === id ? { ...prev, exibirNaLandingPage: value } : prev));
    };
    apply(!current);
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exibirNaLandingPage: !current }),
      });
      if (!res.ok) throw new Error(await readError(res, "Não foi possível alterar a vitrine."));
      notify(!current ? "Imóvel publicado na vitrine com sucesso!" : "Imóvel ocultado da vitrine.");
    } catch (err: any) {
      apply(current);
      notify(err.message || "Não foi possível alterar a vitrine.");
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!canManage) return notify("Apenas administradores podem excluir imóveis.");
    if (!confirm("Deseja realmente remover este imóvel do catálogo?")) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res, "Não foi possível excluir o imóvel."));
      const data = await res.json();
      // Desativado (vendas vinculadas) ou excluído: em ambos os casos sai do catálogo ativo
      setProperties((prev) => prev.filter((p) => p.id !== id));
      notify(data.deactivated ? data.message : "Imóvel excluído com sucesso!", data.deactivated ? 6000 : 3000);
    } catch (err: any) {
      notify(err.message || "Não foi possível excluir o imóvel.");
    }
  };

  // Métricas reais do catálogo (Seção 5.6) — sem valores de exemplo
  const empreendimentos = properties.filter((p) => p.tipoCadastro !== "AVULSO");
  const totalEmpreendimentos = empreendimentos.length;
  const totalAtivos = properties.filter((p) => p.exibirNaLandingPage !== false).length;
  const totalConstrutoras = new Set(
    properties.map((p) => (p.construtora || "").trim().toLowerCase()).filter(Boolean)
  ).size;
  const totalVgv = properties.reduce((acc, p) => acc + (Number(p.valorVenda) || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* 1. Header do Catálogo com botão tint Ver Site e CTA (Seção 5.6) */}
      <PageHeader
        title="Empreendimentos & Catálogo"
        subtitle="Gerencie lançamentos, condomínios, materiais de vendas e presença na vitrine pública."
        actionLabel={canManage ? "Novo Empreendimento" : undefined}
        onActionClick={canManage ? () => setIsNewEmpModalOpen(true) : undefined}
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
          {canManage && (
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
          )}
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
      ) : loadError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 py-12 text-center text-xs">
          <p className="font-semibold text-red-600 dark:text-red-400">{loadError}</p>
          <button
            type="button"
            onClick={loadProperties}
            className="rounded-lg bg-connect-blue px-4 py-2 font-bold text-white transition-all hover:scale-[1.02]"
          >
            Tentar novamente
          </button>
        </div>
      ) : activeMainTab === "LISTA" || !canManage ? (
        <PropertyListSection
          properties={properties}
          onOpenDetails={(prop) => setSelectedDetailsProperty(prop)}
          onOpenPublishModal={(prop) => setPublishModalProperty(prop)}
          onOpenMaterials={(prop) => setMaterialsProperty(prop)}
          onOpenEditImage={(prop) => setEditImageProperty(prop)}
          onOpenNewEmpModal={canManage ? () => setIsNewEmpModalOpen(true) : undefined}
          onOpenNewAvulsoModal={canManage ? () => setIsNewAvulsoModalOpen(true) : undefined}
          onToggleLandingPage={handleToggleLandingPage}
          onDeleteProperty={canManage ? handleDeleteProperty : undefined}
        />
      ) : (
        <SiteSettingsTab
          properties={properties}
          onToggleLandingPage={handleToggleLandingPage}
          onOpenEditImage={(prop) => setEditImageProperty(prop)}
        />
      )}

      {/* 5. Modais */}
      <NewEmpreendimentoModal
        isOpen={isNewEmpModalOpen}
        onClose={() => setIsNewEmpModalOpen(false)}
        onSuccess={() => {
          loadProperties();
          notify("Empreendimento cadastrado com sucesso!", 4000);
        }}
      />

      <NewImovelAvulsoModal
        isOpen={isNewAvulsoModalOpen}
        onClose={() => setIsNewAvulsoModalOpen(false)}
        onSuccess={() => {
          loadProperties();
          notify("Imóvel avulso cadastrado com sucesso!", 4000);
        }}
      />

      <EditPropertyImageModal
        isOpen={Boolean(editImageProperty)}
        onClose={() => setEditImageProperty(null)}
        property={editImageProperty}
        onSuccess={(updated) => {
          setProperties((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          );
          notify("Foto de capa do imóvel atualizada com sucesso!");
        }}
      />

      <PropertyDetailsModal
        property={selectedDetailsProperty}
        onClose={() => setSelectedDetailsProperty(null)}
        onOpenMaterials={(prop) => setMaterialsProperty(prop)}
      />

      <PublishLandingModal
        isOpen={Boolean(publishModalProperty)}
        onClose={() => setPublishModalProperty(null)}
        property={publishModalProperty}
        onToggleLandingPage={handleToggleLandingPage}
      />

      <PropertyMaterialsModal
        isOpen={Boolean(materialsProperty)}
        onClose={() => setMaterialsProperty(null)}
        property={materialsProperty}
      />
    </div>
  );
}
