"use client";

import React, { useState } from "react";
import { Users2, Activity, CalendarCheck, Edit3, UserMinus } from "lucide-react";
import { SegmentedToggle, ToggleOption } from "@/components/crm/primitives/SegmentedToggle";
import { useCrm } from "@/components/crm/CrmContext";

type TimeScope = "anual" | "mensal" | "semanal";
type RoleScope = "corretores" | "gerentes" | "equipes";

const timeOptions: ToggleOption<TimeScope>[] = [
  { value: "anual", label: "Anual" },
  { value: "mensal", label: "Mensal" },
  { value: "semanal", label: "Semanal" },
];

const roleOptions: ToggleOption<RoleScope>[] = [
  { value: "corretores", label: "Corretores" },
  { value: "gerentes", label: "Gerentes" },
  { value: "equipes", label: "Equipes" },
];

interface TeamMemberItem {
  id: string;
  name: string;
  avatar: string;
  salesCount: number;
  vgv: number;
}

const mockTeamData: TeamMemberItem[] = [
  {
    id: "tm-1",
    name: "Lucas Rocha",
    avatar: "L",
    salesCount: 5,
    vgv: 3850000,
  },
  {
    id: "tm-2",
    name: "Ana Paula Silva",
    avatar: "A",
    salesCount: 4,
    vgv: 2900000,
  },
  {
    id: "tm-3",
    name: "Carlos Eduardo",
    avatar: "C",
    salesCount: 3,
    vgv: 1700000,
  },
];

interface RecentActivityItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  relativeTime: string;
}

const mockActivities: RecentActivityItem[] = [
  {
    id: "act-1",
    title: "Compromisso realizado",
    description: "Visita ao Villa Platz Beach finalizada por Lucas Rocha",
    icon: CalendarCheck,
    iconColor: "text-emerald-500 bg-emerald-500/10",
    relativeTime: "há 10 minutos",
  },
  {
    id: "act-2",
    title: "Lead editado",
    description: "Informações cadastrais de Camila Vasconcelos atualizadas",
    icon: Edit3,
    iconColor: "text-connect-blue bg-connect-blue/10",
    relativeTime: "há 35 minutos",
  },
  {
    id: "act-3",
    title: "Lead resgatado do bolsão",
    description: "Carlos Eduardo assumiu lead Rogério Prado & Família",
    icon: UserMinus,
    iconColor: "text-[#D9BB4C] bg-[#D9BB4C]/10",
    relativeTime: "há 1 hora",
  },
];

export function TeamPerformanceAndActivity() {
  const [timeScope, setTimeScope] = useState<TimeScope>("mensal");
  const [roleScope, setRoleScope] = useState<RoleScope>("corretores");
  const { hideValues } = useCrm();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. PERFORMANCE DA EQUIPE (5.3) */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-connect-blue/10 text-connect-blue flex items-center justify-center">
                <Users2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Performance da Equipe</h3>
                <p className="text-xs text-muted-foreground">Volume de vendas e faturamento VGV</p>
              </div>
            </div>
          </div>

          {/* Toggles duplos (Anual | Mensal | Semanal + Corretores | Gerentes | Equipes) */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <SegmentedToggle
              options={roleOptions}
              value={roleScope}
              onChange={setRoleScope}
              size="sm"
            />
            <SegmentedToggle
              options={timeOptions}
              value={timeScope}
              onChange={setTimeScope}
              variant="primary"
              size="sm"
            />
          </div>

          {/* Lista de Membros */}
          <div className="space-y-2.5">
            {mockTeamData.map((member, idx) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 border border-border/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-card border border-border text-[10px] font-bold text-muted-foreground flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-connect-blue/15 text-connect-blue font-bold text-xs flex items-center justify-center">
                    {member.avatar}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block leading-tight">
                      {member.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {member.salesCount} vendas fechadas
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-connect-blue block">
                    {hideValues ? "••••••••" : `R$ ${(member.vgv / 1000000).toFixed(1)}M`}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold">
                    VGV Gerado
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. ATIVIDADES RECENTES (5.3) */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Atividades Recentes</h3>
                <p className="text-xs text-muted-foreground">Feed de eventos operacionais em tempo real</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {mockActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 border border-border/50 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${act.iconColor}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{act.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-muted-foreground font-medium flex-shrink-0 whitespace-nowrap">
                    {act.relativeTime}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
