"use client";

import React, { useState } from "react";
import { Crown, Medal } from "lucide-react";
import { BrokerRankItem } from "./types";
import { CountUpNumber } from "@/components/crm/CountUpNumber";

interface RankingTableProps {
  brokers: BrokerRankItem[];
}

export function RankingTable({ brokers }: RankingTableProps) {
  const [activeTab, setActiveTab] = useState<"corretores" | "gerentes" | "equipes">("corretores");

  return (
    <div className="bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] rounded-2xl shadow-sm overflow-hidden space-y-4">
      {/* Tabs Header */}
      <div className="p-4 border-b border-slate-200 dark:border-[#1C2537] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex bg-slate-100 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] p-1 rounded-xl">
          {[
            { id: "corretores", label: "Ranking Corretores" },
            { id: "gerentes", label: "Ranking Gerentes" },
            { id: "equipes", label: "Ranking Equipes" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-[#161F30] text-connect-blue dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Atualizado em tempo real com regras determinísticas
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1C2537] bg-slate-50/70 dark:bg-[#080C14] text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
          <tbody className="divide-y divide-slate-100 dark:divide-[#1C2537]/60">
            {brokers.map((broker) => {
              const isFirst = broker.posicao === 1;
              const isSecond = broker.posicao === 2;
              const isThird = broker.posicao === 3;

              return (
                <tr
                  key={broker.id}
                  className={`transition-colors ${
                    isFirst
                      ? "border-t-2 border-platz-gold bg-amber-500/10 dark:bg-amber-500/10 font-medium"
                      : "hover:bg-slate-50 dark:hover:bg-[#121A2A]"
                  }`}
                >
                  {/* Posição */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isFirst ? (
                      <div className="flex items-center gap-1.5 font-black text-amber-700 dark:text-[#F8DA56] text-xs">
                        <Crown className="w-4 h-4 fill-platz-gold text-platz-gold" />
                        1º Lugar
                      </div>
                    ) : isSecond ? (
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 text-xs">
                        <Medal className="w-4 h-4 text-slate-400" />
                        2º Lugar
                      </div>
                    ) : isThird ? (
                      <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-500 text-xs">
                        <Medal className="w-4 h-4 text-amber-600" />
                        3º Lugar
                      </div>
                    ) : (
                      <span className="font-bold text-slate-500 pl-2">
                        {broker.posicao}º
                      </span>
                    )}
                  </td>

                  {/* Colaborador */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isFirst
                            ? "bg-platz-gold text-slate-950 ring-2 ring-platz-gold/50"
                            : "bg-connect-blue text-white"
                        }`}
                      >
                        {broker.avatar}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {broker.nome}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {broker.cargo}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* VGV Vendido */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-extrabold text-connect-blue dark:text-blue-400 text-xs">
                      R$ {broker.vgv.toLocaleString("pt-BR")}
                    </div>
                    <span className="text-[10px] text-slate-400">VGV no período</span>
                  </td>

                  {/* Docs */}
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {broker.documentos}
                  </td>

                  {/* Vendas */}
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    {broker.vendas}
                  </td>

                  {/* Captações */}
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {broker.captacoes}
                  </td>

                  {/* Visitas */}
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {broker.visitas}
                  </td>

                  {/* Compromissos */}
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {broker.compromissos}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
