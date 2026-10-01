"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

export function PortalHeader() {
  return (
    <header className="border-b border-[#1F2937] bg-[#0A0E17]/95 backdrop-blur sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo Connect Platz Oficial */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1266C7] to-[#0D478F] flex items-center justify-center font-black text-white text-base shadow-md">
            CP
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white leading-none">
              CONNECT <span className="text-[#D9BB4C]">PLATZ</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
              Imobiliária & Veraneio
            </span>
          </div>
        </div>

        {/* Links de Navegação do Portal */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
          <a href="#vitrine" className="hover:text-white transition-colors">
            Imóveis Disponíveis
          </a>
          <a href="#diretorio" className="hover:text-white transition-colors">
            Guia de Bairros & Cidades
          </a>
          <a href="#simulador" className="hover:text-[#D9BB4C] transition-colors">
            Simulação de Financiamento
          </a>
          <a href="#sobre" className="hover:text-white transition-colors">
            Sobre a Connect Platz
          </a>
        </nav>

        {/* Ação Direta WhatsApp Web */}
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/5585999990001?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20im%C3%B3veis%20com%20a%20Connect%20Platz."
            target="_blank"
            rel="noreferrer"
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-105"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Falar com Corretor</span>
          </a>
        </div>
      </div>
    </header>
  );
}
