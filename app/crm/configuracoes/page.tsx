"use client";

import React, { useState, useEffect, useMemo } from "react";
import { UserCircle, Building2, Sliders, Flame, BellRing } from "lucide-react";
import { PageHeader } from "@/components/crm/PageHeader";
import { useCrm } from "@/components/crm/CrmContext";
import { ProfileTab } from "@/components/crm/configuracoes/ProfileTab";
import { AdminGeneralTab } from "@/components/crm/configuracoes/AdminGeneralTab";
import { SlaEngineTab } from "@/components/crm/configuracoes/SlaEngineTab";
import { ScoreCalibrationTab } from "@/components/crm/configuracoes/ScoreCalibrationTab";
import { PushNotificationCard } from "@/components/crm/configuracoes/PushNotificationCard";

type ConfigTab = "perfil" | "notificacoes" | "geral" | "sla" | "score";
type Access = "all" | "admin";

const tabList: { id: ConfigTab; label: string; icon: React.ElementType; access: Access }[] = [
  { id: "perfil", label: "Minha Conta", icon: UserCircle, access: "all" },
  { id: "notificacoes", label: "Notificações PWA", icon: BellRing, access: "all" },
  { id: "geral", label: "Dados da Imobiliária", icon: Building2, access: "admin" },
  { id: "sla", label: "Regras de SLA", icon: Sliders, access: "admin" },
  { id: "score", label: "Régua de Score", icon: Flame, access: "admin" },
];

export default function ConfiguracoesPage() {
  const { user } = useCrm();
  const [activeTab, setActiveTab] = useState<ConfigTab>("perfil");

  // RBAC: Corretor → Minha Conta + preferências locais; Administrador → tudo
  const isAdmin = user?.role === "ADMINISTRADOR";

  const availableTabs = useMemo(
    () => tabList.filter((t) => t.access === "all" || isAdmin),
    [isAdmin]
  );

  // Sincroniza com hash da URL (#perfil, #notificacoes, #geral, #sla, #score)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "") as ConfigTab;
      setActiveTab(availableTabs.some((t) => t.id === hash) ? hash : "perfil");
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [availableTabs]);

  const handleTabChange = (id: ConfigTab) => {
    setActiveTab(id);
    window.location.hash = id;
  };

  const canSee = (id: ConfigTab) => availableTabs.some((t) => t.id === id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "Configurações do Sistema" : "Minha Conta & Preferências"}
        subtitle={
          isAdmin
            ? "Gerencie seu perfil, dados corporativos, alertas e regras de SLA e score da equipe."
            : "Gerencie suas informações profissionais, CRECI individual e alertas PWA."
        }
        showHideValuesButton={false}
        showPeriodSelector={false}
        showExportButton={false}
      />

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
                <Icon className={`w-4 h-4 ${isActive ? "text-connect-blue" : "text-muted-foreground"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="transition-opacity duration-300">
        {activeTab === "perfil" && <ProfileTab />}
        {activeTab === "notificacoes" && <PushNotificationCard />}
        {canSee("geral") && activeTab === "geral" && <AdminGeneralTab />}
        {canSee("sla") && activeTab === "sla" && <SlaEngineTab />}
        {canSee("score") && activeTab === "score" && <ScoreCalibrationTab />}
      </div>
    </div>
  );
}
