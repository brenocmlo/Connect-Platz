"use client";

import React from "react";
import { Layers } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { IntegrationsSection } from "@/components/crm/integracoes/IntegrationsSection";
import { AccessDeniedCard } from "@/components/crm/AccessDeniedCard";

export default function IntegracoesPage() {
  const { user } = useCrm();

  if (user && user.role === "CORRETOR") {
    return <AccessDeniedCard moduleName="os Canais e Integrações de Portais" />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-connect-blue/10 dark:bg-connect-blue/15 border border-connect-blue/20 dark:border-connect-blue/30 text-connect-blue">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Canais & Integrações
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conexão com Meta Ads, Google Ads, portais imobiliários e webhooks em tempo real.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1F2937] text-slate-600 dark:text-slate-300">
              Sincronização 100% Determinística
        </span>
      </div>

      {/* 2. Seção Modular de Integrações */}
      <IntegrationsSection />
    </div>
  );
}
