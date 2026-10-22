"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Layers, Inbox, KeyRound } from "lucide-react";
import { IntegrationItem, IntegrationStatus } from "./types";
import { ChannelStatus, CHANNELS } from "./channels";
import { IntegrationInstructionsTab } from "./IntegrationInstructionsTab";

interface IntegrationCardProps {
  item: IntegrationItem;
  status: ChannelStatus | null;
  loading?: boolean;
  canRevealKeys: boolean;
  /** undefined = chaves ainda não carregadas; null = não configurada. */
  channelKey?: string | null;
  keysError?: string | null;
  onRevealKeys: () => void;
}

const STATUS_BADGE: Record<IntegrationStatus, string> = {
  Conectado: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  "Aguardando leads": "bg-connect-blue/10 text-connect-blue border-connect-blue/30",
  "Chave pendente": "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
};

function deriveStatus(s: ChannelStatus | null): IntegrationStatus | null {
  if (!s) return null;
  if (s.leadsRecebidos > 0) return "Conectado";
  return s.keyConfigured ? "Aguardando leads" : "Chave pendente";
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function IntegrationCard({ item, status, loading, canRevealKeys, channelKey, keysError, onRevealKeys }: IntegrationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subTab, setSubTab] = useState<"leads" | "instrucoes">("instrucoes");
  const def = CHANNELS.find((c) => c.id === item.id)!;
  const label = deriveStatus(status);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const webhookUrl = `${origin}${def.webhookPath}`;

  return (
    <div
      className={`bg-card border rounded-2xl transition-all shadow-sm ${
        isExpanded ? "border-connect-blue/50 shadow-md ring-1 ring-connect-blue/10" : "border-border hover:border-connect-blue/40"
      }`}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-5 flex items-start justify-between gap-4 select-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-connect-blue/10 border border-connect-blue/20 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-connect-blue" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">{item.nome}</h3>
              {label ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[label]}`}>{label}</span>
              ) : loading ? (
                <span className="h-4 w-20 rounded-full bg-muted animate-pulse" />
              ) : null}
              {item.selo && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  {item.selo}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{item.descricao}</p>
          </div>
        </div>
        <span className="p-1 rounded-lg text-muted-foreground">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-border p-5 space-y-4 text-xs animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-muted/40 border border-border text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground block">Leads recebidos</span>
              <span className="font-bold text-connect-blue">{status?.leadsRecebidos ?? "—"}</span>
            </div>
            <div>
              <span className="font-semibold text-foreground block">Último lead</span>
              <span>{formatDateTime(status?.ultimoLeadEm ?? null)}</span>
            </div>
            <div>
              <span className="font-semibold text-foreground block">Chave no servidor</span>
              <span className="flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                {status ? (status.keyConfigured ? "Configurada" : `Defina ${def.keyEnv}`) : "—"}
              </span>
            </div>
          </div>

          <div className="flex border-b border-border gap-4">
            {[
              { id: "instrucoes" as const, label: "Instruções" },
              { id: "leads" as const, label: "Últimos leads" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`pb-2 text-xs font-semibold border-b-2 transition-all ${
                  subTab === tab.id ? "border-connect-blue text-connect-blue font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {subTab === "leads" &&
            (status && status.recentes.length > 0 ? (
              <div className="space-y-2">
                {status.recentes.map((l) => (
                  <div key={l.id} className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-foreground block truncate">{l.nome}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDateTime(l.createdAt)} · {l.corretor || "Sem corretor (fila/bolsão)"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-border text-center text-muted-foreground flex flex-col items-center gap-2">
                <Inbox className="w-5 h-5" />
                Nenhum lead recebido por este canal ainda.
              </div>
            ))}

          {subTab === "instrucoes" && (
            <IntegrationInstructionsTab
              channel={def}
              webhookUrl={webhookUrl}
              channelKey={channelKey}
              canRevealKeys={canRevealKeys}
              keysError={keysError}
              signatureConfigured={status?.signatureConfigured}
              onRevealKeys={onRevealKeys}
            />
          )}
        </div>
      )}
    </div>
  );
}
