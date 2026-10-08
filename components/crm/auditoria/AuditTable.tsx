"use client";

import React, { useState } from "react";
import { Eye, Clock, ShieldCheck, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { AuditLogEntry } from "@/lib/services/auditLogger";

interface AuditTableProps {
  logs: AuditLogEntry[];
  onViewDetails: (log: AuditLogEntry) => void;
}

export function AuditTable({ logs, onViewDetails }: AuditTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(logs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = logs.slice(startIndex, startIndex + itemsPerPage);

  const getActionBadge = (type: string) => {
    switch (type) {
      case "CREATE":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "UPDATE":
        return "bg-connect-blue/10 text-connect-blue border-connect-blue/30";
      case "DELETE":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "LOGIN":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "PASSWORD_CHANGE":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "INVITE":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
    }
  };

  if (logs.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          Nenhum Registro de Auditoria Encontrado
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Tente alterar os termos de busca ou remover os filtros aplicados para visualizar os eventos do sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <th className="py-3 px-4">Data / Hora</th>
              <th className="py-3 px-4">Colaborador</th>
              <th className="py-3 px-4">Módulo</th>
              <th className="py-3 px-4">Tipo & Ação</th>
              <th className="py-3 px-4">Detalhes do Evento</th>
              <th className="py-3 px-4 text-center">Origem (IP)</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentLogs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-connect-blue/5 dark:hover:bg-connect-blue/10 transition-colors group cursor-pointer"
                onClick={() => onViewDetails(log)}
              >
                {/* Data e Hora */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <Clock className="w-3.5 h-3.5 text-connect-blue" />
                    <span>{log.dataHoraFormatada}</span>
                  </div>
                </td>

                {/* Usuário */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-connect-blue/15 text-connect-blue flex items-center justify-center font-bold text-[11px] shrink-0">
                      {log.usuario.avatar || log.usuario.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-foreground block leading-tight">
                        {log.usuario.nome}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {log.usuario.role}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Módulo */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-md bg-muted text-foreground text-[10px] font-semibold border border-border">
                    {log.modulo}
                  </span>
                </td>

                {/* Tipo e Ação */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getActionBadge(
                        log.tipoAcao
                      )}`}
                    >
                      {log.tipoAcao}
                    </span>
                    <span className="font-semibold text-foreground">{log.acao}</span>
                  </div>
                </td>

                {/* Detalhes */}
                <td className="py-3 px-4 max-w-xs">
                  <span className="text-muted-foreground line-clamp-1 block text-xs">
                    {log.detalhes}
                  </span>
                </td>

                {/* IP */}
                <td className="py-3 px-4 whitespace-nowrap text-center">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {log.ipOrigem || "—"}
                  </span>
                </td>

                {/* Ações */}
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

      {/* Paginação */}
      <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
        <span>
          Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
