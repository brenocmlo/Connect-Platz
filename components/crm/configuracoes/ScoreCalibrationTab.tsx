"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Save,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  FileCheck,
  Phone,
  Banknote,
  CalendarCheck,
} from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { useCrm } from "@/components/crm/CrmContext";
import { ScoreBadge } from "@/components/crm/primitives/ScoreBadge";
import { logAuditEvent } from "@/lib/services/auditLogger";

export interface ScoreRulesConfig {
  phonePoints: number;
  emailPoints: number;
  propertyPoints: number;
  incomePoints: number;
  docPoints: number;
  visitPoints: number;
  proposalPoints: number;
  hotThreshold: number;
  warmThreshold: number;
}

const defaultScoreRules: ScoreRulesConfig = {
  phonePoints: 15,
  emailPoints: 10,
  propertyPoints: 10,
  incomePoints: 15,
  docPoints: 15,
  visitPoints: 15,
  proposalPoints: 20,
  hotThreshold: 70,
  warmThreshold: 40,
};

export function ScoreCalibrationTab() {
  const { setActionMessage } = useCrm();
  const [rules, setRules] = useState<ScoreRulesConfig>(defaultScoreRules);

  // Estado para o simulador interativo
  const [simPhone, setSimPhone] = useState(true);
  const [simEmail, setSimEmail] = useState(true);
  const [simProp, setSimProp] = useState(true);
  const [simIncome, setSimIncome] = useState(true);
  const [simDocs, setSimDocs] = useState(false);
  const [simVisit, setSimVisit] = useState(true);
  const [simProposal, setSimProposal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("connect_platz_score_rules");
      if (saved) {
        setRules(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const simulatedScore =
    (simPhone ? rules.phonePoints : 0) +
    (simEmail ? rules.emailPoints : 0) +
    (simProp ? rules.propertyPoints : 0) +
    (simIncome ? rules.incomePoints : 0) +
    (simDocs ? rules.docPoints : 0) +
    (simVisit ? rules.visitPoints : 0) +
    (simProposal ? rules.proposalPoints : 0);

  const boundedScore = Math.min(100, Math.max(0, simulatedScore));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("connect_platz_score_rules", JSON.stringify(rules));

    logAuditEvent({
      usuario: {
        id: "current-user",
        nome: "Robson Carvalho",
        email: "robson@connectplatz.com.br",
        role: "ADMINISTRADOR",
      },
      acao: "Atualização da Régua de Score de Leads",
      tipoAcao: "UPDATE",
      modulo: "SISTEMA",
      detalhes: `Parâmetros de score calibrados: Quente >= ${rules.hotThreshold}, Morno >= ${rules.warmThreshold}.`,
      entidadeAfetada: {
        tipo: "Configuracao",
        id: "score-rules",
        nome: "Régua Determinística de Score",
      },
    });

    setActionMessage("Régua de pontuação de score salva com sucesso!");
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleReset = () => {
    setRules(defaultScoreRules);
    localStorage.setItem("connect_platz_score_rules", JSON.stringify(defaultScoreRules));
    setActionMessage("Régua restaurada para os valores padrão de fábrica.");
    setTimeout(() => setActionMessage(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. SEÇÃO DE PONTUAÇÃO POR DADOS CADASTRAIS & QUALIFICAÇÃO */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <SectionTitle title="Régua Determinística de Pontuação (0 a 100)" />
            <p className="text-xs text-muted-foreground mt-1">
              Defina os pontos somados a cada lead conforme o enriquecimento de dados e avanço no funil.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Padrão</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
          {/* Card 1: Contato */}
          <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Phone className="w-4 h-4 text-connect-blue" />
              <span>Dados de Contato</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  Telefone / WhatsApp Válido
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={rules.phonePoints}
                    onChange={(e) => setRules({ ...rules, phonePoints: Number(e.target.value) })}
                    className="w-20 bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold text-center"
                  />
                  <span className="text-muted-foreground text-[11px]">pontos</span>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  E-mail Informado
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={rules.emailPoints}
                    onChange={(e) => setRules({ ...rules, emailPoints: Number(e.target.value) })}
                    className="w-20 bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold text-center"
                  />
                  <span className="text-muted-foreground text-[11px]">pontos</span>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  Empreendimento Definido
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={rules.propertyPoints}
                    onChange={(e) => setRules({ ...rules, propertyPoints: Number(e.target.value) })}
                    className="w-20 bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold text-center"
                  />
                  <span className="text-muted-foreground text-[11px]">pontos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Financeiro */}
          <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Banknote className="w-4 h-4 text-emerald-500" />
              <span>Qualificação Financeira</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  Renda Declarada Informada
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={rules.incomePoints}
                    onChange={(e) => setRules({ ...rules, incomePoints: Number(e.target.value) })}
                    className="w-20 bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold text-center"
                  />
                  <span className="text-muted-foreground text-[11px]">pontos</span>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  Documentação de Renda Anexada
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={rules.docPoints}
                    onChange={(e) => setRules({ ...rules, docPoints: Number(e.target.value) })}
                    className="w-20 bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold text-center"
                  />
                  <span className="text-muted-foreground text-[11px]">pontos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Funil */}
          <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <CalendarCheck className="w-4 h-4 text-amber-500" />
              <span>Maturação no Funil</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  Visita Agendada / Realizada
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={rules.visitPoints}
                    onChange={(e) => setRules({ ...rules, visitPoints: Number(e.target.value) })}
                    className="w-20 bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold text-center"
                  />
                  <span className="text-muted-foreground text-[11px]">pontos</span>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  Proposta Comercial Enviada
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={rules.proposalPoints}
                    onChange={(e) => setRules({ ...rules, proposalPoints: Number(e.target.value) })}
                    className="w-20 bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold text-center"
                  />
                  <span className="text-muted-foreground text-[11px]">pontos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SIMULADOR INTERATIVO */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-foreground text-xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Simulador Interativo de Score</span>
          </div>
          <ScoreBadge score={boundedScore} size="md" showLabel={true} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <label className="flex items-center gap-2 p-2.5 bg-background border border-border rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={simPhone}
              onChange={(e) => setSimPhone(e.target.checked)}
              className="rounded text-connect-blue"
            />
            <span className="text-muted-foreground">Telefone (+{rules.phonePoints})</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-background border border-border rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={simEmail}
              onChange={(e) => setSimEmail(e.target.checked)}
              className="rounded text-connect-blue"
            />
            <span className="text-muted-foreground">E-mail (+{rules.emailPoints})</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-background border border-border rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={simIncome}
              onChange={(e) => setSimIncome(e.target.checked)}
              className="rounded text-connect-blue"
            />
            <span className="text-muted-foreground">Renda (+{rules.incomePoints})</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-background border border-border rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={simVisit}
              onChange={(e) => setSimVisit(e.target.checked)}
              className="rounded text-connect-blue"
            />
            <span className="text-muted-foreground">Visita (+{rules.visitPoints})</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-background border border-border rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={simProposal}
              onChange={(e) => setSimProposal(e.target.checked)}
              className="rounded text-connect-blue"
            />
            <span className="text-muted-foreground">Proposta (+{rules.proposalPoints})</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-background border border-border rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={simDocs}
              onChange={(e) => setSimDocs(e.target.checked)}
              className="rounded text-connect-blue"
            />
            <span className="text-muted-foreground">Docs Renda (+{rules.docPoints})</span>
          </label>
        </div>
      </div>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="flex items-center gap-2 bg-connect-blue hover:bg-connect-blue/90 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-md shadow-connect-blue/20 transition-all hover:scale-[1.02]"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Parâmetros do Score</span>
        </button>
      </div>
    </form>
  );
}
