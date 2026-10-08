"use client";

import React from "react";
import { FileCheck, MessageCircle, ShieldCheck, Zap } from "lucide-react";
import { CountUp, PortalSectionTitle, Reveal } from "./PortalUI";
import { waLink } from "./portalUtils";

interface PortalWhyUsProps {
  totalImoveis: number;
  totalCidades: number;
  totalTemporada: number;
  loading: boolean;
}

const DIFERENCIAIS = [
  {
    icon: Zap,
    titulo: "Atendimento imediato",
    texto: "Seu contato chega na hora a um corretor especialista no imóvel escolhido.",
  },
  {
    icon: FileCheck,
    titulo: "Crédito sem burocracia",
    texto: "Assessoria de financiamento para CLT e autônomos nos principais bancos.",
  },
  {
    icon: ShieldCheck,
    titulo: "Segurança jurídica",
    texto: "Contratos revisados e calendário de temporada sem choque de datas.",
  },
];

function StatPin({ label, value, suffix, caption, loading }: { label: string; value: number; suffix?: string; caption: string; loading: boolean }) {
  return (
    <div className="relative mx-auto h-32 w-32 sm:h-40 sm:w-40">
      {/* Pin "fantasma" deslocado atrás do principal */}
      <span aria-hidden className="absolute inset-0 translate-x-3 translate-y-2 rotate-45 rounded-full rounded-br-none bg-platz-gold/25" />
      <div className="absolute inset-0 rotate-45 rounded-full rounded-br-none bg-gradient-to-br from-connect-blue to-connect-deep-blue shadow-xl shadow-connect-blue/30 transition-transform duration-300 hover:scale-[1.04]">
        <div className="flex h-full w-full -rotate-45 flex-col items-center justify-center text-center text-white">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-white/75 sm:text-[10px]">{label}</span>
          <span className="text-2xl font-extrabold leading-tight sm:text-3xl">
            {loading ? "..." : <CountUp value={value} suffix={suffix} />}
          </span>
          <span className="max-w-[6.5rem] text-[9px] font-semibold uppercase leading-tight tracking-wide text-white/75 sm:text-[10px]">
            {caption}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PortalWhyUs({ totalImoveis, totalCidades, totalTemporada, loading }: PortalWhyUsProps) {
  const stats = [
    { label: "Portfólio com", value: totalImoveis, caption: "imóveis ativos" },
    { label: "Presente em", value: totalCidades, caption: "cidades do Ceará" },
    { label: "Opções de", value: totalTemporada, caption: "temporada no litoral" },
    { label: "Atendimento", value: 6, suffix: " dias", caption: "por semana, das 8h às 20h" },
  ];

  return (
    <section id="sobre" className="relative scroll-mt-[72px] overflow-hidden bg-portal-sand py-16 sm:py-24">
      {/* Traços diagonais decorativos, ecoando o bloco "Por que" da referência */}
      <div aria-hidden className="pointer-events-none absolute -right-6 top-10 hidden gap-3 md:flex">
        {["bg-platz-gold", "bg-portal-field", "bg-platz-gold/60", "bg-portal-field/70"].map((c, i) => (
          <span key={i} className={`block h-28 w-3 -skew-x-[25deg] rounded-full ${c}`} />
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute -left-4 bottom-12 hidden gap-3 md:flex">
        {["bg-portal-field/70", "bg-portal-field"].map((c, i) => (
          <span key={i} className={`block h-20 w-3 -skew-x-[25deg] rounded-full ${c}`} />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <PortalSectionTitle
            align="center"
            title="POR QUE A CONNECT PLATZ?"
            subtitle="Comprar, vender ou alugar é uma decisão importante. Você merece a confiança de quem conhece a região."
          />
        </Reveal>

        <div className="mt-12 grid items-center gap-12 lg:mt-16 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-10">
            {stats.map((s, i) => (
              <div key={s.label} className={i % 2 === 1 ? "translate-y-10" : ""}>
                <StatPin {...s} loading={loading && i < 3} />
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.1} className="mt-6 overflow-hidden rounded-2xl bg-portal-surface shadow-xl shadow-portal-navy/10 lg:mt-0">
            <img
              src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=75"
              alt="Sala de estar ampla e iluminada"
              loading="lazy"
              className="aspect-video w-full object-cover"
            />
            <div className="p-6 sm:p-8">
              <p className="text-xl font-semibold leading-snug text-portal-ink sm:text-2xl">
                Uma imobiliária local, com processo de rede grande.
              </p>
              <ul className="mt-6 space-y-5">
                {DIFERENCIAIS.map(({ icon: Icon, titulo, texto }) => (
                  <li key={titulo} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-connect-blue/10 text-connect-blue">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-portal-ink">{titulo}</span>
                      <span className="block text-sm leading-relaxed text-portal-slate">{texto}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="mt-16 flex justify-center">
          <a
            href={waLink("Olá! Gostaria de falar com um corretor da Connect Platz.")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-connect-blue px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-connect-blue/30 transition-all hover:scale-[1.02] hover:bg-connect-deep-blue hover:shadow-connect-blue/40 active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com corretor
          </a>
        </div>
      </div>
    </section>
  );
}
