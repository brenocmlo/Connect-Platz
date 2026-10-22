"use client";

import React from "react";
import { DEFAULT_SCORE_RULES } from "@/lib/domain/scoring/leadScore";

interface ScoreBadgeProps {
  /** Score determinístico 0–100 vindo da API; null/undefined = ainda não calculado. */
  score: number | null | undefined;
  showPoints?: boolean;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md";
  /** Limiares calibrados da organização (padrão: quente ≥ 75, morno ≥ 40). */
  hotThreshold?: number;
  warmThreshold?: number;
}

/** Classificação padronizada (seção 2.6): 🧊 Frio · ☕ Morno · 🔥 Quente, com cores translúcidas light/dark. */
export function scoreClassification(
  score: number,
  hot = DEFAULT_SCORE_RULES.hotThreshold,
  warm = DEFAULT_SCORE_RULES.warmThreshold
) {
  if (score >= hot) {
    return {
      emoji: "🔥",
      label: "Lead Quente",
      colorClasses:
        "bg-orange-500/10 text-red-600 border-orange-500/40 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-400/40 font-bold shadow-sm shadow-orange-500/10",
    };
  }
  if (score >= warm) {
    return {
      emoji: "☕",
      label: "Lead Morno",
      colorClasses:
        "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30",
    };
  }
  return {
    emoji: "🧊",
    label: "Lead Frio",
    colorClasses:
      "bg-sky-500/10 text-sky-700 border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30",
  };
}

export function ScoreBadge({
  score,
  showPoints = true,
  showLabel = false,
  className = "",
  size = "md",
  hotThreshold,
  warmThreshold,
}: ScoreBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  if (score === null || score === undefined || Number.isNaN(score)) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border bg-muted text-muted-foreground border-border ${sizeClasses} ${className}`}
        title="Score ainda não calculado"
      >
        <span className="font-medium">Sem score</span>
      </span>
    );
  }

  const value = Math.max(0, Math.min(100, Math.round(score)));
  const { emoji, label, colorClasses } = scoreClassification(value, hotThreshold, warmThreshold);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${sizeClasses} ${colorClasses} ${className}`}
      title={`Score: ${value}/100 • ${label}`}
    >
      <span className="text-xs leading-none">{emoji}</span>
      {showPoints && <span className="tabular-nums font-semibold">{value}/100</span>}
      {showLabel && <span className="font-medium text-[11px]">{label}</span>}
    </span>
  );
}
