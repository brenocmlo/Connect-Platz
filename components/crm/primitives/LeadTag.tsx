"use client";

import React from "react";

export type TagVariant =
  | "responsible"
  | "hot"
  | "followup"
  | "potential"
  | "urgent"
  | "rescheduled"
  | "origin"
  | "custom";

interface LeadTagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  customColor?: string; // Para etiquetas dinâmicas criadas pelo usuário
  className?: string;
  onClick?: () => void;
  onRemove?: () => void;
}

export function LeadTag({
  children,
  variant = "responsible",
  customColor,
  className = "",
  onClick,
  onRemove,
}: LeadTagProps) {
  // 5.4 Cores sólidas oficiais com texto branco 11px em rounded-md
  let colorClasses = "bg-connect-blue text-white";

  switch (variant) {
    case "responsible":
      colorClasses = "bg-connect-blue text-white";
      break;
    case "hot":
      colorClasses = "bg-amber-600 text-white";
      break;
    case "followup":
      colorClasses = "bg-pink-600 text-white";
      break;
    case "potential":
      colorClasses = "bg-sky-600 text-white";
      break;
    case "urgent":
      colorClasses = "bg-red-600 text-white";
      break;
    case "rescheduled":
      colorClasses = "bg-teal-700 text-white";
      break;
    case "origin":
      colorClasses = "bg-muted text-muted-foreground border border-border/80 font-normal";
      break;
    case "custom":
      colorClasses = customColor || "bg-slate-700 text-white";
      break;
  }

  const isInteractive = Boolean(onClick);

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-tight shadow-xs transition-all ${
        isInteractive ? "cursor-pointer hover:opacity-90 active:scale-95" : ""
      } ${colorClasses} ${className}`}
    >
      <span className="truncate max-w-[140px]">{children}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:text-red-200 transition-colors"
          aria-label="Remover etiqueta"
        >
          ×
        </button>
      )}
    </span>
  );
}
