"use client";

import React from "react";

/** Skeleton da Dashboard durante o primeiro carregamento (5.11 — Carregamento). */
export function DashboardSkeleton() {
  const block = "rounded-xl bg-muted animate-pulse motion-reduce:animate-none";
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando métricas">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${block} h-40`} />
        <div className={`${block} h-40`} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`${block} h-28`} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${block} h-80`} />
        <div className={`${block} h-80`} />
      </div>
    </div>
  );
}
