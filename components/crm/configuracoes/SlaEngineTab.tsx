"use client";

import React, { useEffect, useState } from "react";
import { Clock, Save, Info, Layers } from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { useCrm } from "@/components/crm/CrmContext";
import { requestJson, useConfigResource } from "./configApi";
import { ConfigCard, ConfigError, ConfigSkeleton, SaveButton, flash, inputClass } from "./ConfigUi";

type ExpireAction = "transbordo" | "bolsao" | "notificar";

interface StageSla {
  id: string;
  nome: string;
  posicao: number;
  cor: string;
  slaMinutes: number | null;
  actionOnExpire: ExpireAction | string;
}

interface SlaState {
  bolsaoEnabled: boolean;
  bolsaoTimeoutMin: number;
  operatingStart: string;
  operatingEnd: string;
  funnel: { id: string; nome: string } | null;
  stages: StageSla[];
}

const ACTION_OPTIONS: { value: ExpireAction; label: string }[] = [
  { value: "transbordo", label: "Transbordar para o próximo corretor" },
  { value: "bolsao", label: "Mover para o Bolsão" },
  { value: "notificar", label: "Apenas notificar o gestor" },
];

export function SlaEngineTab() {
  const { setActionMessage } = useCrm();
  const { data, loading, error, reload } = useConfigResource<SlaState>("/api/configuracoes/sla");
  const [state, setState] = useState<SlaState | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setState(data);
  }, [data]);

  if (loading && !state) return <ConfigSkeleton />;
  if (error && !state) return <ConfigError message={error} onRetry={reload} />;
  if (!state) return null;

  const updateStage = (id: string, patch: Partial<StageSla>) =>
    setState((prev) =>
      prev ? { ...prev, stages: prev.stages.map((s) => (s.id === id ? { ...s, ...patch } : s)) } : prev
    );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const res = await requestJson<SlaState>("/api/configuracoes/sla", "PATCH", {
        bolsaoEnabled: state.bolsaoEnabled,
        bolsaoTimeoutMin: Number(state.bolsaoTimeoutMin),
        stages: state.stages.map((s) => ({
          id: s.id,
          slaMinutes: s.slaMinutes === null || Number.isNaN(s.slaMinutes) ? null : Number(s.slaMinutes),
          actionOnExpire: s.actionOnExpire,
        })),
      });
      setState(res);
      flash(setActionMessage, "Parâmetros do motor de SLA e Bolsão salvos com sucesso!");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar as regras de SLA.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {formError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
          {formError}
        </div>
      )}

      {/* 1. BOLSÃO & JANELA OPERACIONAL */}
      <ConfigCard>
        <SectionTitle title="Bolsão de Oportunidades & Janela Operacional" />
        <p className="text-xs text-muted-foreground">
          Tempo de permanência no Bolsão antes do transbordo automático e horário em que a roleta distribui leads.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">Tempo para Transbordo Automático</label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={1440}
                required
                value={state.bolsaoTimeoutMin}
                onChange={(e) => setState({ ...state, bolsaoTimeoutMin: Number(e.target.value) })}
                className={inputClass}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground text-[11px]">minutos</span>
            </div>
          </div>

          <div className="sm:col-span-2 p-3 rounded-lg bg-muted/40 border border-border flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-connect-blue shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground block">
                Janela operacional: {state.operatingStart} às {state.operatingEnd}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Fora deste horário os leads aguardam na fila noturna. Alterável pelo Administrador em &quot;Dados da Imobiliária&quot;.
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <label className="flex items-center justify-between p-3.5 bg-muted/40 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors">
            <div>
              <span className="text-xs font-semibold text-foreground block">Bolsão de Oportunidades Automático</span>
              <span className="text-[11px] text-muted-foreground">
                Leads com SLA estourado ficam disponíveis para corretores com status &quot;Disponível&quot;
              </span>
            </div>
            <input
              type="checkbox"
              checked={state.bolsaoEnabled}
              onChange={(e) => setState({ ...state, bolsaoEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-connect-blue focus:ring-connect-blue"
            />
          </label>
        </div>
      </ConfigCard>

      {/* 2. SLA POR ETAPA */}
      <ConfigCard>
        <SectionTitle title="SLA por Etapa do Funil" />
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-connect-blue" />
          {state.funnel
            ? `Funil ativo: ${state.funnel.nome}. Deixe o SLA vazio para etapas sem prazo.`
            : "Nenhum funil ativo cadastrado."}
        </p>

        {state.stages.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <Info className="w-5 h-5" />
            Nenhuma etapa encontrada no funil ativo da organização.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {state.stages.map((st, idx) => (
              <div
                key={st.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-muted/40 border border-border rounded-xl text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-connect-blue/10 text-connect-blue font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.cor }} />
                  <span className="font-bold text-foreground text-xs">{st.nome}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">SLA:</span>
                    <input
                      type="number"
                      min={1}
                      max={43200}
                      value={st.slaMinutes ?? ""}
                      placeholder="—"
                      onChange={(e) =>
                        updateStage(st.id, { slaMinutes: e.target.value === "" ? null : Number(e.target.value) })
                      }
                      className="w-20 bg-background border border-border rounded-lg p-1.5 text-foreground text-center font-mono font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue"
                    />
                    <span className="text-muted-foreground">min</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Ao estourar:</span>
                    <select
                      value={st.actionOnExpire}
                      onChange={(e) => updateStage(st.id, { actionOnExpire: e.target.value })}
                      className="bg-background border border-border rounded-lg p-1.5 text-foreground text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue"
                    >
                      {ACTION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ConfigCard>

      <div className="flex justify-end">
        <SaveButton saving={saving} label="Salvar Regras de SLA" icon={Save} />
      </div>
    </form>
  );
}
