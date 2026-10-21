"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Zap,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  PauseCircle,
  Building2,
  Palmtree,
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
  leadsVenda?: number;
  leadsTemporada?: number;
}

interface RoletaDistributionPanelProps {
  members: RoletaMember[];
  onStatusChange: (id: string, newStatus: "DISPONIVEL" | "EM_VISITA" | "PAUSA") => void;
  onSimulateDistribution: (corretorNome: string, modality: "VENDA" | "ALUGUEL") => void;
}

export function RoletaDistributionPanel({
  members,
  onStatusChange,
  onSimulateDistribution,
}: RoletaDistributionPanelProps) {
  const [isRoletaActive, setIsRoletaActive] = useState(true);
  const [activeModality, setActiveModality] = useState<"VENDA" | "ALUGUEL">("VENDA");
  const [lastAssignedVenda, setLastAssignedVenda] = useState<string | null>(null);
  const [lastAssignedAluguel, setLastAssignedAluguel] = useState<string | null>(null);

  // Filas independentes para manter a ordem autônoma de simulação (todos os corretores atendem ambos)
  const baseAvailable = members.filter(
    (m) => m.role === "CORRETOR" && m.status === "DISPONIVEL"
  );
  const [vendaQueueIds, setVendaQueueIds] = useState<string[]>(baseAvailable.map((m) => m.id));
  const [aluguelQueueIds, setAluguelQueueIds] = useState<string[]>(
    [...baseAvailable].reverse().map((m) => m.id)
  );

  // Mapeamento ordenado da fila ativa conforme a modalidade
  const activeQueueIds = activeModality === "VENDA" ? vendaQueueIds : aluguelQueueIds;
  const availableBrokers = activeQueueIds
    .map((id) => baseAvailable.find((m) => m.id === id))
    .filter((m): m is RoletaMember => Boolean(m));

  // Corretores indisponíveis
  const unavailableBrokers = members.filter(
    (m) => m.role === "CORRETOR" && m.status !== "DISPONIVEL"
  );

  const handleSimulate = () => {
    if (!isRoletaActive || availableBrokers.length === 0) return;
    const nextInLine = availableBrokers[0];

    if (activeModality === "VENDA") {
      setLastAssignedVenda(nextInLine.nome);
      setVendaQueueIds((prev) => {
        const without = prev.filter((id) => id !== nextInLine.id);
        return [...without, nextInLine.id];
      });
      onSimulateDistribution(nextInLine.nome, "VENDA");
    } else {
      setLastAssignedAluguel(nextInLine.nome);
      setAluguelQueueIds((prev) => {
        const without = prev.filter((id) => id !== nextInLine.id);
        return [...without, nextInLine.id];
      });
      onSimulateDistribution(nextInLine.nome, "ALUGUEL");
    }
  };

  const currentLastAssigned =
    activeModality === "VENDA" ? lastAssignedVenda : lastAssignedAluguel;

  return (
    <div className="space-y-5">
      {/* 1. SELETOR DE MODALIDADE DA ROLETA (VENDA X ALUGUEL DE TEMPORADA) */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-connect-blue" />
              <h3 className="text-sm font-bold text-foreground">
                Motor de Roleta Autônoma por Modalidade
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue border border-connect-blue/20">
                100% Determinístico
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Todos os corretores atendem Venda e Aluguel de Temporada em <strong>filas de rodízio autônomas</strong>,
              garantindo que um aluguel não retire a vez de venda do corretor.
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

        {/* Abas de Modalidade */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="inline-flex p-1 bg-muted/70 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveModality("VENDA")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModality === "VENDA"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-connect-blue" />
              <span>Fila de Vendas de Imóveis</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModality("ALUGUEL")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModality === "ALUGUEL"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Palmtree className="w-3.5 h-3.5 text-amber-500" />
              <span>Fila de Aluguel de Temporada</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSimulate}
            disabled={!isRoletaActive || availableBrokers.length === 0}
            className="px-3.5 py-1.5 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Testar Distribuição ({activeModality === "VENDA" ? "Venda" : "Aluguel"})</span>
          </button>
        </div>

        {/* Callout de Regra do Negócio */}
        <div className="bg-muted/40 border border-border/80 rounded-xl p-3 text-xs text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            <strong>Critério Connect Platz:</strong> Check-in diário + Status Disponível. A fila de{" "}
            <strong>{activeModality === "VENDA" ? "Vendas" : "Aluguel de Temporada"}</strong> move o corretor contemplado para o final sem alterar sua posição na outra fila.
          </span>
        </div>

        {currentLastAssigned && (
          <div className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Lead de <strong>{activeModality === "VENDA" ? "Venda" : "Aluguel"}</strong> distribuído com sucesso para:{" "}
              <strong>{currentLastAssigned}</strong>!
            </span>
          </div>
        )}
      </div>

      {/* 2. FILA DE ATENDIMENTO AO VIVO */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            Fila Ativa: {activeModality === "VENDA" ? "Vendas de Imóveis" : "Aluguel de Temporada"} ({availableBrokers.length} aptos)
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

                  <div className="pt-2 border-t border-border grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Leads Venda:</span>
                      <strong className="text-foreground font-bold">{broker.leadsVenda ?? broker.leadsAtivos}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Leads Temporada:</span>
                      <strong className="text-amber-600 dark:text-amber-400 font-bold">
                        {broker.leadsTemporada ?? Math.round(broker.leadsAtivos * 0.4)}
                      </strong>
                    </div>
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
