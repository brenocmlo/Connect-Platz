"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

interface SaleParticipantsSectionProps {
  corretor1: string;
  setCorretor1: (val: string) => void;
  corretor1Pct: number;
  setCorretor1Pct: (val: number) => void;
  hasCorretor2: boolean;
  setHasCorretor2: (val: boolean) => void;
  corretor2: string;
  setCorretor2: (val: string) => void;
  corretor2Pct: number;
  setCorretor2Pct: (val: number) => void;
  gerente: string;
  setGerente: (val: string) => void;
  gerentePct: number;
  captador: string;
  setCaptador: (val: string) => void;
  captadorPct: number;
}

export function SaleParticipantsSection({
  corretor1,
  setCorretor1,
  corretor1Pct,
  setCorretor1Pct,
  hasCorretor2,
  setHasCorretor2,
  corretor2,
  setCorretor2,
  corretor2Pct,
  setCorretor2Pct,
  gerente,
  setGerente,
  gerentePct,
  captador,
  setCaptador,
  captadorPct,
}: SaleParticipantsSectionProps) {
  return (
    <div className="space-y-3 pt-2">
      <span className="font-bold text-slate-800 dark:text-white block uppercase tracking-wider text-[11px]">
        Divisão de Participantes (Split)
      </span>

      {/* Corretor 1 */}
      <div className="grid grid-cols-3 gap-2 items-center">
        <div className="col-span-2">
          <label className="block font-medium text-slate-600 dark:text-slate-400 mb-0.5">
            Corretor 1 (Titular)
          </label>
          <input
            type="text"
            value={corretor1}
            onChange={(e) => setCorretor1(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-600 dark:text-slate-400 mb-0.5">
            % Split
          </label>
          <input
            type="number"
            value={corretor1Pct}
            onChange={(e) => setCorretor1Pct(Number(e.target.value))}
            className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2 text-slate-900 dark:text-white font-mono"
          />
        </div>
      </div>

      {/* Segundo Corretor Toggle */}
      {!hasCorretor2 ? (
        <button
          type="button"
          onClick={() => {
            setHasCorretor2(true);
            setCorretor1Pct(30);
            setCorretor2Pct(20);
          }}
          className="text-xs font-semibold text-connect-blue hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          + Adicionar Segundo Corretor (Divisão)
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2 items-center p-2.5 rounded-xl bg-connect-blue/5 border border-connect-blue/20">
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-0.5">
              <label className="block font-medium text-connect-blue">
                Corretor 2 (Parceria)
              </label>
              <button
                type="button"
                onClick={() => {
                  setHasCorretor2(false);
                  setCorretor1Pct(40);
                }}
                className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5"
              >
                <Trash2 className="w-3 h-3" /> Remover
              </button>
            </div>
            <input
              type="text"
              value={corretor2}
              onChange={(e) => setCorretor2(e.target.value)}
              className="w-full bg-white dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 dark:text-slate-400 mb-0.5">
              % Split
            </label>
            <input
              type="number"
              value={corretor2Pct}
              onChange={(e) => setCorretor2Pct(Number(e.target.value))}
              className="w-full bg-white dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2 text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>
      )}

      {/* Gerente & Captador */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-medium text-slate-600 dark:text-slate-400 mb-0.5">
            Gerente ({gerentePct}%)
          </label>
          <input
            type="text"
            value={gerente}
            onChange={(e) => setGerente(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-600 dark:text-slate-400 mb-0.5">
            Captador ({captadorPct}%)
          </label>
          <input
            type="text"
            value={captador}
            onChange={(e) => setCaptador(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2 text-slate-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
