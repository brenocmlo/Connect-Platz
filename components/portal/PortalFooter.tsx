"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

interface PortalFooterProps {
  onNavigateVitrine: (modalidade: "VENDA" | "VERANEIO") => void;
}

export function PortalFooter({ onNavigateVitrine }: PortalFooterProps) {
  return (
    <footer className="bg-[#05080E] border-t border-[#1F2937] py-12 px-6 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
        <div className="sm:col-span-2">
          <span className="text-xl font-black text-white">
            CONNECT <span className="text-[#D9BB4C]">PLATZ</span>
          </span>
          <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
            Connect Platz Imobiliária • Intermediação imobiliária de excelência,
            vendas de alto padrão e gestão de locação de veraneio por temporada no Ceará.
          </p>
          <p className="mt-3 text-slate-500 font-mono">
            CNPJ: 53.758.699/0001-10 • CRECI: 023456-J
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
            Navegação
          </h4>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onNavigateVitrine("VENDA")}
                className="hover:text-white"
              >
                Imóveis para Venda
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateVitrine("VERANEIO")}
                className="hover:text-[#F8DA56]"
              >
                Aluguel de Veraneio (Temporada)
              </button>
            </li>
            <li>
              <a href="#simulador" className="hover:text-white">
                Simulação de Financiamento
              </a>
            </li>
            <li>
              <a href="#diretorio" className="hover:text-white">
                Guia de Cidades & Bairros
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
            Atendimento
          </h4>
          <p>Fortaleza / Aquiraz - Ceará</p>
          <p className="mt-1">Segunda a Sábado: 08:00 às 20:00</p>
          <p className="mt-2 text-[#D9BB4C] font-bold">contato@connectplatz.com.br</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-[#1F2937] pt-6 flex flex-wrap items-center justify-between gap-4 text-slate-500">
        <p>© 2026 Connect Platz Imobiliária. Todos os direitos reservados.</p>
        <div className="flex items-center gap-4">
          <span className="text-emerald-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Segurança SSL & LGPD
          </span>
        </div>
      </div>
    </footer>
  );
}
