// components/crm/ranking/tv/TvBrokerTablesGrid.tsx
// Painel Principal: 3 Quadrantes de Performance Individual por Corretor (Habitus CRM Style).

"use client";

import React from "react";
import { UserCheck, Trophy, TrendingUp, Crown } from "lucide-react";
import type { TvDataResponse } from "./types";

interface TvBrokerTablesGridProps {
  brokers: TvDataResponse["brokers"];
  orgName: string;
}

export function TvBrokerTablesGrid({ brokers, orgName }: TvBrokerTablesGridProps) {
  const { analises, aprovacoes, vendas } = brokers;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 px-2 sm:px-4 flex-1">
      {/* 1. ANÁLISES POR CORRETOR */}
      <div className="rounded-xl overflow-hidden border border-[#1E2E4A] bg-[#0C1628] shadow-xl flex flex-col min-h-[460px] max-h-[640px]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#102445] to-[#0D1C36] px-4 py-3 border-b border-[#1E2E4A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-[#1266C7]" />
            <h3 className="text-xs sm:text-sm font-black tracking-wider text-white uppercase truncate">
              ANÁLISES POR CORRETOR
            </h3>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300">
            <span className="text-slate-400">Hoje:</span>
            <span className="text-white font-extrabold">{analises.totalHoje}</span>
            <span className="text-slate-400 ml-1">Mês:</span>
            <span className="text-[#1266C7] font-black">{analises.totalMes}</span>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-[#1E2E4A]/60 bg-[#091120] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2 px-3.5 w-10">#</th>
                <th className="py-2 px-3">CORRETOR</th>
                <th className="py-2 px-3 text-right">HOJE</th>
                <th className="py-2 px-4 text-right">MÊS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2E4A]/40 font-medium">
              {analises.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                    Nenhum corretor com análises registradas no período
                  </td>
                </tr>
              ) : (
                analises.items.map((item) => {
                  const isFirst = item.posicao === 1 && item.mes > 0;
                  const isSecond = item.posicao === 2 && item.mes > 0;
                  const isThird = item.posicao === 3 && item.mes > 0;

                  return (
                    <tr
                      key={item.corretorId}
                      className={`transition-colors ${
                        isFirst
                          ? "bg-[#D9BB4C]/10 text-white font-semibold"
                          : isSecond
                          ? "bg-slate-400/5 text-slate-100"
                          : isThird
                          ? "bg-amber-800/5 text-slate-100"
                          : "hover:bg-[#12233F]/40 text-slate-200"
                      }`}
                    >
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isFirst
                              ? "text-[#D9BB4C] font-black"
                              : isSecond
                              ? "text-slate-300"
                              : isThird
                              ? "text-amber-500"
                              : "text-slate-400"
                          }`}
                        >
                          {isFirst && <Crown className="w-3 h-3 text-[#D9BB4C] shrink-0" />}
                          {item.posicao}º
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isFirst
                                ? "bg-[#D9BB4C] text-[#070B14]"
                                : "bg-[#182C52] text-slate-200"
                            }`}
                          >
                            {item.avatar}
                          </div>
                          <span className="uppercase font-bold tracking-tight text-white truncate max-w-[200px]">
                            {item.corretorNome}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                        {item.hoje}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-white text-sm">
                        {item.mes}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. RANKING APROVAÇÕES (POR CORRETOR) */}
      <div className="rounded-xl overflow-hidden border border-[#1E2E4A] bg-[#0C1628] shadow-xl flex flex-col min-h-[460px] max-h-[640px]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#102445] to-[#0D1C36] px-4 py-3 border-b border-[#1E2E4A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-[#D9BB4C]" />
            <h3 className="text-xs sm:text-sm font-black tracking-wider text-white uppercase truncate">
              RANKING APROVAÇÕES
            </h3>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300">
            <span className="text-slate-400">Hoje:</span>
            <span className="text-white font-extrabold">{aprovacoes.totalHoje}</span>
            <span className="text-slate-400 ml-1">Mês:</span>
            <span className="text-emerald-400 font-black">{aprovacoes.totalMes}</span>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-[#1E2E4A]/60 bg-[#091120] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2 px-3.5 w-10">#</th>
                <th className="py-2 px-3">CORRETOR</th>
                <th className="py-2 px-3 text-right">HOJE</th>
                <th className="py-2 px-4 text-right">MÊS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2E4A]/40 font-medium">
              {aprovacoes.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                    Nenhuma aprovação registrada no período
                  </td>
                </tr>
              ) : (
                aprovacoes.items.map((item) => {
                  const isFirst = item.posicao === 1 && item.mes > 0;
                  const isSecond = item.posicao === 2 && item.mes > 0;
                  const isThird = item.posicao === 3 && item.mes > 0;

                  return (
                    <tr
                      key={item.corretorId}
                      className={`transition-colors ${
                        isFirst
                          ? "bg-[#D9BB4C]/10 text-white font-semibold"
                          : isSecond
                          ? "bg-slate-400/5 text-slate-100"
                          : isThird
                          ? "bg-amber-800/5 text-slate-100"
                          : "hover:bg-[#12233F]/40 text-slate-200"
                      }`}
                    >
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isFirst
                              ? "text-[#D9BB4C] font-black"
                              : isSecond
                              ? "text-slate-300"
                              : isThird
                              ? "text-amber-500"
                              : "text-slate-400"
                          }`}
                        >
                          {isFirst && <Crown className="w-3 h-3 text-[#D9BB4C] shrink-0" />}
                          {item.posicao}º
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isFirst
                                ? "bg-[#D9BB4C] text-[#070B14]"
                                : "bg-[#182C52] text-slate-200"
                            }`}
                          >
                            {item.avatar}
                          </div>
                          <span className="uppercase font-bold tracking-tight text-white truncate max-w-[200px]">
                            {item.corretorNome}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                        {item.hoje}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-emerald-400 text-sm">
                        {item.mes}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. VENDAS · SEMANA (POR CORRETOR) */}
      <div className="rounded-xl overflow-hidden border border-[#1E2E4A] bg-[#0C1628] shadow-xl flex flex-col min-h-[460px] max-h-[640px]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#102445] to-[#0D1C36] px-4 py-3 border-b border-[#1E2E4A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-[#D9BB4C]" />
            <h3 className="text-xs sm:text-sm font-black tracking-wider text-white uppercase truncate">
              VENDAS · SEMANA
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-slate-400">VD:</span>
            <span className="text-white font-extrabold mr-1">{vendas.totalVd}</span>
            <span className="text-slate-400">VGV:</span>
            <span className="text-[#D9BB4C] font-black">
              {vendas.totalVgv.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-[#1E2E4A]/60 bg-[#091120] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2 px-3.5 w-10">#</th>
                <th className="py-2 px-3">CORRETOR</th>
                <th className="py-2 px-3 text-right">VD</th>
                <th className="py-2 px-4 text-right">VGV (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2E4A]/40 font-medium">
              {vendas.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                    Nenhuma venda registrada na semana
                  </td>
                </tr>
              ) : (
                vendas.items.map((item) => {
                  const isFirst = item.posicao === 1 && (item.vd > 0 || item.vgv > 0);
                  const isSecond = item.posicao === 2 && (item.vd > 0 || item.vgv > 0);
                  const isThird = item.posicao === 3 && (item.vd > 0 || item.vgv > 0);

                  return (
                    <tr
                      key={item.corretorId}
                      className={`transition-colors ${
                        isFirst
                          ? "bg-[#D9BB4C]/15 text-white font-semibold"
                          : isSecond
                          ? "bg-slate-400/10 text-white font-medium"
                          : isThird
                          ? "bg-amber-700/10 text-white font-medium"
                          : "hover:bg-[#12233F]/40 text-slate-200"
                      }`}
                    >
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isFirst
                              ? "text-[#D9BB4C] font-black"
                              : isSecond
                              ? "text-slate-300"
                              : isThird
                              ? "text-amber-500"
                              : "text-slate-400"
                          }`}
                        >
                          {isFirst && <Crown className="w-3 h-3 text-[#D9BB4C] shrink-0" />}
                          {item.posicao}º
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isFirst
                                ? "bg-[#D9BB4C] text-[#070B14]"
                                : "bg-[#182C52] text-slate-200"
                            }`}
                          >
                            {item.avatar}
                          </div>
                          <span className="uppercase font-bold tracking-tight text-white truncate max-w-[200px]">
                            {item.corretorNome}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-white text-sm">
                        {item.vd}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-200">
                        {item.vgv > 0
                          ? item.vgv.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
                          : "0"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
