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
  // Inferir sinal se for número e isPositive não for passado explicitamente
  const numVal = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  const positive = isPositive !== undefined ? isPositive : numVal > 0;
  const isZero = numVal === 0;

  if (isZero) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border/60 ${className}`}
      >
        {showIcon && <Minus className="w-3 h-3" />}
        <span>0{suffix}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
        positive
          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
      } ${className}`}
    >
      {showIcon && (
        positive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )
      )}
      <span>
        {positive ? "↗ +" : "↘ "}
        {prefix}
        {typeof value === "number" ? Math.abs(value) : value}
        {suffix}
      </span>
    </span>
  );
}
