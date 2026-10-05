"use client";

import React, { useState, useEffect } from "react";
import {
  UserCircle,
  Building2,
  Sliders,
  Settings,
} from "lucide-react";
import { PageHeader } from "@/components/crm/PageHeader";
import { useCrm } from "@/components/crm/CrmContext";
import { ProfileTab } from "@/components/crm/configuracoes/ProfileTab";
import { AdminGeneralTab } from "@/components/crm/configuracoes/AdminGeneralTab";
import { SlaEngineTab } from "@/components/crm/configuracoes/SlaEngineTab";

type ConfigTab = "perfil" | "geral" | "sla";

const tabList: { id: ConfigTab; label: string; icon: React.ElementType }[] = [
  { id: "perfil", label: "Minha Conta", icon: UserCircle },
  { id: "geral", label: "Administração", icon: Building2 },
  { id: "sla", label: "Regras de SLA", icon: Sliders },
];

export default function ConfiguracoesPage() {
  const { user } = useCrm();
  const [activeTab, setActiveTab] = useState<ConfigTab>("perfil");

  // RBAC: Corretor não tem acesso à administração ou regras de SLA
  const isAdminOrDirector = user?.role === "ADMINISTRADOR" || user?.role === "DIRETOR";
  const availableTabs = isAdminOrDirector
    ? tabList
    : tabList.filter((t) => t.id === "perfil");

  // Sincroniza com hash da URL (#perfil, #geral, #sla)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "") as ConfigTab;
      if (availableTabs.some((t) => t.id === hash)) {
        setActiveTab(hash);
      } else {
        // Força corretor a ficar restrito em Minha Conta / Perfil
        setActiveTab("perfil");
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [isAdminOrDirector]);

  const handleTabChange = (id: ConfigTab) => {
    setActiveTab(id);
    window.location.hash = id;
  };

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO PADRÃO HABITUS (5.2) */}
      <PageHeader
        title={isAdminOrDirector ? "Configurações do Sistema" : "Minha Conta & Perfil"}
        subtitle={
          isAdminOrDirector
            ? "Gerencie seu perfil de corretor, dados corporativos e regras de SLA da equipe."
            : "Gerencie suas informações profissionais, CRECI individual e preferências de notificação."
        }
      />

      {/* 2. BARRA DE ABAS SHADCN / RADIX STYLE (Apenas exibida se houver abas de gestão) */}
      {availableTabs.length > 1 && (
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl overflow-x-auto select-none border border-border">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-connect-blue" : "text-muted-foreground"
                  }`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. CONTEÚDO DAS ABAS */}
      <div className="transition-opacity duration-300">
        {activeTab === "perfil" && <ProfileTab />}
        {isAdminOrDirector && activeTab === "geral" && <AdminGeneralTab />}
        {isAdminOrDirector && activeTab === "sla" && <SlaEngineTab />}
      </div>
    </div>
  );
}
