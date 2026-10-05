"use client";

import React from "react";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { TrendBadge } from "./TrendBadge";
import { useCrm } from "@/components/crm/CrmContext";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trendValue?: number | string;
  isPositiveTrend?: boolean;
  trendSuffix?: string;
  icon: React.ElementType;
  iconColor?: string; // ex.: "text-primary bg-primary/10"
  legend?: string;
  isCurrency?: boolean;
  sparklineData?: number[];
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  trendValue,
  isPositiveTrend,
  trendSuffix = "%",
  icon: Icon,
  iconColor = "text-connect-blue bg-connect-blue/10",
  legend,
  isCurrency = false,
  sparklineData,
  className = "",
  onClick,
}: StatCardProps) {
  const { hideValues } = useCrm();

  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-all group ${
        isClickable ? "cursor-pointer hover:shadow-md hover:scale-[1.01]" : ""
      } ${className}`}
    >
      {/* Linha superior: Ícone em círculo 32px e TrendBadge à direita (5.3) */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${iconColor}`}
        >
          <Icon className="w-4 h-4" />
        </div>

        {trendValue !== undefined && (
          <TrendBadge
            value={trendValue}
            isPositive={isPositiveTrend}
            suffix={trendSuffix}
          />
        )}
      </div>

      {/* Rótulo Uppercase (5.3) */}
      <div className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground truncate mb-1">
        {label}
      </div>

      {/* Valor principal com Count-Up ou Mascaramento •••• */}
      <div className="text-xl font-extrabold text-foreground tracking-tight">
        {hideValues ? (
          <span className="text-muted-foreground font-mono">••••••</span>
        ) : (
          <CountUpNumber
            value={value}
            prefix={isCurrency ? "R$ " : prefix}
            suffix={suffix}
            decimals={decimals}
          />
        )}
      </div>

      {/* Legenda / Subtítulo cinza */}
      {legend && (
        <p className="text-[11px] text-muted-foreground mt-1 truncate">
          {legend}
        </p>
      )}

      {/* Mini-Sparkline opcional em linha clara (5.3) */}
      {sparklineData && sparklineData.length > 1 && !hideValues && (
        <div className="mt-3 pt-2 border-t border-border/40">
          <svg className="w-full h-7 overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
            {(() => {
              const min = Math.min(...sparklineData);
              const max = Math.max(...sparklineData);
              const range = max - min || 1;
              const points = sparklineData
                .map((d, i) => {
                  const x = (i / (sparklineData.length - 1)) * 100;
                  const y = 22 - ((d - min) / range) * 18;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" ");

              return (
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-connect-blue/70"
                  points={points}
                />
              );
            })()}
          </svg>
        </div>
      )}
    </div>
  );
}
