"use client";

import React, { useState } from "react";
import { Users2, Activity, CalendarCheck, Edit3, Repeat, StickyNote, ShieldCheck, Trophy } from "lucide-react";
import { SegmentedToggle, ToggleOption } from "@/components/crm/primitives/SegmentedToggle";
import { EmptyState } from "@/components/crm/primitives/EmptyState";
import { useCrm } from "@/components/crm/CrmContext";
import type { ActivityItem, DashboardData } from "./types";
import { formatCompactBRL, initials, relativeTime } from "./format";

type RoleScope = "corretores" | "gerentes";

const roleOptions: ToggleOption<RoleScope>[] = [
  { value: "corretores", label: "Corretores" },
  { value: "gerentes", label: "Gerentes" },
];

function activityIcon(item: ActivityItem): { icon: React.ElementType; color: string } {
  if (item.origem === "auditoria") return { icon: ShieldCheck, color: "text-platz-gold bg-platz-gold/10" };
  switch (item.tipo) {
    case "status_change":
      return { icon: Edit3, color: "text-connect-blue bg-connect-blue/10" };
    case "visita":
      return { icon: CalendarCheck, color: "text-emerald-500 bg-emerald-500/10" };
    case "transbordo":
      return { icon: Repeat, color: "text-amber-500 bg-amber-500/10" };
    default:
      return { icon: StickyNote, color: "text-sky-500 bg-sky-500/10" };
  }
}

interface TeamPerformanceAndActivityProps {
  team: DashboardData["team"];
  activities: ActivityItem[];
  periodLabel: string;
}

/** Performance da Equipe + Atividades Recentes (5.3 item 9). */
export function TeamPerformanceAndActivity({ team, activities, periodLabel }: TeamPerformanceAndActivityProps) {
  const [roleScope, setRoleScope] = useState<RoleScope>("corretores");
  const { hideValues } = useCrm();
  const members = team ? team[roleScope] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* PERFORMANCE DA EQUIPE */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-connect-blue/10 text-connect-blue flex items-center justify-center">
              <Users2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Performance da Equipe</h3>
              <p className="text-xs text-muted-foreground">VGV e vendas • {periodLabel}</p>
            </div>
          </div>
          {team && <SegmentedToggle options={roleOptions} value={roleScope} onChange={setRoleScope} size="sm" />}
        </div>

        {!team ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-6 rounded-xl border border-dashed border-border bg-muted/30">
            <Trophy className="w-6 h-6 text-platz-gold" />
            <p className="text-xs text-muted-foreground max-w-xs">
              A comparação entre colaboradores fica disponível para gestores. Acompanhe sua posição no Ranking.
            </p>
            <a href="/crm/ranking" className="text-xs font-semibold text-connect-blue hover:underline">
              Ver Ranking
            </a>
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users2}
            title="Sem vendas no período"
            description="Os colaboradores com vendas registradas aparecerão ranqueados aqui."
            className="flex-1"
          />
        ) : (
          <div className="space-y-2.5">
            {members.map((member, idx) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 border border-border/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-card border border-border text-[10px] font-bold text-muted-foreground flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  {member.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-connect-blue/15 text-connect-blue font-bold text-[10px] flex items-center justify-center shrink-0">
                      {initials(member.nome)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-foreground block leading-tight truncate">{member.nome}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {member.vendas} {member.vendas === 1 ? "venda fechada" : "vendas fechadas"}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-connect-blue block">
                    {hideValues ? "••••••••" : formatCompactBRL(member.vgv)}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold">VGV Gerado</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ATIVIDADES RECENTES */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Atividades Recentes</h3>
            <p className="text-xs text-muted-foreground">Histórico dos leads e eventos auditados</p>
          </div>
        </div>

        {activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Nenhuma atividade registrada"
            description="Mudanças de etapa, notas e ações auditadas aparecerão aqui."
            className="flex-1"
          />
        ) : (
          <div className="space-y-3">
            {activities.map((act) => {
              const { icon: Icon, color } = activityIcon(act);
              return (
                <div
                  key={act.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 border border-border/50 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground">{act.titulo}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                        {act.descricao}
                        {act.autor ? ` • Por: ${act.autor}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium flex-shrink-0 whitespace-nowrap">
                    {relativeTime(act.criadoEm)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
