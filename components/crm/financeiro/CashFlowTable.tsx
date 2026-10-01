"use client";

import React from "react";

export interface CashFlowItem {
  id: string;
  tipo: "RECEITA" | "DESPESA";
  categoria: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  status: "PAGO" | "PENDENTE";
  meioPagamento?: string;
}

interface CashFlowTableProps {
  cashFlows: CashFlowItem[];
  filterTipo: "TODOS" | "RECEITA" | "DESPESA";
  onSetFilterTipo: (tipo: "TODOS" | "RECEITA" | "DESPESA") => void;
}

export function CashFlowTable({
  cashFlows,
  filterTipo,
  onSetFilterTipo,
}: CashFlowTableProps) {
  return (
    <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Extrato de Contas Operacionais</h3>
        <div className="flex bg-[#080C14] border border-[#1F2937] rounded-xl p-1 text-xs">
          {(["TODOS", "RECEITA", "DESPESA"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onSetFilterTipo(t)}
              className={`px-3 py-1 rounded-lg capitalize transition-all ${
                filterTipo === t ? "bg-connect-blue text-white font-bold" : "text-slate-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#0F1624] text-[10px] text-slate-400 uppercase font-bold border-b border-[#1C2537]">
            <tr>
              <th className="py-3 px-4">Descrição</th>
              <th className="py-3 px-4">Categoria</th>
              <th className="py-3 px-4">Vencimento</th>
              <th className="py-3 px-4">Meio</th>
              <th className="py-3 px-4">Valor</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C2537]">
            {cashFlows
              .filter((c) => filterTipo === "TODOS" || c.tipo === filterTipo)
              .map((cf) => (
                <tr key={cf.id} className="hover:bg-[#0D131F]">
                  <td className="py-3 px-4 font-bold text-white">{cf.descricao}</td>
                  <td className="py-3 px-4 text-slate-400">{cf.categoria}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{cf.dataVencimento}</td>
                  <td className="py-3 px-4 text-blue-400 font-semibold">{cf.meioPagamento || "PIX"}</td>
                  <td
                    className={`py-3 px-4 font-black ${
                      cf.tipo === "RECEITA" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {cf.tipo === "RECEITA" ? "+" : "-"}
                    {cf.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cf.status === "PAGO"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {cf.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
