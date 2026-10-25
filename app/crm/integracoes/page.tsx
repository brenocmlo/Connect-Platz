"use client";

import React from "react";
import { Layers } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { IntegrationsSection } from "@/components/crm/integracoes/IntegrationsSection";
import { AccessDeniedCard } from "@/components/crm/AccessDeniedCard";

export default function IntegracoesPage() {
  const { user } = useCrm();

  if (user && user.role === "CORRETOR") {
    return (
      <AccessDeniedCard
        moduleName="os Canais e Integrações de Portais"
        allowedLabel="Administradores"
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-connect-blue/10 border border-connect-blue/20 text-connect-blue">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Canais & Integrações</h1>
            <p className="text-xs text-muted-foreground">
              Webhooks autenticados para Meta Ads, Google Ads, portais imobiliários e landing pages.
            </p>
          </div>
        </div>
      </div>

      <IntegrationsSection />
    </div>
  );
}
