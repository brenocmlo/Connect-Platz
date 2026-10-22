"use client";

import React, { useState } from "react";
import { Medal, Trophy } from "lucide-react";
import { AnimatedCrown } from "@/components/crm/AnimatedCrown";
import { SegmentedToggle } from "@/components/crm/primitives/SegmentedToggle";
import { EmptyState } from "@/components/crm/primitives/EmptyState";
import { useCrm } from "@/components/crm/CrmContext";
import { formatCompactBRL } from "@/components/crm/dashboard/format";
import { BrokerRankItem } from "./types";
import { RankAvatar } from "./RankAvatar";

type RankTab = "corretores" | "gerentes";

interface RankingTableProps {
  corretores: BrokerRankItem[];
  gerentes: BrokerRankItem[];
  currentUserId?: string;
}

function PositionCell({ item }: { item: BrokerRankItem }) {
  const podium = item.noPodio && item.posicao <= 3;
  if (podium && item.posicao === 1) {
    return (
      <div className="flex items-center gap-1.5 font-black text-amber-700 dark:text-[#F8DA56] text-xs">
        <AnimatedCrown size="sm" />
        1º Lugar
      </div>
    );
  }
  if (podium) {
    const silver = item.posicao === 2;
    return (
      <div className={`flex items-center gap-1.5 font-bold text-xs ${silver ? "text-slate-600 dark:text-slate-300" : "text-amber-800 dark:text-amber-500"}`}>
        <Medal className={`w-4 h-4 ${silver ? "text-slate-400" : "text-amber-600"}`} />
        {item.posicao}º Lugar
      </div>
    );
  }
  return <span className="font-bold text-muted-foreground pl-2">{item.posicao}º</span>;
}

/** Tabela completa de ranking (5.9) — ordem determinística calculada em /api/ranking. */
export function RankingTable({ corretores, gerentes, currentUserId }: RankingTableProps) {
  const { hideValues } = useCrm();
  const [activeTab, setActiveTab] = useState<RankTab>("corretores");
  const rows = activeTab === "corretores" ? corretores : gerentes;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SegmentedToggle
          options={[
            { value: "corretores", label: "Ranking Corretores" },
            { value: "gerentes", label: "Ranking Gerentes" },
          ]}
          value={activeTab}
          onChange={(v) => setActiveTab(v as RankTab)}
        />
        <span className="text-xs text-muted-foreground font-medium">
          Ordem: VGV, vendas, visitas, captações e nome
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={activeTab === "corretores" ? "Nenhum corretor ativo" : "Nenhum gerente ativo"}
          description="Cadastre colaboradores em Equipes para acompanhar o ranking."
          className="m-4"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Posição</th>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">VGV Vendido</th>
                <th className="py-3 px-4 text-center">Docs</th>
                <th className="py-3 px-4 text-center">Vendas</th>
                <th className="py-3 px-4 text-center">Captações</th>
                <th className="py-3 px-4 text-center">Visitas</th>
                <th className="py-3 px-4 text-center">Compromissos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((item) => {
                const isFirst = item.noPodio && item.posicao === 1;
                const isMe = item.id === currentUserId;
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isFirst
                        ? "border-t-2 border-platz-gold bg-amber-50 dark:bg-amber-500/10 font-medium"
                        : isMe
                        ? "bg-connect-blue/5 hover:bg-connect-blue/10"
                        : "hover:bg-connect-blue/5"
                    }`}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PositionCell item={item} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <RankAvatar
                          nome={item.nome}
                          initials={item.avatar}
                          photoUrl={item.photoUrl}
                          fallbackClassName={
                            isFirst ? "bg-platz-gold text-slate-950 ring-2 ring-platz-gold/50" : "bg-connect-blue text-white"
                          }
                        />
                        <div>
                          <span className="font-bold text-foreground block">
                            {item.nome}
                            {isMe && <span className="ml-1.5 text-[10px] font-semibold text-connect-blue">(você)</span>}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{item.cargo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-extrabold text-connect-blue dark:text-blue-400 text-xs">
                        {hideValues ? "••••••" : formatCompactBRL(item.vgv)}
                      </div>
                      <span className="text-[10px] text-muted-foreground">VGV</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-foreground/80">{item.documentos}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{item.vendas}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-foreground/80">{item.captacoes}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-foreground/80">{item.visitas}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-foreground/80">{item.compromissos}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
