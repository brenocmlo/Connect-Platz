"use client";

import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle, AlertCircle, PhoneOff } from "lucide-react";

interface SlaBadgeProps {
  dueAt?: string | Date | null;
  slaMinutes?: number | null;
  breached?: boolean;
  /** Data de captação do lead — usada para o alerta de "sem primeiro contato". */
  createdAt?: string | Date | null;
  /** Quando ausente (null) e o lead tem mais de 15 min, o badge pulsa pedindo o primeiro contato. */
  firstContactAt?: string | Date | null;
  className?: string;
  showIcon?: boolean;
}

type SlaStatus = "ok" | "warning" | "noContact" | "breached";

const NO_CONTACT_ALERT_MIN = 15;

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h${min % 60 ? ` ${min % 60}m` : ""}`;
  return `${Math.floor(h / 24)}d`;
}

function computeSla(props: SlaBadgeProps, now: number): { status: SlaStatus; label: string } {
  const { dueAt, slaMinutes, breached, createdAt, firstContactAt } = props;
  const due = dueAt ? new Date(dueAt).getTime() : null;

  // 1. SLA vencido
  if (breached || (due !== null && due <= now)) {
    const overdue = due !== null ? Math.max(0, Math.floor((now - due) / 60000)) : 0;
    return { status: "breached", label: due !== null ? `+${formatMinutes(overdue)} atraso` : "SLA vencido" };
  }

  // 2. Sem primeiro contato há mais de 15 minutos
  if (firstContactAt === null && createdAt) {
    const waiting = Math.floor((now - new Date(createdAt).getTime()) / 60000);
    if (waiting > NO_CONTACT_ALERT_MIN) return { status: "noContact", label: `Sem contato · ${formatMinutes(waiting)}` };
  }

  // 3. Prazo do SLA em andamento
  if (due !== null) {
    const remaining = Math.floor((due - now) / 60000);
    if (remaining < 15) return { status: "warning", label: `${remaining}m restantes` };
    return { status: "ok", label: formatMinutes(remaining) };
  }

  return { status: "ok", label: slaMinutes ? `${slaMinutes}m` : "Sem SLA" };
}

const STYLES: Record<SlaStatus, { classes: string; Icon: React.ElementType }> = {
  ok: {
    classes:
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30",
    Icon: Clock,
  },
  warning: {
    classes:
      "bg-amber-500/10 text-amber-700 border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/40 animate-pulse",
    Icon: AlertTriangle,
  },
  noContact: {
    classes:
      "bg-orange-500/10 text-orange-700 border-orange-500/40 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-400/40 animate-pulse",
    Icon: PhoneOff,
  },
  breached: {
    classes:
      "bg-red-500/10 text-red-700 border-red-500/40 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 animate-pulse shadow-sm shadow-red-500/20",
    Icon: AlertCircle,
  },
};

export function SlaBadge(props: SlaBadgeProps) {
  const { className = "", showIcon = true } = props;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000); // atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const { status, label } = computeSla(props, now);
  const { classes, Icon } = STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide ${classes} ${className}`}
      title={status === "noContact" ? "Lead sem primeiro contato registrado" : "Prazo de SLA"}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{label}</span>
    </span>
  );
}
