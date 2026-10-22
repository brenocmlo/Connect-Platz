"use client";

import React from "react";
import { BadgeDollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { CountUpNumber } from "@/components/crm/CountUpNumber";

interface VgvHeroCardProps {
  value: number;
  subtitle: string;
  /** Variação % vs. período anterior (null = sem base de comparação) */
  trend: number | null;
  sparklineData: number[];
  className?: string;
}

/** Hero VGV Total (5.3 item 1): card sólido connect-blue com sparkline clara sobre o fundo. */
export function VgvHeroCard({ value, subtitle, trend, sparklineData, className = "" }: VgvHeroCardProps) {
  const { hideValues } = useCrm();
  const hasSparkline = sparklineData.length > 1 && sparklineData.some((v) => v > 0);

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-connect-blue text-white p-5 shadow-lg shadow-connect-blue/25 flex flex-col justify-between min-h-[160px] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <BadgeDollarSign className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-white/90">VGV Total</span>
        </div>

        {trend !== null && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/25">
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>
              {trend >= 0 ? "+" : "-"}
              {Math.abs(trend).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
            </span>
          </span>
        )}
      </div>

      <div className="my-2 relative z-10">
        {hideValues ? (
          <span className="text-3xl font-extrabold tracking-tight text-white/80 font-mono">R$ ••••••••</span>
        ) : (
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            <CountUpNumber value={value} prefix="R$ " decimals={0} />
          </div>
        )}
        <p className="text-xs text-white/80 mt-1 font-medium">{subtitle}</p>
      </div>

      {hasSparkline && !hideValues && (
        <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none opacity-45" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500"
              points={(() => {
                const min = Math.min(...sparklineData);
                const range = Math.max(...sparklineData) - min || 1;
                return sparklineData
                  .map((d, i) => {
                    const x = (i / (sparklineData.length - 1)) * 100;
                    const y = 36 - ((d - min) / range) * 28;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(" ");
              })()}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
