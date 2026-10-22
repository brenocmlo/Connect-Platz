"use client";

import React from "react";
import {
  User,
  RefreshCw,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  FileText,
  Tag,
  Pencil,
  ArrowLeftRight,
  StickyNote,
  History,
} from "lucide-react";
import { useLeadTimeline, formatTimelineDate } from "./useLeadTimeline";
import type { TimelineEntry } from "@/components/crm/leads/leadsApi";

interface LeadHistoryTimelineProps {
  leadName: string;
  leadId: string;
}

const CANAL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  ligacao: "Ligação Telefônica",
  reuniao: "Visita / Reunião",
  email: "E-mail",
  anotacao: "Nota Interna",
};

/** Título e ícone de cada tipo de registro gravado em LeadTimeline. */
function describe(entry: TimelineEntry): { titulo: string; icon: React.ReactNode } {
  const canal = entry.metadata?.canal ? CANAL_LABEL[entry.metadata.canal] || entry.metadata.canal : null;
  switch (entry.tipo) {
    case "created":
      return { titulo: "Lead criado", icon: <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" /> };
    case "status_change":
      return { titulo: "Etapa do lead alterada", icon: <RefreshCw className="w-3.5 h-3.5 text-connect-blue" /> };
    case "abordagem":
      return {
        titulo: canal ? `Abordagem via ${canal}` : "Abordagem registrada",
        icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />,
      };
    case "contato":
      return { titulo: "Primeiro contato", icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> };
    case "transbordo":
      return { titulo: "Responsável / Bolsão", icon: <ArrowLeftRight className="w-3.5 h-3.5 text-amber-500" /> };
    case "etiquetas":
      return { titulo: "Etiquetas atualizadas", icon: <Tag className="w-3.5 h-3.5 text-connect-blue" /> };
    case "edicao":
      return { titulo: "Lead editado", icon: <Pencil className="w-3.5 h-3.5 text-muted-foreground" /> };
    case "documento":
      return { titulo: "Documentos", icon: <FileText className="w-3.5 h-3.5 text-sky-500" /> };
    case "descarte":
      return { titulo: "Lead descartado", icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> };
    case "sla":
      return { titulo: "Alerta de SLA", icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> };
    case "nota":
      return { titulo: "Observação", icon: <StickyNote className="w-3.5 h-3.5 text-muted-foreground" /> };
    default:
      return { titulo: "Atualização", icon: <User className="w-3.5 h-3.5 text-muted-foreground" /> };
  }
}

export function LeadHistoryTimeline({ leadName, leadId }: LeadHistoryTimelineProps) {
  const { entries, isLoading, error } = useLeadTimeline(leadId);

  if (isLoading) {
    return (
      <div className="space-y-4 pl-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center text-xs text-rose-600 dark:text-rose-400">
        {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
        <History className="w-8 h-8 opacity-60" />
        <p className="text-xs">Nenhum registro no histórico de &quot;{leadName}&quot; ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {entries.map((item) => {
          const { titulo, icon } = describe(item);
          return (
            <div key={item.id} className="relative group animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
              {/* Ícone / Marcador no trilho */}
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center shadow-xs">
                {icon}
              </div>

              {/* Conteúdo do Histórico */}
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-xs font-semibold text-foreground tracking-tight">{titulo}</h5>
                  <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                    {formatTimelineDate(item.createdAt)}
                  </span>
                </div>

                {item.conteudo && (
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.conteudo}</p>
                )}

                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 pt-0.5">
                  <span>Por:</span>
                  <span className="font-semibold text-foreground/80">{item.user?.nome || "Sistema"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
