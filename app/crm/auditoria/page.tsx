"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { AccessDeniedCard } from "@/components/crm/AccessDeniedCard";
import { AuditLogEntry, AuditPage, fetchAuditLogsFromApi } from "@/lib/services/auditLogger";
import { AuditStatCards } from "@/components/crm/auditoria/AuditStatCards";
import { AuditFilters, AuditFilterState } from "@/components/crm/auditoria/AuditFilters";
import { AuditTable } from "@/components/crm/auditoria/AuditTable";
import { AuditDetailModal } from "@/components/crm/auditoria/AuditDetailModal";

const PAGE_SIZE = 25;
const EMPTY_FILTERS: AuditFilterState = { q: "", modulo: "ALL", tipoAcao: "ALL", userId: "ALL", from: "", to: "" };

function csvCell(value: string | null | undefined): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export default function AuditoriaPage() {
  const { user, setActionMessage } = useCrm();
  const isManager = user?.role === "ADMINISTRADOR" || user?.role === "DIRETOR" || user?.role === "GERENTE";

  const [filters, setFilters] = useState<AuditFilterState>(EMPTY_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AuditPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Debounce da busca textual
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q.trim()), 350);
    return () => clearTimeout(t);
  }, [filters.q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAuditLogsFromApi({
        page,
        pageSize: PAGE_SIZE,
        q: debouncedQ,
        modulo: filters.modulo,
        tipoAcao: filters.tipoAcao,
        userId: filters.userId,
        from: filters.from,
        to: filters.to,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar a auditoria.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQ, filters.modulo, filters.tipoAcao, filters.userId, filters.from, filters.to]);

  useEffect(() => {
    if (user && isManager) load();
  }, [user, isManager, load, reloadKey]);

  const handleFilterChange = (patch: Partial<AuditFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const handleExportCsv = () => {
    const logs = data?.logs || [];
    if (logs.length === 0) return;

    const headers = ["ID", "Data e Hora", "Responsável", "Email", "Cargo", "Módulo", "Tipo de Ação", "Ação", "Detalhes", "IP", "Dispositivo"];
    const rows = logs.map((l) =>
      [
        l.id,
        l.dataHoraFormatada,
        l.usuario.nome,
        l.usuario.email,
        l.usuario.role,
        l.modulo,
        l.tipoAcao,
        l.acao,
        l.detalhes,
        l.ipOrigem,
        l.dispositivo,
      ]
        .map(csvCell)
        .join(",")
    );

    const blob = new Blob(["﻿" + [headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `auditoria-connect-platz-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setActionMessage(`Exportação CSV concluída (${logs.length} registros desta página).`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  if (user && !isManager) {
    return <AccessDeniedCard moduleName="os logs e auditoria do sistema" allowedLabel="Administradores, Diretores e Gerentes" />;
  }

  const hasFilters =
    Boolean(debouncedQ) ||
    filters.modulo !== "ALL" ||
    filters.tipoAcao !== "ALL" ||
    filters.userId !== "ALL" ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-connect-blue/10 border border-connect-blue/20 text-connect-blue">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Log & Auditoria do Sistema</h1>
            <p className="text-xs text-muted-foreground">
              Trilha de eventos, histórico de operações e segurança de acessos.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </span>
          <button onClick={() => setReloadKey((k) => k + 1)} className="font-bold underline underline-offset-2">
            Tentar novamente
          </button>
        </div>
      )}

      {/* 2. StatCards de Resumo */}
      <AuditStatCards stats={data?.stats || null} loading={loading && !data} />

      {/* 3. Filtros */}
      <AuditFilters
        filters={filters}
        onChange={handleFilterChange}
        usuarios={data?.usuarios || []}
        onExportCsv={handleExportCsv}
        onRefresh={() => setReloadKey((k) => k + 1)}
        loading={loading}
        totalShown={data?.logs.length || 0}
        total={data?.total || 0}
      />

      {/* 4. Tabela de Registros */}
      <AuditTable
        logs={data?.logs || []}
        loading={loading}
        hasFilters={hasFilters}
        page={data?.page || page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        onViewDetails={setSelectedLog}
      />

      {/* 5. Modal de Detalhes do Log */}
      <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
