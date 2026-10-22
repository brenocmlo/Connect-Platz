"use client";

import React from "react";
import { Eye, Clock, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { AuditLogEntry } from "@/lib/services/auditLogger";
import { getAuditActionBadge, getInitials } from "./auditBadges";

interface AuditTableProps {
  logs: AuditLogEntry[];
  loading?: boolean;
  hasFilters?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetails: (log: AuditLogEntry) => void;
}

function SkeletonRows() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-9 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export function AuditTable({
  logs,
  loading,
  hasFilters,
  page,
  totalPages,
  onPageChange,
  onViewDetails,
}: AuditTableProps) {
  if (loading && logs.length === 0) return <SkeletonRows />;

  if (logs.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center space-y-3 animate-fade-in-up">
        <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Nenhum registro de auditoria encontrado</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {hasFilters
            ? "Nenhum evento corresponde aos filtros aplicados. Ajuste a busca, o período ou o módulo."
            : "Os eventos aparecerão aqui assim que logins, alterações de leads, vendas, configurações e entradas de integrações forem registrados."}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col transition-opacity ${
        loading ? "opacity-60" : ""
      }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <th className="py-3 px-4">Data / Hora</th>
              <th className="py-3 px-4">Responsável</th>
              <th className="py-3 px-4">Módulo</th>
              <th className="py-3 px-4">Tipo & Ação</th>
              <th className="py-3 px-4">Detalhes do Evento</th>
              <th className="py-3 px-4 text-center">Origem (IP)</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-connect-blue/5 dark:hover:bg-connect-blue/10 transition-colors cursor-pointer"
                onClick={() => onViewDetails(log)}
              >
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <Clock className="w-3.5 h-3.5 text-connect-blue" />
                    <span>{log.dataHoraFormatada}</span>
                  </div>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-connect-blue/15 text-connect-blue flex items-center justify-center font-bold text-[11px] shrink-0">
                      {getInitials(log.usuario.nome)}
                    </div>
                    <div>
                      <span className="font-bold text-foreground block leading-tight">{log.usuario.nome}</span>
                      <span className="text-[10px] text-muted-foreground">{log.usuario.role}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-md bg-muted text-foreground text-[10px] font-semibold border border-border">
                    {log.modulo}
                  </span>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getAuditActionBadge(
                        log.tipoAcao
                      )}`}
                    >
                      {log.tipoAcao}
                    </span>
                    <span className="font-semibold text-foreground">{log.acao}</span>
                  </div>
                </td>

                <td className="py-3 px-4 max-w-xs">
                  <span className="text-muted-foreground line-clamp-1 block text-xs">{log.detalhes}</span>
                </td>

                <td className="py-3 px-4 whitespace-nowrap text-center">
                  <span className="font-mono text-[11px] text-muted-foreground">{log.ipOrigem || "—"}</span>
                </td>

                <td className="py-3 px-4 whitespace-nowrap text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(log);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-connect-blue hover:bg-connect-blue/10 transition-colors"
                    title="Visualizar detalhes do log"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
        <span>
          Página <strong>{page}</strong> de <strong>{totalPages}</strong>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || loading}
            className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Próxima página"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
