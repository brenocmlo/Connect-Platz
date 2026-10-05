"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck,
  PauseCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export interface RoletaMember {
  id: string;
  nome: string;
  email: string;
  role: "DIRETOR" | "GERENTE" | "CORRETOR";
  equipe: string;
  leadsAtivos: number;
  status: "DISPONIVEL" | "EM_VISITA" | "PAUSA";
  hasCheckedInToday?: boolean;
}

interface RoletaDistributionPanelProps {
  members: RoletaMember[];
  onStatusChange: (id: string, newStatus: "DISPONIVEL" | "EM_VISITA" | "PAUSA") => void;
  onSimulateDistribution: (corretorNome: string) => void;
}

export function RoletaDistributionPanel({
  members,
  onStatusChange,
  onSimulateDistribution,
}: RoletaDistributionPanelProps) {
  const [isRoletaActive, setIsRoletaActive] = useState(true);
  const [lastAssigned, setLastAssigned] = useState<string | null>(null);

  // Filtra corretores elegíveis (Disponíveis e Corretores)
  const availableBrokers = members.filter(
    (m) => m.role === "CORRETOR" && m.status === "DISPONIVEL"
  );
  const unavailableBrokers = members.filter(
    (m) => m.role === "CORRETOR" && m.status !== "DISPONIVEL"
  );

  const handleSimulate = () => {
    if (!isRoletaActive || availableBrokers.length === 0) return;
    const nextInLine = availableBrokers[0];
    setLastAssigned(nextInLine.nome);
    onSimulateDistribution(nextInLine.nome);
  };

  return (
    <div className="space-y-5">
      {/* 1. STATUS GERAL DO MOTOR DETERMINÍSTICO */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-connect-blue" />
              <h3 className="text-sm font-bold text-foreground">
                Motor de Distribuição Determinística (Round-Robin)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue border border-connect-blue/20">
                100% Determinístico
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Distribui novos leads (Meta Ads, Google, Site) na ordem exata da fila para corretores presentes e disponíveis.
            </p>
          </div>

          {/* Switch de Ativação da Roleta */}
          <div className="flex items-center gap-3 bg-muted/60 p-2 rounded-xl border border-border">
            <span className="text-xs font-semibold text-foreground">
              {isRoletaActive ? "Roleta Ativa" : "Roleta Pausada"}
            </span>
            <button
              type="button"
              onClick={() => setIsRoletaActive(!isRoletaActive)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                isRoletaActive ? "bg-connect-blue" : "bg-muted-foreground/40"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                  isRoletaActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Callout de Regra do Negócio */}
        <div className="bg-muted/40 border border-border/80 rounded-xl p-3 text-xs text-muted-foreground flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>
              <strong>Critério de Roleta:</strong> Check-in presencial diário obrigatório + Status Disponível. O corretor que recebe o lead vai para o fim da fila.
            </span>
          </div>

          <button
            type="button"
            onClick={handleSimulate}
            disabled={!isRoletaActive || availableBrokers.length === 0}
            className="px-3.5 py-1.5 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Testar Distribuição</span>
          </button>
        </div>

        {lastAssigned && (
          <div className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>Lead distribuído com sucesso para: <strong>{lastAssigned}</strong>!</span>
          </div>
        )}
      </div>

      {/* 2. FILA DE ATENDIMENTO AO VIVO */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            Fila Ativa de Corretores ({availableBrokers.length} aptos a receber lead)
          </h4>
          <span className="text-[11px] text-muted-foreground font-mono">
            Ordem de Prioridade ➔
          </span>
        </div>

        {availableBrokers.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-6 text-center text-xs text-muted-foreground">
            Nenhum corretor com status "Disponível" no momento. Novos leads irão para o Bolsão.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableBrokers.map((broker, idx) => {
              const isFirst = idx === 0;
              return (
                <div
                  key={broker.id}
                  className={`bg-card border rounded-2xl p-4 shadow-xs space-y-3 transition-all ${
                    isFirst
                      ? "border-connect-blue ring-1 ring-connect-blue/30 bg-connect-blue/[0.02]"
                      : "border-border hover:border-connect-blue/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        isFirst
                          ? "bg-connect-blue text-white shadow-xs"
                          : "bg-muted text-muted-foreground font-mono"
                      }`}
                    >
                      {isFirst ? "⭐ 1º DA FILA (PRÓXIMO)" : `${idx + 1}º da Fila`}
                    </span>

                    <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Disponível
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-connect-blue text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {broker.nome.charAt(0)}
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-foreground">{broker.nome}</h5>
                      <p className="text-[10px] text-muted-foreground">{broker.equipe}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Leads em Carteira:</span>
                    <strong className="text-foreground font-bold">{broker.leadsAtivos}</strong>
                  </div>

                  {/* Alterar Status Rápido */}
                  <div className="flex gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => onStatusChange(broker.id, "EM_VISITA")}
                      className="flex-1 py-1 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20 transition-colors"
                    >
                      Ir p/ Visita
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(broker.id, "PAUSA")}
                      className="flex-1 py-1 px-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground text-[10px] font-bold border border-border transition-colors"
                    >
                      Pausar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. CORRETORES FORA DA ROLETA NO MOMENTO */}
      {unavailableBrokers.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <PauseCircle className="w-4 h-4 text-amber-500" />
            Corretores Indisponíveis no Momento ({unavailableBrokers.length})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {unavailableBrokers.map((broker) => (
              <div
                key={broker.id}
                className="bg-card/60 border border-border rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs">
                    {broker.nome.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">{broker.nome}</span>
                    <span className="text-[10px] text-amber-500 font-semibold">
                      {broker.status === "EM_VISITA" ? "Em Visita Externa" : "Em Pausa"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onStatusChange(broker.id, "DISPONIVEL")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/30 transition-colors"
                >
                  Retornar à Roleta
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
