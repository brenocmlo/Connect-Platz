"use client";

import React from "react";

export type StatusColor =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "slate"
  | "indigo"
  | "teal"
  | "gold";

interface StatusPillProps {
  children: React.ReactNode;
  color?: StatusColor;
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function StatusPill({
  children,
  color = "blue",
  dot = true,
  size = "md",
  className = "",
}: StatusPillProps) {
  const colorMap: Record<StatusColor, { pill: string; dot: string }> = {
    blue: {
      pill: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      dot: "bg-blue-500",
    },
    green: {
      pill: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      dot: "bg-emerald-500",
    },
    amber: {
      pill: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      dot: "bg-amber-500",
    },
    red: {
      pill: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      dot: "bg-rose-500",
    },
    slate: {
      pill: "bg-muted text-muted-foreground border-border/70",
      dot: "bg-muted-foreground",
    },
    indigo: {
      pill: "bg-sky-500/10 text-sky-500 border-sky-500/20",
      dot: "bg-sky-500",
    },
    teal: {
      pill: "bg-teal-500/10 text-teal-500 border-teal-500/20",
      dot: "bg-teal-500",
    },
    gold: {
      pill: "bg-platz-gold/15 text-platz-gold border-platz-gold/30",
      dot: "bg-platz-gold",
    },
  };

  const currentTheme = colorMap[color] || colorMap.blue;
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${sizeClasses} ${currentTheme.pill} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.dot}`} />}
      <span className="truncate">{children}</span>
    </span>
  );
}
