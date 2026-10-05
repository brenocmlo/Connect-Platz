"use client";

import React from "react";
import { BadgeDollarSign, ArrowUpRight } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { CountUpNumber } from "@/components/crm/CountUpNumber";

interface HeroMetricCardProps {
  label?: string;
  value: number;
  subtitle?: string;
  trendText?: string;
  sparklineData?: number[];
  className?: string;
}

export function HeroMetricCard({
  label = "VGV TOTAL",
  value,
  subtitle = "Soma das vendas do período",
  trendText = "+100%",
  sparklineData = [12, 18, 14, 25, 32, 28, 42, 38, 55],
  className = "",
}: HeroMetricCardProps) {
  const { hideValues } = useCrm();

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-connect-blue text-white p-5 shadow-lg shadow-connect-blue/25 flex flex-col justify-between min-h-[160px] ${className}`}
    >
      {/* 1. TOPO: ÍCONE TRANSLÚCIDO, RÓTULO UPPERCASE E BADGE BRANCO/20 (5.3) */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0 text-white">
            <BadgeDollarSign className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-white/90">
            {label}
          </span>
        </div>

        {trendText && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-xs border border-white/25">
            <ArrowUpRight className="w-3 h-3" />
            <span>{trendText}</span>
          </span>
        )}
      </div>

      {/* 2. VALOR PRINCIPAL GRANDE COM COUNT-UP OU MÁSCARA •••• (5.3) */}
      <div className="my-2 relative z-10">
        {hideValues ? (
          <span className="text-3xl font-extrabold tracking-tight text-white/80 font-mono">
            R$ ••••••••
          </span>
        ) : (
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            <CountUpNumber value={value} prefix="R$ " decimals={0} />
          </div>
        )}
        <p className="text-xs text-white/80 mt-1 font-medium">{subtitle}</p>
      </div>

      {/* 3. SPARKLINE DE LINHA CLARA DESENHADA SOBRE O FUNDO (5.3) */}
      {sparklineData && sparklineData.length > 1 && !hideValues && (
        <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none opacity-45">
          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            {(() => {
              const min = Math.min(...sparklineData);
              const max = Math.max(...sparklineData);
              const range = max - min || 1;
              const points = sparklineData
                .map((d, i) => {
                  const x = (i / (sparklineData.length - 1)) * 100;
                  const y = 36 - ((d - min) / range) * 28;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" ");

              return (
                <polyline
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
