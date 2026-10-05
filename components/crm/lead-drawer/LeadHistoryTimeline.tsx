"use client";

import React from "react";
import { User, RefreshCw, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";

export interface HistoryEvent {
  id: string;
  tipo: "status_change" | "created" | "note" | "contact" | "sla";
  titulo: string;
  descricao: string;
  autor: string;
  timestamp: string;
}

interface LeadHistoryTimelineProps {
  leadName: string;
  leadId?: string;
  events?: HistoryEvent[];
}

const defaultEvents = (leadName: string): HistoryEvent[] => [
  {
    id: "hist-1",
    tipo: "status_change",
    titulo: "Status do lead alterado",
    descricao: `Status do lead "${leadName}" alterado de "Primeiro Contato" para "Visita Agendada"`,
    autor: "Lucas Pinheiro",
    timestamp: "01/10/2026 às 16:40",
  },
  {
    id: "hist-2",
    tipo: "contact",
    titulo: "Contato via WhatsApp",
    descricao: "Corretor enviou apresentação do empreendimento Reserva Imperial",
    autor: "Lucas Pinheiro",
    timestamp: "01/10/2026 às 14:15",
  },
  {
    id: "hist-3",
    tipo: "status_change",
    titulo: "Atendimento iniciado",
    descricao: `Lead assumido pelo corretor Lucas Pinheiro dentro do SLA`,
    autor: "Sistema Round-Robin",
    timestamp: "01/10/2026 às 11:32",
  },
  {
    id: "hist-4",
    tipo: "created",
    titulo: "Lead criado",
    descricao: `Lead captado via campanha Meta Ads ("Lançamento Frente Mar")`,
    autor: "Integração Meta Ads",
    timestamp: "01/10/2026 às 11:28",
  },
];

export function LeadHistoryTimeline({ leadName, leadId, events }: LeadHistoryTimelineProps) {
  const [mergedEvents, setMergedEvents] = React.useState<HistoryEvent[]>(() => {
    return events && events.length > 0 ? events : defaultEvents(leadName);
  });

  React.useEffect(() => {
    if (!leadId) return;
    try {
      const stored = localStorage.getItem(`connect_platz_lead_abordagens_${leadId}`);
      if (stored) {
        const abordagens = JSON.parse(stored);
        const mapped: HistoryEvent[] = abordagens.map((ab: any) => ({
          id: ab.id,
          tipo: "contact" as const,
          titulo: `Abordagem via ${
            ab.canal === "whatsapp"
              ? "WhatsApp"
              : ab.canal === "ligacao"
              ? "Ligação Telefônica"
              : ab.canal === "reuniao"
              ? "Visita / Reunião"
              : ab.canal === "email"
              ? "E-mail"
              : "Nota Interna"
          }`,
          descricao: ab.conteudo,
          autor: ab.corretorNome,
          timestamp: ab.dataHora,
        }));
        const base = events && events.length > 0 ? events : defaultEvents(leadName);
        setMergedEvents([...mapped, ...base]);
      }
    } catch {
      // Fallback
    }
  }, [leadId, leadName, events]);

  const eventList = mergedEvents;

  const getEventIcon = (tipo: HistoryEvent["tipo"]) => {
    switch (tipo) {
      case "status_change":
        return <RefreshCw className="w-3.5 h-3.5 text-connect-blue" />;
      case "contact":
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
      case "created":
        return <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />;
      case "sla":
        return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <User className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {eventList.map((item) => (
          <div key={item.id} className="relative group">
            {/* Ícone / Marcador no trilho */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center shadow-xs">
              {getEventIcon(item.tipo)}
            </div>

            {/* Conteúdo do Histórico */}
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-xs font-semibold text-foreground tracking-tight">
                  {item.titulo}
                </h5>
                <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                  {item.timestamp}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.descricao}
              </p>

              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 pt-0.5">
                <span>Por:</span>
                <span className="font-semibold text-foreground/80">{item.autor}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
