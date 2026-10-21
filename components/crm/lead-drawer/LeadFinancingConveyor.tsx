"use client";

import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck2,
  ShieldCheck,
  Send,
  Compass,
  FileText,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";
import { LeadDetail } from "../LeadDrawer";

interface LeadFinancingConveyorProps {
  lead: LeadDetail;
}

interface FinancingStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const financingSteps: FinancingStep[] = [
  {
    id: "coleta_docs",
    label: "1. Coleta de Documentos",
    description: "3 Holerites CLT ou Extratos + Renda Autônomo e CNH/RG",
    icon: FileText,
  },
  {
    id: "dossie_montado",
    label: "2. Montagem de Dossiê",
    description: "Pasta de crédito estruturada para protocolo bancário",
    icon: FileCheck2,
  },
  {
    id: "envio_correspondente",
    label: "3. Correspondente Bancário",
    description: "Protocolado no Caixa Aqui / Mesa de Crédito Privada",
    icon: Send,
  },
  {
    id: "avaliacao_engenharia",
    label: "4. Vistoria & Engenharia",
    description: "Perito avalia valor venal e habite-se do imóvel",
    icon: Compass,
  },
  {
    id: "credito_aprovado",
    label: "5. Crédito Aprovado",
    description: "Carta de crédito emitida com valor e taxa garantidos",
    icon: ShieldCheck,
  },
  {
    id: "emissao_contrato",
    label: "6. Minuta de Financiamento",
    description: "Banco emite o contrato formal de financiamento",
    icon: Building2,
  },
  {
    id: "assinatura_registro",
    label: "7. Assinatura & Cartório",
    description: "Assinatura das partes e averbação no Registro de Imóveis",
    icon: BadgeCheck,
  },
];

export function LeadFinancingConveyor({ lead }: LeadFinancingConveyorProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(1); // Exemplo: Dossiê montado
  const [banco, setBanco] = useState("Caixa Econômica Federal");
  const [correspondente, setCorrespondente] = useState("Caixa Aqui — Aldeota Negócios");
  const [numeroProposta, setNumeroProposta] = useState("CX-98421/2026");
  const [valorAprovado, setValorAprovado] = useState(380000);
  const [valorEntrada, setValorEntrada] = useState(95000);
  const [validadeDias, setValidadeDias] = useState(90);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const totalImovel = valorAprovado + valorEntrada;
  const percFinanciado = totalImovel > 0 ? Math.round((valorAprovado / totalImovel) * 100) : 80;

  const handleAdvanceStep = () => {
    if (currentStepIdx < financingSteps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      const nextStep = financingSteps[nextIdx];
      setActionFeedback(`Financiamento avançado para: "${nextStep.label}"!`);
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  const handleSetStep = (idx: number) => {
    setCurrentStepIdx(idx);
    setActionFeedback(`Etapa ajustada para: "${financingSteps[idx].label}"!`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="bg-[#0F1624] border border-[#1C2537] rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1C2537] pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-connect-blue" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Sub-esteira de Dossiê Bancário & Financiamento
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/15 text-connect-blue border border-connect-blue/30 w-fit">
          Etapa {currentStepIdx + 1} de {financingSteps.length}
        </span>
      </div>

      {actionFeedback && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in-0">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* STEPPER HORIZONTAL INTERATIVO */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
          {financingSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleSetStep(idx)}
                className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? "bg-connect-blue/15 border-connect-blue ring-1 ring-connect-blue/40"
                    : isCompleted
                    ? "bg-emerald-950/20 border-emerald-800/40 hover:bg-emerald-950/40"
                    : "bg-[#080C14] border-[#1C2537] opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isCurrent
                        ? "text-connect-blue animate-pulse"
                        : isCompleted
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  />
                  {isCompleted && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold line-clamp-2 leading-tight ${
                    isCurrent
                      ? "text-white"
                      : isCompleted
                      ? "text-slate-300"
                      : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-[#080C14] border border-[#1C2537] rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-connect-blue animate-pulse" />
            <span className="text-slate-300">
              <strong>Fase Atual:</strong> {financingSteps[currentStepIdx].label} —{" "}
              <span className="text-slate-400">{financingSteps[currentStepIdx].description}</span>
            </span>
          </div>

          {currentStepIdx < financingSteps.length - 1 && (
            <button
              type="button"
              onClick={handleAdvanceStep}
              className="px-3 py-1.5 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <span>Avançar Fase</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* DETALHES DO BANCO & PROPOSTA DE CRÉDITO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
        <div>
          <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Banco Operador</label>
          <select
            value={banco}
            onChange={(e) => setBanco(e.target.value)}
            className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-2.5 text-white focus:outline-none focus:border-connect-blue"
          >
            <option value="Caixa Econômica Federal">Caixa Econômica Federal (Habitação)</option>
            <option value="Itaú Personnalité">Itaú Personnalité / Varejo</option>
            <option value="Bradesco Financiamentos">Bradesco Financiamentos</option>
            <option value="Santander Select">Santander Select / Tradicional</option>
            <option value="Banco do Brasil">Banco do Brasil</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Correspondente Bancário</label>
          <input
            type="text"
            value={correspondente}
            onChange={(e) => setCorrespondente(e.target.value)}
            className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-2.5 text-white focus:outline-none focus:border-connect-blue"
            placeholder="Nome do Correspondente / Contato"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Nº da Proposta Bancária</label>
          <input
            type="text"
            value={numeroProposta}
            onChange={(e) => setNumeroProposta(e.target.value)}
            className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-connect-blue"
            placeholder="Ex: CX-98421"
          />
        </div>
      </div>

      {/* METRICAS DO FINANCIAMENTO APROVADO */}
      <div className="p-3.5 bg-[#080C14] border border-[#1C2537] rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Financiamento Aprovado:</span>
          <span className="text-[#D9BB4C] font-mono font-bold text-sm">
            {valorAprovado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Entrada Requerida:</span>
          <span className="text-white font-mono font-bold text-sm">
            {valorEntrada.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Percentual Financiado:</span>
          <span className="text-emerald-400 font-bold text-sm">{percFinanciado}% do Imóvel</span>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Validade da Carta:</span>
          <span className="text-slate-300 font-bold text-xs flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-amber-500" />
            {validadeDias} dias restantes
          </span>
        </div>
      </div>
    </div>
  );
}
