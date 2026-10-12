"use client";

import React, { useState, useEffect } from "react";
import {
  UserCircle,
  Building2,
  Sliders,
  Flame,
  BellRing,
} from "lucide-react";
import { PageHeader } from "@/components/crm/PageHeader";
import { useCrm } from "@/components/crm/CrmContext";
import { ProfileTab } from "@/components/crm/configuracoes/ProfileTab";
import { AdminGeneralTab } from "@/components/crm/configuracoes/AdminGeneralTab";
import { SlaEngineTab } from "@/components/crm/configuracoes/SlaEngineTab";
import { ScoreCalibrationTab } from "@/components/crm/configuracoes/ScoreCalibrationTab";
import { PushNotificationCard } from "@/components/crm/configuracoes/PushNotificationCard";

type ConfigTab = "perfil" | "notificacoes" | "geral" | "sla" | "score";

const tabList: { id: ConfigTab; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { id: "perfil", label: "Minha Conta", icon: UserCircle },
  { id: "notificacoes", label: "Notificações PWA", icon: BellRing },
  { id: "geral", label: "Administração", icon: Building2, adminOnly: true },
  { id: "sla", label: "Regras de SLA", icon: Sliders, adminOnly: true },
  { id: "score", label: "Régua de Score", icon: Flame, adminOnly: true },
];

export default function ConfiguracoesPage() {
  const { user } = useCrm();
  const [activeTab, setActiveTab] = useState<ConfigTab>("perfil");

  // RBAC: Corretor tem acesso a Minha Conta e Notificações PWA
  const isAdminOrDirector = user?.role === "ADMINISTRADOR" || user?.role === "DIRETOR";
  const availableTabs = isAdminOrDirector
    ? tabList
    : tabList.filter((t) => !t.adminOnly);

  // Sincroniza com hash da URL (#perfil, #notificacoes, #geral, #sla)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "") as ConfigTab;
      if (availableTabs.some((t) => t.id === hash)) {
        setActiveTab(hash);
      } else {
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
        title={isAdminOrDirector ? "Configurações do Sistema" : "Minha Conta & Preferências"}
        subtitle={
          isAdminOrDirector
            ? "Gerencie seu perfil de corretor, dados corporativos, alertas e regras de SLA da equipe."
            : "Gerencie suas informações profissionais, CRECI individual e alertas PWA em tempo real."
        }
        showHideValuesButton={false}
        showPeriodSelector={false}
        showExportButton={false}
      />

      {/* 2. BARRA DE ABAS SHADCN / RADIX STYLE */}
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
        {activeTab === "notificacoes" && <PushNotificationCard />}
        {isAdminOrDirector && activeTab === "geral" && <AdminGeneralTab />}
        {isAdminOrDirector && activeTab === "sla" && <SlaEngineTab />}
        {isAdminOrDirector && activeTab === "score" && <ScoreCalibrationTab />}
      </div>
    </div>
  );
}
