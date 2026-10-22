"use client";

import React, { useEffect, useState } from "react";
import { X, Award, Gift, Calendar, CheckCircle2, Trash2, Plus, Loader2, AlertTriangle } from "lucide-react";
import { GOAL_METRIC_LABELS, GoalIncentive, GoalInput, GoalMetric } from "./types";

interface AdminGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: GoalIncentive | null;
  /** Persiste via /api/metas; retorna mensagem de erro ou null em caso de sucesso */
  onSave: (input: GoalInput) => Promise<string | null>;
  onDelete?: () => Promise<string | null>;
}

function monthBounds(): { inicio: string; fim: string } {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    inicio: `${now.getFullYear()}-${p(now.getMonth() + 1)}-01`,
    fim: `${last.getFullYear()}-${p(last.getMonth() + 1)}-${p(last.getDate())}`,
  };
}

function emptyForm(): GoalInput {
  return { titulo: "", premio: "", descricao: "", imagemUrl: "", metrica: "VENDAS", objetivo: 1, ...monthBounds() };
}

const inputClass =
  "w-full bg-background border border-border rounded-lg p-2.5 text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";
const labelClass = "block text-foreground font-bold mb-1";

/** Dialog de cadastro/edição de meta (somente gestores). */
export function AdminGoalModal({ isOpen, onClose, currentGoal, onSave, onDelete }: AdminGoalModalProps) {
  const [form, setForm] = useState<GoalInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setForm(
      currentGoal
        ? {
            titulo: currentGoal.titulo,
            premio: currentGoal.premio || "",
            descricao: currentGoal.descricao || "",
            imagemUrl: currentGoal.imagemUrl || "",
            metrica: currentGoal.metrica,
            objetivo: currentGoal.objetivo,
            inicio: currentGoal.inicio,
            fim: currentGoal.fim,
          }
        : emptyForm()
    );
  }, [currentGoal, isOpen]);

  if (!isOpen) return null;

  const set = <K extends keyof GoalInput>(key: K, value: GoalInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const run = async (action: () => Promise<string | null>) => {
    setSaving(true);
    setError(null);
    const message = await action();
    setSaving(false);
    if (message) setError(message);
    else onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.fim < form.inicio) {
      setError("A data de término deve ser igual ou posterior ao início.");
      return;
    }
    run(() => onSave({ ...form, objetivo: Number(form.objetivo) }));
  };

  const handleDelete = () => {
    if (!onDelete) return;
    if (confirm("Tem certeza que deseja remover esta meta? Ela deixará de aparecer para a equipe.")) run(onDelete);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in-0 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-platz-gold/20 text-platz-gold border border-platz-gold/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {currentGoal ? "Editar Meta de Incentivo" : "Cadastrar Nova Meta de Incentivo"}
              </h3>
              <p className="text-xs text-muted-foreground">
                O progresso é calculado automaticamente a partir das vendas, visitas e captações registradas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className={labelClass}>Nome da Campanha *</label>
            <input
              type="text"
              required
              maxLength={120}
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              placeholder="Ex: Campanha Acelera Platz — Q4"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Métrica da Meta *</label>
              <select
                value={form.metrica}
                onChange={(e) => set("metrica", e.target.value as GoalMetric)}
                className={inputClass}
              >
                {(Object.keys(GOAL_METRIC_LABELS) as GoalMetric[]).map((m) => (
                  <option key={m} value={m}>
                    {GOAL_METRIC_LABELS[m].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Objetivo *</label>
              <input
                type="number"
                required
                min={form.metrica === "VGV" ? 0.01 : 1}
                step={form.metrica === "VGV" ? "0.01" : "1"}
                value={form.objetivo}
                onChange={(e) => set("objetivo", Number(e.target.value))}
                className={`${inputClass} font-mono font-bold`}
              />
            </div>
          </div>

          <div>
            <label className={`${labelClass} flex items-center gap-1.5`}>
              <Gift className="w-3.5 h-3.5 text-platz-gold" />
              Premiação
            </label>
            <input
              type="text"
              maxLength={120}
              value={form.premio || ""}
              onChange={(e) => set("premio", e.target.value)}
              placeholder="Ex: Viagem para resort com acompanhante"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Imagem do Prêmio (URL)</label>
            <input
              type="url"
              value={form.imagemUrl || ""}
              onChange={(e) => set("imagemUrl", e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Critérios & Regras</label>
            <textarea
              rows={2}
              maxLength={500}
              value={form.descricao || ""}
              onChange={(e) => set("descricao", e.target.value)}
              placeholder="Ex: Vendas com status ativo no período da campanha."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`${labelClass} flex items-center gap-1.5`}>
                <Calendar className="w-3.5 h-3.5 text-connect-blue" />
                Início *
              </label>
              <input
                type="date"
                required
                value={form.inicio}
                onChange={(e) => set("inicio", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`${labelClass} flex items-center gap-1.5`}>
                <Calendar className="w-3.5 h-3.5 text-connect-blue" />
                Término *
              </label>
              <input
                type="date"
                required
                min={form.inicio}
                value={form.fim}
                onChange={(e) => set("fim", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            {currentGoal && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Meta</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white font-bold flex items-center gap-2 shadow-lg shadow-connect-blue/20 hover:shadow-connect-blue/30 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:hover:scale-100"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentGoal ? (
                  <CheckCircle2 className="w-4 h-4 text-platz-gold" />
                ) : (
                  <Plus className="w-4 h-4 text-platz-gold" />
                )}
                {currentGoal ? "Salvar Alterações" : "Ativar Nova Meta"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
