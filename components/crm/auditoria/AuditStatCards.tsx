"use client";

import React from "react";
import { AlertTriangle, KeyRound, Users2, Activity } from "lucide-react";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { AuditStats } from "@/lib/services/auditLogger";

interface AuditStatCardsProps {
  stats: AuditStats | null;
  loading?: boolean;
}

const cards = [
  {
    key: "total" as const,
    label: "Total de Registros",
    hint: "Eventos no filtro atual",
    icon: Activity,
    valueClass: "text-foreground",
    iconClass: "bg-connect-blue/10 text-connect-blue",
  },
  {
    key: "sensiveis" as const,
    label: "Ações Sensíveis",
    hint: "Exclusões, senhas e configurações",
    icon: AlertTriangle,
    valueClass: "text-amber-600 dark:text-amber-400",
    iconClass: "bg-amber-500/10 text-amber-500",
  },
  {
    key: "logins" as const,
    label: "Acessos / Logins",
    hint: "Sessões autenticadas",
    icon: KeyRound,
    valueClass: "text-emerald-600 dark:text-emerald-400",
    iconClass: "bg-emerald-500/10 text-emerald-500",
  },
  {
    key: "usuariosComAcoes" as const,
    label: "Usuários com Ações",
    hint: "Colaboradores distintos",
    icon: Users2,
    valueClass: "text-connect-blue",
    iconClass: "bg-platz-gold/15 text-amber-600 dark:text-platz-gold",
  },
];

export function AuditStatCards({ stats, loading }: AuditStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.key}
            className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between hover:border-connect-blue/40 transition-colors animate-fade-in-up"
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                {c.label}
              </span>
              {loading || !stats ? (
                <div className="h-7 w-14 mt-1 rounded-md bg-muted animate-pulse" />
              ) : (
                <div className={`text-2xl font-bold mt-0.5 ${c.valueClass}`}>
                  <CountUpNumber value={stats[c.key]} />
                </div>
              )}
              <span className="text-[11px] text-muted-foreground">{c.hint}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.iconClass}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
