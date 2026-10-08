"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, KeyRound, Users2, Activity } from "lucide-react";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { AuditLogEntry } from "@/lib/services/auditLogger";

interface AuditStatCardsProps {
  logs: AuditLogEntry[];
}

export function AuditStatCards({ logs }: AuditStatCardsProps) {
  const totalEventos = logs.length;
  const acoesCriticas = logs.filter(
    (l) =>
      l.tipoAcao === "DELETE" ||
      l.tipoAcao === "PASSWORD_CHANGE" ||
      l.modulo === "FLUXO_DE_CAIXA" ||
      l.modulo === "CONFIGURACOES"
  ).length;
  const loginsRecentes = logs.filter((l) => l.tipoAcao === "LOGIN").length;

  const uniqueUsers = new Set(logs.map((l) => l.usuario.email)).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total de Registros */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Total de Registros
          </span>
          <div className="text-2xl font-black text-foreground mt-0.5">
            <CountUpNumber value={totalEventos} />
          </div>
          <span className="text-[11px] text-muted-foreground">Trilha de eventos 100% ativa</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-connect-blue/10 text-connect-blue flex items-center justify-center">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Ações Sensíveis */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Ações Sensíveis
          </span>
          <div className="text-2xl font-black text-amber-500 mt-0.5">
            <CountUpNumber value={acoesCriticas} />
          </div>
          <span className="text-[11px] text-muted-foreground">Exclusões e configurações</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Logins Registrados */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Acessos / Logins
          </span>
          <div className="text-2xl font-black text-emerald-500 mt-0.5">
            <CountUpNumber value={loginsRecentes} />
          </div>
          <span className="text-[11px] text-muted-foreground">Sessões autenticadas</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <KeyRound className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Usuários Monitorados */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Usuários com Ações
          </span>
          <div className="text-2xl font-black text-connect-blue mt-0.5">
            <CountUpNumber value={uniqueUsers} />
          </div>
          <span className="text-[11px] text-muted-foreground">Colaboradores ativos</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-platz-gold/15 text-platz-gold flex items-center justify-center">
          <Users2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
