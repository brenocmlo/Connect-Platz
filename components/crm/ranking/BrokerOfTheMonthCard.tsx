"use client";

import React from "react";
import { Trophy } from "lucide-react";
import { AnimatedCrown } from "@/components/crm/AnimatedCrown";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { useCrm } from "@/components/crm/CrmContext";
import { BrokerRankItem } from "./types";
import { RankAvatar } from "./RankAvatar";

interface BrokerOfTheMonthCardProps {
  brokers: BrokerRankItem[];
  /** Líder real do período (null = ninguém vendeu) */
  leader: BrokerRankItem | null;
  selectedBrokerId: string | null;
  onSelectBroker: (id: string) => void;
  periodLabel: string;
}

/** Card "Corretor do Mês" (5.9): coroa animada + anel dourado no líder; select para ver outros corretores. */
export function BrokerOfTheMonthCard({ brokers, leader, selectedBrokerId, onSelectBroker, periodLabel }: BrokerOfTheMonthCardProps) {
  const { hideValues } = useCrm();
  const broker = brokers.find((b) => b.id === selectedBrokerId) || leader;

  if (!broker) {
    return (
      <div className="rounded-2xl border border-dashed border-platz-gold/40 bg-gradient-to-br from-amber-500/5 via-card to-connect-blue/5 p-6 text-center space-y-2">
        <Trophy className="w-7 h-7 text-platz-gold mx-auto" />
        <h3 className="text-sm font-bold text-foreground">Corretor do Mês</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Nenhuma venda registrada em {periodLabel.toLowerCase()}. O líder aparece aqui assim que houver vendas.
        </p>
      </div>
    );
  }

  const isLeader = Boolean(leader && broker.id === leader.id);
  const statMetrics = [
    { label: "VGV", value: broker.vgv, isCurrency: true },
    { label: "Vendas", value: broker.vendas, isCurrency: false },
    { label: "Visitas", value: broker.visitas, isCurrency: false },
    { label: "Documentações", value: broker.documentos, isCurrency: false },
    { label: "Captações", value: broker.captacoes, isCurrency: false },
    { label: "Compromissos", value: broker.compromissos, isCurrency: false },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-platz-gold/30 dark:border-platz-gold/40 bg-gradient-to-br from-amber-500/5 via-card to-connect-blue/5 dark:from-platz-gold/10 dark:to-connect-deep-blue/10 p-6 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-platz-gold to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm">
            🏆 {isLeader ? "Corretor do Mês" : "Desempenho Individual"}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">Período: {periodLabel}</span>
        </div>

        {brokers.length > 1 && (
          <select
            value={broker.id}
            onChange={(e) => onSelectBroker(e.target.value)}
            aria-label="Selecionar corretor"
            className="bg-card border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shadow-xs"
          >
            {brokers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome} ({b.posicao}º)
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            {isLeader && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                <AnimatedCrown size="md" />
              </div>
            )}
            <div
              className={`w-20 h-20 rounded-full p-1 flex items-center justify-center ${
                isLeader
                  ? "bg-gradient-to-tr from-platz-gold to-amber-300 ring-4 ring-platz-gold/60 shadow-xl shadow-platz-gold/25"
                  : "bg-connect-blue/20 ring-2 ring-connect-blue/30"
              }`}
            >
              <RankAvatar
                nome={broker.nome}
                initials={broker.avatar}
                photoUrl={broker.photoUrl}
                className="w-full h-full text-2xl"
                fallbackClassName="bg-card text-amber-600 dark:text-platz-gold font-black"
              />
            </div>
          </div>
          <span
            className={`mt-2 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs ${
              isLeader ? "bg-platz-gold text-slate-950" : "bg-muted text-muted-foreground"
            }`}
          >
            {broker.posicao}º Lugar
          </span>
        </div>

        <div className="space-y-1 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">{broker.nome}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-connect-blue/15 text-connect-blue font-bold">{broker.cargo}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isLeader
              ? `Maior VGV vendido em ${periodLabel.toLowerCase()}.`
              : `Taxa de conversão de ${broker.taxaConversao.toLocaleString("pt-BR")}% sobre ${broker.leads} leads recebidos.`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {statMetrics.map((stat) => (
          <div
            key={stat.label}
            className="p-3 rounded-xl bg-card/80 border border-border/80 backdrop-blur-xs flex flex-col justify-between shadow-xs"
          >
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block tracking-wider truncate">
              {stat.label}
            </span>
            <span className="text-base font-extrabold text-foreground mt-1 block">
              {stat.isCurrency ? (
                hideValues ? "••••••" : <CountUpNumber value={stat.value} prefix="R$ " decimals={0} />
              ) : (
                <CountUpNumber value={stat.value} />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
