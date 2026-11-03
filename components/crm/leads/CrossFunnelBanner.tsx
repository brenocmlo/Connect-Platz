"use client";

import React, { useState } from "react";
import { GitFork, ArrowRight, ArrowRightLeft, Check, Loader2 } from "lucide-react";
import { OtherFunnelMatch } from "./leadsApi";

interface CrossFunnelBannerProps {
  matches: OtherFunnelMatch[];
  currentFunnelId: string | null;
  onGoToFunnel: (funnelId: string, leadId?: string) => void;
  onMigrateLead: (leadId: string, targetFunnelId: string) => Promise<void>;
}

export function CrossFunnelBanner({
  matches,
  currentFunnelId,
  onGoToFunnel,
  onMigrateLead,
}: CrossFunnelBannerProps) {
  const [migratingId, setMigratingId] = useState<string | null>(null);

  if (!matches || matches.length === 0) return null;

  const handleMigrate = async (leadId: string) => {
    if (!currentFunnelId) return;
    setMigratingId(leadId);
    try {
      await onMigrateLead(leadId, currentFunnelId);
    } finally {
      setMigratingId(null);
    }
  };

  return (
    <div className="bg-connect-blue/5 border border-connect-blue/25 rounded-xl p-3.5 space-y-2.5 transition-all animate-fadeInUp">
      <div className="flex items-center gap-2 text-xs font-semibold text-connect-blue">
        <GitFork className="w-4 h-4 text-connect-blue shrink-0" />
        <span>
          {matches.length === 1
            ? "1 lead encontrado em outro funil:"
            : `${matches.length} leads encontrados em outros funis:`}
        </span>
      </div>

      <div className="space-y-2">
        {matches.map((match) => {
          const isMigrating = migratingId === match.id;
          return (
            <div
              key={match.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-card/80 border border-border/60 rounded-lg p-2.5 text-xs shadow-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{match.nome}</span>
                  {match.telefone && (
                    <span className="text-[11px] text-muted-foreground">({match.telefone})</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span>Presente no</span>
                  <span className="font-semibold text-connect-blue">{match.funilNome}</span>
                  <span>•</span>
                  <span>Etapa: {match.stageNome}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onGoToFunnel(match.funilId, match.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white font-medium text-[11px] shadow-xs transition-all hover:scale-[1.02]"
                >
                  <span>Ir para funil</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                {currentFunnelId && currentFunnelId !== match.funilId && (
                  <button
                    type="button"
                    disabled={isMigrating}
                    onClick={() => handleMigrate(match.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium text-[11px] border border-border transition-all disabled:opacity-50"
                  >
                    {isMigrating ? (
                      <Loader2 className="w-3 h-3 animate-spin text-connect-blue" />
                    ) : (
                      <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span>Trazer para cá</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
