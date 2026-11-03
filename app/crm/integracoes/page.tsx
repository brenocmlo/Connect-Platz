"use client";

import React, { useState } from "react";
import { Layers, Target } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { IntegrationsSection } from "@/components/crm/integracoes/IntegrationsSection";
import { MetaPixelCapiTab } from "@/components/crm/integracoes/meta/MetaPixelCapiTab";
import { AccessDeniedCard } from "@/components/crm/AccessDeniedCard";

type IntegrationTab = "META_PIXEL" | "WEBHOOKS";

export default function IntegracoesPage() {
  const { user } = useCrm();
  const [activeTab, setActiveTab] = useState<IntegrationTab>("META_PIXEL");

  if (user && user.role !== "ADMINISTRADOR") {
    return (
      <AccessDeniedCard
        moduleName="as Integrações de Tráfego, Pixel e Portais"
        allowedLabel="Administradores"
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header com Título e Rótulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-connect-blue/10 border border-connect-blue/20 text-connect-blue">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Integrações & Rastreamento
            </h1>
            <p className="text-xs text-muted-foreground">
              Meta Pixel, Conversions API (CAPI), Google Analytics 4, UTMs e Webhooks de Portais.
            </p>
          </div>
        </div>

        {/* Tab Pills no padrão Habitus CRM */}
        <div className="flex items-center p-1 bg-muted rounded-xl border border-border/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("META_PIXEL")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "META_PIXEL"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-connect-blue" />
            Meta Pixel & CAPI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("WEBHOOKS")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "WEBHOOKS"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            Canais & Webhooks
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeTab === "META_PIXEL" ? <MetaPixelCapiTab /> : <IntegrationsSection />}
    </div>
  );
}
