"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendBadgeProps {
  value: number | string;
  isPositive?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
  showIcon?: boolean;
}

export function TrendBadge({
  value,
  isPositive,
  prefix = "",
  suffix = "%",
  className = "",
  showIcon = true,
}: TrendBadgeProps) {
  // REGRA PERMANENTE: Sanitização estrita contra duplicação de sinais (+, -, ↗, ↘, %)
  const rawStr = String(value).trim();

  // Remove setas e sinais existentes no início da string
  const cleanedLeading = rawStr
    .replace(/^[↗↘\s]+/g, "")
    .replace(/^[+-]+/g, "")
    .trim();

  // Remove sufixo duplicado se o valor já contiver (ex: "%" já incluso na string)
  const hasSuffix = Boolean(suffix && cleanedLeading.endsWith(suffix));
  const coreValue = hasSuffix && suffix
    ? cleanedLeading.slice(0, -suffix.length).trim()
    : cleanedLeading;

  // Determina se o valor é positivo, negativo ou zero
  const numVal =
    typeof value === "number"
      ? value
      : parseFloat(rawStr.replace(/[^0-9.-]/g, ""));

  const positive =
    isPositive !== undefined
      ? isPositive
      : rawStr.startsWith("-")
      ? false
      : numVal >= 0;

  const isZero = numVal === 0 && !isNaN(numVal);

  if (isZero) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border/60 ${className}`}
      >
        {showIcon && <Minus className="w-3 h-3 shrink-0" />}
        <span>0{suffix}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
        positive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
      } ${className}`}
    >
      {showIcon ? (
        positive ? (
          <TrendingUp className="w-3 h-3 shrink-0" />
        ) : (
          <TrendingDown className="w-3 h-3 shrink-0" />
        )
      ) : (
        <span>{positive ? "↗" : "↘"}</span>
      )}
      <span>
        {positive ? "+" : "-"}
        {prefix}
        {coreValue}
        {suffix}
      </span>
    </span>
  );
}
