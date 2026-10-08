"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ShieldCheck, Activity, Calendar } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { AccessDeniedCard } from "@/components/crm/AccessDeniedCard";
import {
  AuditLogEntry,
  getAuditLogs,
  resetAuditLogsToMock,
} from "@/lib/services/auditLogger";
import { AuditStatCards } from "@/components/crm/auditoria/AuditStatCards";
import { AuditFilters } from "@/components/crm/auditoria/AuditFilters";
import { AuditTable } from "@/components/crm/auditoria/AuditTable";
import { AuditDetailModal } from "@/components/crm/auditoria/AuditDetailModal";

export default function AuditoriaPage() {
  const { user, setActionMessage } = useCrm();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("ALL");
  const [selectedActionType, setSelectedActionType] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Apenas Administradores e Gerentes têm acesso à auditoria global
  const isAdmin =
    user?.role === "ADMINISTRADOR" ||
    user?.role === "DIRETOR" ||
    user?.role === "GERENTE";

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  // Filtragem
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Busca textual
      const matchesSearch =
        searchTerm === "" ||
        log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.detalhes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.ipOrigem && log.ipOrigem.includes(searchTerm));

      // Módulo
      const matchesModule =
        selectedModule === "ALL" || log.modulo === selectedModule;

      // Tipo de Ação
      const matchesActionType =
        selectedActionType === "ALL" || log.tipoAcao === selectedActionType;

      return matchesSearch && matchesModule && matchesActionType;
    });
  }, [logs, searchTerm, selectedModule, selectedActionType]);

  // Exportar CSV
  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }

    const headers = [
      "ID",
      "Data e Hora",
      "Usuário",
      "Email",
      "Cargo",
      "Módulo",
      "Tipo de Ação",
      "Ação",
      "Detalhes",
      "IP",
      "Dispositivo",
    ];

    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.dataHoraFormatada}"`,
      `"${l.usuario.nome}"`,
      `"${l.usuario.email}"`,
      `"${l.usuario.role}"`,
      `"${l.modulo}"`,
      `"${l.tipoAcao}"`,
      `"${l.acao.replace(/"/g, '""')}"`,
      `"${l.detalhes.replace(/"/g, '""')}"`,
      `"${l.ipOrigem || ""}"`,
      `"${l.dispositivo || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `auditoria-connect-platz-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionMessage("Exportação CSV concluída com sucesso!");
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Reset Mock
  const handleResetMock = () => {
    if (confirm("Deseja restaurar os registros originais de demonstração da auditoria?")) {
      resetAuditLogsToMock();
      setLogs(getAuditLogs());
      setActionMessage("Logs restaurados para o padrão de demonstração!");
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // Se for corretor regular, nega o acesso
  if (user && !isAdmin) {
    return <AccessDeniedCard moduleName="os logs e auditoria do sistema" />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-connect-blue/10 border border-connect-blue/20 text-connect-blue">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Log & Auditoria do Sistema
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trilha de eventos, histórico de operações e segurança de acessos em tempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auditoria Contínua Ativa</span>
          </div>
        </div>
      </div>

      {/* 2. StatCards de Resumo */}
      <AuditStatCards logs={logs} />

      {/* 3. Filtros & Ações de Busca */}
      <AuditFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedModule={selectedModule}
        onModuleChange={setSelectedModule}
        selectedActionType={selectedActionType}
        onActionTypeChange={setSelectedActionType}
        onExportCsv={handleExportCsv}
        onResetMock={handleResetMock}
        totalFiltered={filteredLogs.length}
        totalLogs={logs.length}
      />

      {/* 4. Tabela de Registros */}
      <AuditTable logs={filteredLogs} onViewDetails={setSelectedLog} />

      {/* 5. Modal de Detalhes do Log */}
      <AuditDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
