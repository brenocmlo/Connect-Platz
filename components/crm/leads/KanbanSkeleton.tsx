"use client";

// components/crm/leads/KanbanSkeleton.tsx
// Skeleton visual fluído para o Kanban de Leads (Padrão Habitus CRM)

import React from "react";

export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 select-none">
      {[1, 2, 3, 4].map((colIndex) => (
        <div
          key={colIndex}
          className="flex-shrink-0 w-[300px] md:w-[320px] bg-card/60 border border-border/60 rounded-2xl p-3 flex flex-col gap-3 min-h-[500px]"
        >
          {/* Cabeçalho da coluna */}
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-connect-blue/40 animate-pulse" />
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-4 w-6 bg-muted/80 rounded-full animate-pulse" />
          </div>

          {/* Cards fictícios com shimmer */}
          {[1, 2, 3].map((cardIndex) => (
            <div
              key={cardIndex}
              className="bg-card border border-border/70 rounded-xl p-3 space-y-2.5 shadow-xs"
            >
              {/* Linha superior: Avatar + Nome + Menu */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-connect-blue/20 animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-3.5 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-2.5 w-16 bg-muted/60 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-4 h-4 bg-muted/50 rounded animate-pulse" />
              </div>

              {/* Linhas de meta */}
              <div className="space-y-1.5 pt-1">
                <div className="h-3 w-40 bg-muted/70 rounded animate-pulse" />
                <div className="h-3 w-48 bg-muted/60 rounded animate-pulse" />
              </div>

              {/* Tags e score */}
              <div className="flex items-center gap-1.5 pt-1">
                <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
                <div className="h-5 w-12 bg-muted/80 rounded-full animate-pulse ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
