"use client";

import React from "react";
import { Zap, ShieldCheck, UserCheck, PauseCircle, Loader2, Info } from "lucide-react";
import {
  TeamMember,
  MemberStatus,
  STATUS_META,
  isRoletaEligible,
  sortRoletaQueue,
  formatRelative,
} from "./types";

interface RoletaDistributionPanelProps {
  members: TeamMember[];
  pendingId?: string | null;
  onStatusChange: (id: string, newStatus: MemberStatus) => void;
}

/** Fila real da roleta Round-Robin (mesmos critérios do servidor). Sem simulações locais. */
export function RoletaDistributionPanel({ members, pendingId, onStatusChange }: RoletaDistributionPanelProps) {
  const corretores = members.filter(
    (m) =>
      m.role === "CORRETOR_VENDA" ||
      m.role === "CORRETOR_ALUGUEL" ||
      m.role === "CORRETOR"
  );
  const queue = sortRoletaQueue(corretores.filter(isRoletaEligible));
  const outOfQueue = corretores.filter((m) => !isRoletaEligible(m));

  const statusButton = (m: TeamMember, status: MemberStatus, label: string, cls: string) => (
    <button
      type="button"
      disabled={pendingId === m.id}
      onClick={() => onStatusChange(m.id, status)}
      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold border transition-colors disabled:opacity-50 ${cls}`}
    >
      {pendingId === m.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-connect-blue" />
          <h3 className="text-sm font-bold text-foreground">Roleta Round-Robin</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue border border-connect-blue/20">
            100% Determinístico
          </span>
        </div>
        <div className="bg-muted/40 border border-border rounded-xl p-3 text-xs text-muted-foreground flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <strong className="text-foreground">Critério:</strong> corretor ativo, com check-in diário e status
            &quot;Disponível&quot;. O próximo lead vai para quem está há mais tempo sem receber; após receber, o corretor
            vai para o fim da fila.
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-emerald-500" />
          Fila Ativa ({queue.length} {queue.length === 1 ? "apto" : "aptos"})
        </h4>

        {queue.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <Info className="w-5 h-5" />
            Nenhum corretor apto no momento (Disponível + check-in de hoje). Novos leads irão para o Bolsão.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {queue.map((broker, idx) => {
              const isFirst = idx === 0;
              return (
                <div
                  key={broker.id}
                  className={`bg-card border rounded-2xl p-4 shadow-xs space-y-3 transition-all animate-fade-in-up ${
                    isFirst ? "border-connect-blue ring-1 ring-connect-blue/30" : "border-border hover:border-connect-blue/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isFirst ? "bg-connect-blue text-white shadow-xs" : "bg-muted text-muted-foreground font-mono"
                      }`}
                    >
                      {isFirst ? "Próximo da fila" : `${idx + 1}º da fila`}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Disponível
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-connect-blue text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {broker.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h5 className="text-xs font-bold text-foreground truncate">{broker.nome}</h5>
                      <p className="text-[10px] text-muted-foreground">
                        Último lead: {formatRelative(broker.lastLeadAssignedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border text-[11px] flex items-center justify-between">
                    <span className="text-muted-foreground">Leads em carteira</span>
                    <strong className="text-foreground">{broker.leadsAtivos}</strong>
                  </div>

                  <div className="flex gap-1 pt-1">
                    {statusButton(
                      broker,
                      "EM_VISITA",
                      "Ir p/ Visita",
                      "bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/20"
                    )}
                    {statusButton(broker, "PAUSA", "Pausar", "bg-muted hover:bg-muted/80 text-muted-foreground border-border")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {outOfQueue.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <PauseCircle className="w-4 h-4 text-amber-500" />
            Fora da Roleta no Momento ({outOfQueue.length})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {outOfQueue.map((broker) => {
              const reason =
                broker.status !== "DISPONIVEL" ? STATUS_META[broker.status].label : "Sem check-in hoje";
              return (
                <div
                  key={broker.id}
                  className="bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs shrink-0">
                      {broker.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-foreground block truncate">{broker.nome}</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{reason}</span>
                    </div>
                  </div>

                  {broker.status !== "DISPONIVEL" ? (
                    <button
                      type="button"
                      disabled={pendingId === broker.id}
                      onClick={() => onStatusChange(broker.id, "DISPONIVEL")}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/30 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {pendingId === broker.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Marcar Disponível"}
                    </button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground text-right shrink-0">Check-in pelo corretor</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
