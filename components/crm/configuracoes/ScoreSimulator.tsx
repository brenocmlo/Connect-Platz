"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { ScoreRulesConfig, computeLeadScore, temperatureFromScore } from "@/lib/domain/scoring/leadScore";

interface ScoreSimulatorProps {
  rules: ScoreRulesConfig;
}

const TEMP_BADGE = {
  QUENTE: { emoji: "🔥", label: "Lead Quente", cls: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  MORNO: { emoji: "☕", label: "Lead Morno", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  FRIO: { emoji: "🧊", label: "Lead Frio", cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" },
} as const;

/** Simula o score com a mesma função determinística usada no servidor (computeLeadScore). */
export function ScoreSimulator({ rules }: ScoreSimulatorProps) {
  const [phone, setPhone] = useState(true);
  const [email, setEmail] = useState(true);
  const [property, setProperty] = useState(true);
  const [income, setIncome] = useState<"none" | "partial" | "high">("high");
  const [fast, setFast] = useState(true);
  const [docs, setDocs] = useState(false);
  const [stage, setStage] = useState(3);

  const now = new Date();
  const score = computeLeadScore(
    {
      telefone: phone ? "85900000000" : "",
      email: email ? "lead@exemplo.com" : null,
      hasPropertyInterest: property,
      rendaDeclarada: income === "high" ? rules.highIncomeMin : income === "partial" ? 1 : null,
      createdAt: now,
      firstContactAt: fast ? now : null,
      documentsCount: docs ? 1 : 0,
      stagePosition: stage,
    },
    rules
  );
  const temp = TEMP_BADGE[temperatureFromScore(score, rules)];

  const check = (label: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label className="flex items-center gap-2 p-2.5 bg-background border border-border rounded-lg cursor-pointer hover:border-connect-blue/40 transition-colors">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded text-connect-blue" />
      <span className="text-muted-foreground">{label}</span>
    </label>
  );

  return (
    <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold text-foreground text-xs">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Simulador de Score</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${temp.cls}`}>
          {temp.emoji} {score}/100 · {temp.label}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {check(`Telefone (${rules.phonePoints} pts)`, phone, setPhone)}
        {check(`E-mail (${rules.emailPoints} pts)`, email, setEmail)}
        {check(`Imóvel de interesse (${rules.propertyPoints} pts)`, property, setProperty)}
        {check(`Resposta em até 5 min (${rules.fastResponsePoints} pts)`, fast, setFast)}
        {check(`Documentos anexados (${rules.docPoints} pts)`, docs, setDocs)}

        <select
          value={income}
          onChange={(e) => setIncome(e.target.value as "none" | "partial" | "high")}
          className="p-2.5 bg-background border border-border rounded-lg text-muted-foreground"
        >
          <option value="none">Sem renda informada</option>
          <option value="partial">Renda abaixo do mínimo</option>
          <option value="high">Renda ≥ mínimo ({rules.incomePoints} pts)</option>
        </select>

        <select
          value={stage}
          onChange={(e) => setStage(Number(e.target.value))}
          className="p-2.5 bg-background border border-border rounded-lg text-muted-foreground sm:col-span-2"
        >
          <option value={1}>Etapa inicial (sem visita)</option>
          <option value={3}>Visita agendada ({rules.visitPoints} pts)</option>
          <option value={4}>Proposta enviada ({rules.visitPoints + rules.proposalPoints} pts)</option>
        </select>
      </div>
    </div>
  );
}
