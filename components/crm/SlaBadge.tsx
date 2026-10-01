"use client";

import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle, AlertCircle } from "lucide-react";

interface SlaBadgeProps {
  dueAt?: string | Date | null;
  slaMinutes?: number | null;
  breached?: boolean;
  className?: string;
  showIcon?: boolean;
}

export function SlaBadge({
  dueAt,
  slaMinutes,
  breached = false,
  className = "",
  showIcon = true,
}: SlaBadgeProps) {
  const [timeLabel, setTimeLabel] = useState<string>("");
  const [status, setStatus] = useState<"ok" | "warning" | "breached">("ok");

  useEffect(() => {
    if (!dueAt) {
      if (slaMinutes) {
        setTimeLabel(`${slaMinutes}m`);
        setStatus("ok");
      } else {
        setTimeLabel("Sem SLA");
        setStatus("ok");
      }
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const target = new Date(dueAt).getTime();
      const diffMs = target - now;

      if (diffMs <= 0 || breached) {
        const overdueMin = Math.abs(Math.floor(diffMs / 60000));
        setTimeLabel(overdueMin > 60 ? `+${Math.floor(overdueMin / 60)}h atraso` : `+${overdueMin}m atraso`);
        setStatus("breached");
      } else {
        const remainingMin = Math.floor(diffMs / 60000);
        if (remainingMin < 15) {
          setTimeLabel(`${remainingMin}m restantes`);
          setStatus("warning");
        } else if (remainingMin < 60) {
          setTimeLabel(`${remainingMin}m`);
          setStatus("ok");
        } else {
          const hours = Math.floor(remainingMin / 60);
          const mins = remainingMin % 60;
          setTimeLabel(`${hours}h${mins > 0 ? ` ${mins}m` : ""}`);
          setStatus("ok");
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, [dueAt, slaMinutes, breached]);

  let styleClasses = "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80";
  let icon = <Clock className="w-3 h-3 text-emerald-400" />;

  if (status === "warning") {
    styleClasses = "bg-amber-950/90 text-amber-300 border border-amber-700/80 animate-pulse";
    icon = <AlertTriangle className="w-3 h-3 text-amber-400" />;
  } else if (status === "breached") {
    styleClasses = "bg-red-950/90 text-red-300 border border-red-800 animate-pulse shadow-sm shadow-red-900/40";
    icon = <AlertCircle className="w-3 h-3 text-red-400" />;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${styleClasses} ${className}`}
    >
      {showIcon && icon}
      <span>{timeLabel}</span>
    </span>
  );
}
