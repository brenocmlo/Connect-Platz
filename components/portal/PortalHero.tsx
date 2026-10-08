"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import { ChevronDown, Search, Tag, Waves } from "lucide-react";
import type { PortalFilters } from "./types";
import { BEDROOM_OPTIONS, PRICE_RANGES, PROPERTY_TYPES } from "./portalUtils";

const HERO_PHOTO =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80";

const TABS = [
  { id: "VENDA" as const, label: "Comprar", icon: Tag },
  { id: "VERANEIO" as const, label: "Temporada", icon: Waves },
];

function HeroSelect({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none truncate rounded-lg border border-portal-field bg-portal-surface pl-3 pr-8 text-sm text-portal-ink transition-colors hover:border-portal-slate/60 focus:border-connect-blue focus:outline-none focus:ring-2 focus:ring-connect-blue/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-portal-slate" />
    </div>
  );
}

export function PortalHero({ onSearch }: { onSearch: (filters: PortalFilters) => void }) {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<"VENDA" | "VERANEIO">("VENDA");
  const [localizacao, setLocalizacao] = useState("");
  const [tipoImovel, setTipoImovel] = useState("TODOS");
  const [quartosMin, setQuartosMin] = useState("TODOS");
  const [faixaPreco, setFaixaPreco] = useState("TODOS");

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeTab = (id: "VENDA" | "VERANEIO") => {
    setTab(id);
    setFaixaPreco("TODOS");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({ modalidade: tab, localizacao: localizacao.trim(), tipoImovel, quartosMin, faixaPreco });
  };

  const enter = (delay: number): MotionProps =>
    reduce || !mounted
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0, 0, 0.2, 1] as const },
        };

  return (
    <section className="relative isolate overflow-hidden bg-portal-navy">
      <img
        src={HERO_PHOTO}
        alt="Casa moderna com piscina ao entardecer"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-portal-navy/90 via-portal-navy/60 to-portal-navy/10" />

      <div className="mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 md:min-h-[620px] lg:py-20">
        <motion.h1
          {...enter(0)}
          className="max-w-xl text-[1.65rem] leading-snug text-white drop-shadow-sm sm:text-3xl lg:text-4xl"
        >
          <span className="block font-normal">Seja qual for o seu momento de vida,</span>
          <span className="block font-extrabold uppercase tracking-tight">
            a Connect Platz tem o imóvel certo para você.
          </span>
        </motion.h1>
        <motion.p {...enter(0.08)} className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
          Venda e temporada em Fortaleza e no litoral, com corretores especialistas e crédito facilitado.
        </motion.p>

        <motion.form {...enter(0.16)} onSubmit={submit} className="mt-8 w-full max-w-[540px]">
          <div role="tablist" aria-label="Modalidade" className="inline-flex gap-2 rounded-t-xl bg-portal-surface p-2 pb-0">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => changeTab(id)}
                  className={`flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-connect-blue text-white shadow-md shadow-connect-blue/30"
                      : "border border-portal-line text-portal-ink hover:border-connect-blue/40"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="rounded-b-xl rounded-tr-xl bg-portal-surface p-3 shadow-2xl shadow-portal-navy-deep/40 sm:p-4">
            <label htmlFor="hero-local" className="sr-only">
              Onde você procura?
            </label>
            <div className="relative">
              <input
                id="hero-local"
                type="text"
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                placeholder="Bairro, praia ou cidade"
                className="h-12 w-full rounded-full border border-portal-field bg-portal-surface pl-5 pr-14 text-base text-portal-ink placeholder:text-slate-500 focus:border-connect-blue focus:outline-none focus:ring-2 focus:ring-connect-blue/30 sm:text-sm"
              />
              <button
                type="submit"
                aria-label="Buscar imóveis"
                className="absolute right-1 top-1 hidden h-10 w-10 items-center justify-center rounded-full bg-connect-blue text-white shadow-md shadow-connect-blue/30 transition-all hover:bg-connect-deep-blue active:scale-95 sm:flex"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <HeroSelect label="Tipo de imóvel" value={tipoImovel} onChange={setTipoImovel} options={PROPERTY_TYPES} />
              <HeroSelect label="Quartos" value={quartosMin} onChange={setQuartosMin} options={BEDROOM_OPTIONS} />
              <HeroSelect
                label="Faixa de preço"
                value={faixaPreco}
                onChange={setFaixaPreco}
                options={PRICE_RANGES[tab]}
                className="col-span-2 sm:col-span-1"
              />
            </div>

            <button
              type="submit"
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-connect-blue to-connect-deep-blue text-sm font-bold text-white shadow-lg shadow-connect-blue/30 active:scale-[0.98] sm:hidden"
            >
              <Search className="h-4 w-4" />
              Buscar imóveis
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
