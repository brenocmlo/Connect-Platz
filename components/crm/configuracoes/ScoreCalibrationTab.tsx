"use client";

import React, { useEffect, useState } from "react";
import { Save, RotateCcw, Phone, Banknote, CalendarCheck, Thermometer } from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { useCrm } from "@/components/crm/CrmContext";
import { DEFAULT_SCORE_RULES, ScoreRulesConfig } from "@/lib/domain/scoring/leadScore";
import { requestJson, useConfigResource } from "./configApi";
import { ConfigCard, ConfigError, ConfigSkeleton, SaveButton, flash } from "./ConfigUi";
import { ScoreSimulator } from "./ScoreSimulator";

type RuleKey = keyof ScoreRulesConfig;

interface RuleField {
  key: RuleKey;
  label: string;
  unit: string;
  max: number;
  step?: number;
}

const GROUPS: { title: string; icon: React.ElementType; tint: string; fields: RuleField[] }[] = [
  {
    title: "Dados de Contato",
    icon: Phone,
    tint: "text-connect-blue",
    fields: [
      { key: "phonePoints", label: "Telefone / WhatsApp válido", unit: "pts", max: 100 },
      { key: "emailPoints", label: "E-mail informado", unit: "pts", max: 100 },
      { key: "propertyPoints", label: "Imóvel / região de interesse", unit: "pts", max: 100 },
      { key: "fastResponsePoints", label: "1º contato em até 5 min (metade até 30 min)", unit: "pts", max: 100 },
    ],
  },
  {
    title: "Qualificação Financeira",
    icon: Banknote,
    tint: "text-emerald-500",
    fields: [
      { key: "incomePoints", label: "Renda ≥ mínimo (metade se abaixo)", unit: "pts", max: 100 },
      { key: "highIncomeMin", label: "Renda mínima para pontuação cheia", unit: "R$", max: 10_000_000, step: 100 },
      { key: "docPoints", label: "Documentos anexados", unit: "pts", max: 100 },
    ],
  },
  {
    title: "Maturação no Funil",
    icon: CalendarCheck,
    tint: "text-amber-500",
    fields: [
      { key: "visitPoints", label: "Visita agendada / realizada", unit: "pts", max: 100 },
      { key: "proposalPoints", label: "Proposta enviada (soma à visita)", unit: "pts", max: 100 },
    ],
  },
  {
    title: "Classificação",
    icon: Thermometer,
    tint: "text-orange-500",
    fields: [
      { key: "hotThreshold", label: "🔥 Lead Quente a partir de", unit: "pts", max: 100 },
      { key: "warmThreshold", label: "☕ Lead Morno a partir de", unit: "pts", max: 99 },
    ],
  },
];

export function ScoreCalibrationTab() {
  const { setActionMessage } = useCrm();
  const { data, loading, error, reload } = useConfigResource<{ rules: ScoreRulesConfig }>("/api/configuracoes/score");
  const [rules, setRules] = useState<ScoreRulesConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.rules) setRules(data.rules);
  }, [data]);

  if (loading && !rules) return <ConfigSkeleton />;
  if (error && !rules) return <ConfigError message={error} onRetry={reload} />;
  if (!rules) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const res = await requestJson<{ rules: ScoreRulesConfig; recalculados: number; totalAbertos: number }>(
        "/api/configuracoes/score",
        "PUT",
        rules
      );
      setRules(res.rules);
      flash(
        setActionMessage,
        `Régua de score salva! ${res.recalculados} de ${res.totalAbertos} lead(s) aberto(s) recalculado(s).`,
        4500
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar a régua de score.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setRules({ ...DEFAULT_SCORE_RULES });
    flash(setActionMessage, "Valores padrão carregados. Clique em salvar para aplicar.");
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <ConfigCard className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <SectionTitle title="Régua Determinística de Pontuação (0 a 100)" />
            <p className="text-xs text-muted-foreground mt-1">
              Pontos somados a cada lead conforme dados, agilidade de atendimento e avanço no funil. Ao salvar, os
              leads abertos são recalculados.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar padrão</span>
          </button>
        </div>

        {formError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-xs pt-2">
          {GROUPS.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.title} className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Icon className={`w-4 h-4 ${g.tint}`} />
                  <span>{g.title}</span>
                </div>
                <div className="space-y-2.5">
                  {g.fields.map((f) => (
                    <div key={f.key}>
                      <label className="block text-muted-foreground font-medium mb-1">{f.label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={f.max}
                          step={f.step || 1}
                          required
                          value={rules[f.key]}
                          onChange={(e) => setRules({ ...rules, [f.key]: Number(e.target.value) })}
                          className={`${f.unit === "R$" ? "w-28" : "w-20"} bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue`}
                        />
                        <span className="text-muted-foreground text-[11px]">{f.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ConfigCard>

      <ScoreSimulator rules={rules} />

      <div className="flex justify-end">
        <SaveButton saving={saving} label="Salvar Parâmetros do Score" icon={Save} />
      </div>
    </form>
  );
}
