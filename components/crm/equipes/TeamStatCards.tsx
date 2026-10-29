"use client";

import React from "react";
import { Users2, UserCheck, Clock, Crown } from "lucide-react";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { TeamMember, isRoletaEligible } from "./types";

export function TeamStatCards({ team, loading }: { team: TeamMember[]; loading?: boolean }) {
  const cards = [
    { label: "Total de Membros", value: team.length, icon: Users2, cls: "text-foreground", tint: "bg-connect-blue/10 text-connect-blue" },
    {
      label: "Aptos na Roleta",
      value: team.filter(isRoletaEligible).length,
      icon: UserCheck,
      cls: "text-emerald-600 dark:text-emerald-400",
      tint: "bg-emerald-500/10 text-emerald-500",
    },
    {
      label: "Em Visita Externa",
      value: team.filter((m) => m.status === "EM_VISITA").length,
      icon: Clock,
      cls: "text-amber-600 dark:text-amber-400",
      tint: "bg-amber-500/10 text-amber-500",
    },
    {
      label: "Gestão & Financeiro",
      value: team.filter((m) => m.role === "ADMINISTRADOR" || m.role === "FINANCEIRO_VENDA" || m.role === "FINANCEIRO_ALUGUEL").length,
      icon: Crown,
      cls: "text-foreground",
      tint: "bg-platz-gold/15 text-amber-600 dark:text-platz-gold",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-connect-blue/40 transition-colors animate-fade-in-up"
          >
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">{c.label}</span>
              {loading ? (
                <div className="h-7 w-12 mt-1 rounded-md bg-muted animate-pulse" />
              ) : (
                <span className={`text-2xl font-bold mt-1 block ${c.cls}`}>
                  <CountUpNumber value={c.value} />
                </span>
              )}
            </div>
            <div className={`p-2.5 rounded-xl ${c.tint}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
