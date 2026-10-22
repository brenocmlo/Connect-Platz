"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface AuditDataDiffProps {
  antes?: Record<string, unknown> | null;
  depois?: Record<string, unknown> | null;
}

function display(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** Comparativo campo a campo entre dadosAntes e dadosDepois de um registro de auditoria. */
export function AuditDataDiff({ antes, depois }: AuditDataDiffProps) {
  if (!antes && !depois) return null;

  const keys = Array.from(new Set([...Object.keys(antes || {}), ...Object.keys(depois || {})]));
  const rows = keys
    .map((k) => ({ key: k, before: display(antes?.[k]), after: display(depois?.[k]) }))
    .filter((r) => !antes || !depois || r.before !== r.after);

  if (rows.length === 0) return null;

  return (
    <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2">
      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
        {antes && depois ? "Campos alterados" : depois ? "Dados registrados" : "Dados anteriores"}
      </span>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.key} className="text-[11px] grid grid-cols-[110px_1fr] gap-2 items-start">
            <span className="font-semibold text-foreground truncate" title={r.key}>
              {r.key}
            </span>
            <span className="flex flex-wrap items-center gap-1.5 font-mono text-muted-foreground break-all">
              {antes && <span className="line-through decoration-rose-500/60">{r.before}</span>}
              {antes && depois && <ArrowRight className="w-3 h-3 text-connect-blue shrink-0" />}
              {depois && <span className="text-foreground">{r.after}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
