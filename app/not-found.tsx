import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, Home, MessageCircle, Compass } from "lucide-react";
import { SITE_CONFIG } from "@/lib/seo/siteConfig";

export const metadata = {
  title: "Página não encontrada (404) | Connect Platz",
  description:
    "A página ou imóvel procurado não foi encontrado ou não está mais disponível no portal Connect Platz.",
  robots: { index: false, follow: false },
};

const POPULAR_AREAS = [
  { name: "Meireles", query: "Meireles" },
  { name: "Aldeota", query: "Aldeota" },
  { name: "Cocó", query: "Cocó" },
  { name: "Porto das Dunas", query: "Porto das Dunas" },
  { name: "Eusébio", query: "Eusébio" },
  { name: "Beira Mar", query: "Beira Mar" },
];

export default function NotFound() {
  const waPhone = SITE_CONFIG.telephone.replace(/\D/g, "");
  const waUrl = `https://wa.me/55${waPhone}?text=${encodeURIComponent(
    "Olá, estava navegando no portal Connect Platz e não encontrei o imóvel ou página que procurava. Gostaria de falar com um corretor."
  )}`;

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col justify-between selection:bg-connect-blue selection:text-white relative overflow-hidden">
      {/* Glow decorativo de fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-connect-blue/15 rounded-full blur-3xl pointer-events-none" />

      {/* Topo / Logo */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-connect-blue/10 border border-connect-blue/20 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
            <Image
              src="/logo-predio.png"
              alt="Connect Platz"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white block text-sm leading-none">
              CONNECT <span className="text-[#D9BB4C]">PLATZ</span>
            </span>
            <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
              CRM & Imobiliária
            </span>
          </div>
        </Link>
      </header>

      {/* Conteúdo Central */}
      <main className="w-full max-w-2xl mx-auto px-6 py-12 text-center relative z-10 flex flex-col items-center">
        {/* Badge 404 */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-connect-blue/10 border border-connect-blue/30 text-connect-blue text-xs font-semibold uppercase tracking-wider mb-6">
          <Compass className="w-3.5 h-3.5" />
          Erro 404 • Página não encontrada
        </div>

        {/* Título */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Ops! Não encontramos esse imóvel ou página
        </h1>

        {/* Descrição */}
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
          O link que você seguiu pode estar desatualizado, o imóvel pode já ter sido vendido ou alugado, ou o endereço foi digitado incorretamente.
        </p>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-10">
          <Link
            href="/#vitrine"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-connect-blue hover:bg-connect-blue/90 text-white font-medium text-sm shadow-lg shadow-connect-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Building2 className="w-4 h-4" />
            Explorar Vitrine de Imóveis
          </Link>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Falar no WhatsApp
          </a>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-300 font-medium text-sm transition-all"
          >
            <Home className="w-4 h-4" />
            Página Inicial
          </Link>
        </div>

        {/* Atalhos Rápidos por Bairro */}
        <div className="w-full pt-6 border-t border-slate-800/80">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
            Bairros mais procurados em Fortaleza e Ceará:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {POPULAR_AREAS.map((area) => (
              <Link
                key={area.name}
                href="/#vitrine"
                className="px-3 py-1 rounded-full bg-slate-900/80 hover:bg-connect-blue/20 border border-slate-800 hover:border-connect-blue/40 text-xs text-slate-300 hover:text-white transition-colors"
              >
                📍 {area.name}
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Rodapé minimalista */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-slate-400 relative z-10 border-t border-slate-900">
        <p>
          {SITE_CONFIG.name} • CRECI {SITE_CONFIG.creci} • Fortaleza - CE
        </p>
      </footer>
    </div>
  );
}
