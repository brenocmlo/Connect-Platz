"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Info, MessageCircle, TriangleAlert } from "lucide-react";
import { Reveal } from "./PortalUI";
import { formatBRL, waLink } from "./portalUtils";

// Premissas fixas e públicas da estimativa (100% determinística, sem consulta externa).
const TAXA_ANUAL = 0.105;
const PRAZO_MESES = 360;
const COMPROMETIMENTO = 0.3;
const ENTRADA_MINIMA = 0.2;

const REGIMES = [
  "Carteira assinada (CLT)",
  "Autônomo / profissional liberal",
  "Empresário / sócio",
  "Servidor público",
];

const digitsOnly = (v: string) => Number(v.replace(/\D/g, "")) || 0;

function MoneyField({ id, label, value, onChange, hint }: { id: string; label: string; value: number; onChange: (v: number) => void; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-portal-ink">
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        value={value ? formatBRL(value) : ""}
        onChange={(e) => onChange(digitsOnly(e.target.value))}
        placeholder="R$ 0"
        className="h-12 rounded-lg border border-portal-field bg-portal-surface px-3 text-base text-portal-ink placeholder:text-slate-500 focus:border-connect-blue focus:outline-none focus:ring-2 focus:ring-connect-blue/30 sm:text-sm"
      />
      {hint && <p className="text-xs text-portal-slate">{hint}</p>}
    </div>
  );
}

export function PortalCreditSimulator() {
  const [regime, setRegime] = useState(REGIMES[0]);
  const [valorImovel, setValorImovel] = useState(800000);
  const [renda, setRenda] = useState(16000);
  const [entrada, setEntrada] = useState(160000);

  const sim = useMemo(() => {
    const financiado = Math.max(valorImovel - entrada, 0);
    const i = Math.pow(1 + TAXA_ANUAL, 1 / 12) - 1;
    const parcela = financiado > 0 ? (financiado * i) / (1 - Math.pow(1 + i, -PRAZO_MESES)) : 0;
    const parcelaMaxima = renda * COMPROMETIMENTO;
    const entradaOk = valorImovel > 0 && entrada >= valorImovel * ENTRADA_MINIMA;
    return { financiado, parcela, parcelaMaxima, entradaOk, cabeNaRenda: parcela > 0 && parcela <= parcelaMaxima };
  }, [valorImovel, renda, entrada]);

  const aprovavel = sim.entradaOk && sim.cabeNaRenda;
  const mensagem =
    `Olá! Fiz uma simulação no site da Connect Platz. Regime: ${regime}. ` +
    `Imóvel: ${formatBRL(valorImovel)}. Entrada: ${formatBRL(entrada)}. Renda: ${formatBRL(renda)}. ` +
    `Parcela estimada: ${formatBRL(sim.parcela)}. Gostaria de uma proposta de financiamento.`;

  return (
    <section id="simulador" className="scroll-mt-[72px] bg-portal-mist py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="grid overflow-hidden rounded-2xl shadow-2xl shadow-portal-navy/15 ring-1 ring-portal-line lg:grid-cols-[0.95fr_1.05fr]">
          {/* Painel de resultado */}
          <div className="relative overflow-hidden bg-portal-navy p-6 text-white sm:p-10">
            <span aria-hidden className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-connect-blue/30 blur-3xl" />
            <h2 className="relative text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
              Simule seu crédito imobiliário
            </h2>
            <span aria-hidden className="relative mt-4 block h-[3px] w-12 rounded-full bg-platz-gold" />
            <p className="relative mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Uma estimativa rápida para saber quanto da sua renda a parcela vai comprometer.
            </p>

            <dl className="relative mt-8 grid grid-cols-2 gap-4">
              <div className="col-span-2 rounded-xl bg-white/10 p-5 ring-1 ring-white/10">
                <dt className="text-xs font-semibold uppercase tracking-wider text-white/60">Parcela estimada</dt>
                <dd className="mt-1 text-3xl font-extrabold text-platz-gold-light sm:text-4xl">{formatBRL(sim.parcela)}</dd>
                <dd className="mt-1 text-xs text-white/60">em {PRAZO_MESES / 12} anos, tabela Price</dd>
              </div>
              <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                <dt className="text-xs text-white/60">Valor financiado</dt>
                <dd className="mt-1 text-lg font-bold">{formatBRL(sim.financiado)}</dd>
              </div>
              <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                <dt className="text-xs text-white/60">Parcela máxima (30%)</dt>
                <dd className="mt-1 text-lg font-bold">{formatBRL(sim.parcelaMaxima)}</dd>
              </div>
            </dl>

            <p
              role="status"
              className={`relative mt-6 flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
                aprovavel ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-100"
              }`}
            >
              {aprovavel ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
              {!sim.entradaOk
                ? "A maioria dos bancos pede entrada mínima de 20% do valor do imóvel."
                : sim.cabeNaRenda
                  ? "A parcela cabe nos 30% da sua renda. Bom perfil para aprovação."
                  : "A parcela passa de 30% da renda. Aumentar a entrada ou compor renda com outra pessoa ajuda."}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5 bg-portal-surface p-6 sm:p-10">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sim-regime" className="text-sm font-medium text-portal-ink">
                Regime de trabalho
              </label>
              <div className="relative">
                <select
                  id="sim-regime"
                  value={regime}
                  onChange={(e) => setRegime(e.target.value)}
                  className="h-12 w-full appearance-none rounded-lg border border-portal-field bg-portal-surface px-3 pr-9 text-base text-portal-ink focus:border-connect-blue focus:outline-none focus:ring-2 focus:ring-connect-blue/30 sm:text-sm"
                >
                  {REGIMES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-portal-slate" />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <MoneyField id="sim-valor" label="Valor do imóvel" value={valorImovel} onChange={setValorImovel} />
              <MoneyField id="sim-renda" label="Renda mensal comprovada" value={renda} onChange={setRenda} />
            </div>
            <MoneyField
              id="sim-entrada"
              label="Valor de entrada"
              value={entrada}
              onChange={setEntrada}
              hint={valorImovel > 0 ? `${Math.round((entrada / valorImovel) * 100)}% do valor do imóvel` : undefined}
            />

            <p className="flex items-start gap-2 text-xs leading-relaxed text-portal-slate">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Estimativa com taxa de referência de {String(TAXA_ANUAL * 100).replace(".", ",")}% ao ano, sem seguros e tarifas. A
              proposta final depende da análise do banco.
            </p>

            <a
              href={waLink(mensagem)}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-connect-blue px-6 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-connect-blue/25 transition-all hover:scale-[1.02] hover:bg-connect-deep-blue active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
              Receber proposta
            </a>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
