"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

const topPropertiesData = [
  { name: "Villa Platz Beach", vendas: 8, vgv: "R$ 6.8M" },
  { name: "Residencial Aldeota Platz", vendas: 5, vgv: "R$ 4.2M" },
  { name: "Solarium Porto das Dunas", vendas: 4, vgv: "R$ 2.9M" },
  { name: "Platz Oceanfront Residence", vendas: 3, vgv: "R$ 5.1M" },
];

export function TopPropertiesPanel() {
  return (
    <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">Empreendimentos Mais Comercializados</h3>
          <p className="text-[11px] text-slate-400">Contratos assinados e VGV gerado</p>
        </div>
        <a
          href="/crm/empreendimentos"
          className="text-xs text-connect-blue hover:underline font-semibold flex items-center gap-1"
        >
          Ver Espelho de Vendas <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="space-y-3">
        {topPropertiesData.map((prop, idx) => (
          <div
            key={prop.name}
            className="bg-[#0D131F] border border-[#1F2937] rounded-xl p-3.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#151D2C] border border-[#1F2937] text-xs font-bold text-[#D9BB4C] flex items-center justify-center">
                {idx + 1}
              </span>
              <div>
                <p className="text-xs font-bold text-white">{prop.name}</p>
                <p className="text-[11px] text-slate-400">{prop.vendas} unidades comercializadas</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-[#D9BB4C]">{prop.vgv}</span>
              <p className="text-[10px] text-emerald-400 font-semibold">100% no prazo</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
