"use client";

import React from "react";
import { X, ShieldCheck, User, Globe, Laptop, Calendar, Tag, FileText } from "lucide-react";
import { AuditLogEntry } from "@/lib/services/auditLogger";

interface AuditDetailModalProps {
  log: AuditLogEntry | null;
  onClose: () => void;
}

export function AuditDetailModal({ log, onClose }: AuditDetailModalProps) {
  if (!log) return null;

  const getActionBadgeColor = (type: string) => {
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
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-connect-blue/10 text-connect-blue border border-connect-blue/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Trilha do Registro de Auditoria
              </h3>
              <p className="text-[11px] font-mono text-muted-foreground">ID: {log.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações Principais */}
        <div className="space-y-3.5 text-xs">
          {/* Badges de Categoria */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getActionBadgeColor(
                log.tipoAcao
              )}`}
            >
              {log.tipoAcao}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-muted text-foreground border border-border text-[11px] font-bold">
              Módulo: {log.modulo}
            </span>
            <span className="text-muted-foreground flex items-center gap-1 ml-auto text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-connect-blue" />
              {log.dataHoraFormatada}
            </span>
          </div>

          {/* Usuário Responsável */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-connect-blue" />
              Usuário Responsável
            </span>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1266C7] to-[#0D478F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {log.usuario.avatar || log.usuario.nome.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">
                  {log.usuario.nome}
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  {log.usuario.email} •{" "}
                  <strong className="text-connect-blue">{log.usuario.role}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Descrição do Evento */}
          <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-platz-gold" />
              Ação Executada
            </span>
            <h4 className="text-sm font-bold text-foreground">{log.acao}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              {log.detalhes}
            </p>
          </div>

          {/* Metadados Técnicos: IP & Dispositivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-connect-blue shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Endereço IP
                </span>
                <span className="font-mono text-foreground font-semibold">
                  {log.ipOrigem || "177.18.240.12"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center gap-2.5">
              <Laptop className="w-4 h-4 text-platz-gold shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Dispositivo / Navegador
                </span>
                <span className="text-foreground font-medium truncate block">
                  {log.dispositivo || "Web Browser"}
                </span>
              </div>
            </div>
          </div>

          {/* Entidade afetada se houver */}
          {log.entidadeAfetada && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Entidade Vinculada:</span>
              <span className="font-bold text-foreground">
                {log.entidadeAfetada.tipo}: {log.entidadeAfetada.nome || log.entidadeAfetada.id}
              </span>
            </div>
          )}

          {/* Payload Raw */}
          <div className="p-3 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-platz-gold" />
                Raw Timestamp ISO
              </span>
              <span>{log.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-border">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white font-bold text-xs shadow-sm transition-all"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
}
