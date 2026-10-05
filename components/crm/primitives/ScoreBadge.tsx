"use client";

import React from "react";

interface ScoreBadgeProps {
  score: number;
  showPoints?: boolean;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function ScoreBadge({
  score,
  showPoints = true,
  showLabel = false,
  className = "",
  size = "md",
}: ScoreBadgeProps) {
  // 2.6 Classificação padronizada Habitus CRM
  let emoji = "🧊";
  let label = "Lead Frio";
  let colorClasses = "bg-blue-500/10 text-blue-500 border-blue-500/25";

  if (score >= 70) {
    emoji = "🔥";
    label = "Lead Quente";
    colorClasses = "bg-red-500/10 text-red-500 border-red-500/30 font-bold shadow-sm shadow-red-500/10";
  } else if (score >= 40) {
    emoji = "☕";
    label = "Lead Morno";
    colorClasses = "bg-amber-500/10 text-amber-500 border-amber-500/25";
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${sizeClasses} ${colorClasses} ${className}`}
      title={`Score: ${score}/100 • ${label}`}
    >
      <span className="text-xs leading-none">{emoji}</span>
      {showPoints && <span className="tabular-nums font-semibold">{score}/100</span>}
      {showLabel && <span className="font-medium text-[11px]">{label}</span>}
    </span>
  );
}
