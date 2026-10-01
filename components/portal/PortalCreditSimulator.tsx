"use client";

import React from "react";
import { Sparkles, FileCheck, ShieldCheck, CheckCircle2 } from "lucide-react";

export function PortalCreditSimulator() {
  return (
    <>
      {/* SEÇÃO INSTITUCIONAL: DIFERENCIAIS CONNECT PLATZ */}
      <section id="sobre" className="bg-[#080C14] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#D9BB4C] uppercase tracking-wider">
              Padrão Internacional de Atendimento
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Por que escolher a Connect Platz?
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Inspirada nas maiores redes imobiliárias do mundo, combinando agilidade digital e atendimento exclusivo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-connect-blue/20 flex items-center justify-center text-connect-blue mb-4">
                <Sparkles className="w-6 h-6 text-connect-blue" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Atendimento Imediato (&lt; 3 Segundos)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nosso motor de inteligência e roleta distribui seu interesse instantaneamente a um corretor online especialista no empreendimento.
              </p>
            </div>

            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-[#D9BB4C]/20 flex items-center justify-center text-[#D9BB4C] mb-4">
                <FileCheck className="w-6 h-6 text-[#D9BB4C]" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Esteira de Crédito Desburocratizada
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assessoria completa para aprovação de financiamento bancário para profissionais CLT e Autônomos junto à Caixa, Santander, Itaú e Bradesco.
              </p>
            </div>

            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Segurança Jurídica & Bloqueio de Reservas
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Contratos auditados e sistema com trava automática de calendário em locações de temporada para garantia absoluta contra choque de datas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SIMULADOR DE CRÉDITO IMOBILIÁRIO (CLT vs AUTÔNOMO) */}
      <section id="simulador" className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-[#111827] border-2 border-[#D9BB4C]/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9BB4C]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-lg mx-auto mb-8">
            <span className="text-xs font-bold text-[#D9BB4C] uppercase tracking-wider">
              Financiamento Facilitado
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Simule seu Crédito Imobiliário
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Descubra o potencial de financiamento para o seu perfil profissional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Regime de Trabalho</label>
              <select className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-3 text-white focus:outline-none">
                <option>Carteira Assinada (CLT)</option>
                <option>Autônomo / Profissional Liberal</option>
                <option>Empresário / Sócio de Empresa</option>
                <option>Servidor Público</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Valor Estimado do Imóvel</label>
              <input
                type="text"
                defaultValue="R$ 800.000,00"
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-3 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Renda Mensal Comprovada</label>
              <input
                type="text"
                defaultValue="R$ 16.000,00"
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-3 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Valor de Entrada Pretendido</label>
              <input
                type="text"
                defaultValue="R$ 160.000,00 (20%)"
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-3 text-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 pt-3">
              <a
                href="https://wa.me/5585999990001?text=Ol%C3%A1!%20Gostaria%20de%20uma%20simula%C3%A7%C3%A3o%20completa%20de%20financiamento%20imobili%C3%A1rio%20com%20a%20Connect%20Platz."
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#D9BB4C] hover:bg-[#C4A73D] text-black font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                Receber Proposta de Financiamento sem Compromisso
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
