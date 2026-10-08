"use client";

import React from "react";
import { Search, Filter, Download, RotateCcw } from "lucide-react";
import { AuditModule, AuditActionType } from "@/lib/services/auditLogger";

interface AuditFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedModule: string;
  onModuleChange: (value: string) => void;
  selectedActionType: string;
  onActionTypeChange: (value: string) => void;
  onExportCsv: () => void;
  onResetMock: () => void;
  totalFiltered: number;
  totalLogs: number;
}

export function AuditFilters({
  searchTerm,
  onSearchChange,
  selectedModule,
  onModuleChange,
  selectedActionType,
  onActionTypeChange,
  onExportCsv,
  onResetMock,
  totalFiltered,
  totalLogs,
}: AuditFiltersProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3 text-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por colaborador, ação, IP ou detalhe do evento..."
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
          />
        </div>

        {/* Filtros em Linha */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Módulo */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            <select
              value={selectedModule}
              onChange={(e) => onModuleChange(e.target.value)}
              className="bg-background border border-border rounded-lg px-2.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue text-xs"
            >
              <option value="ALL">Todos os Módulos</option>
              <option value="AUTENTICACAO">Autenticação</option>
              <option value="LEADS">Leads</option>
              <option value="VENDAS">Vendas</option>
              <option value="FLUXO_DE_CAIXA">Fluxo de Caixa</option>
              <option value="EQUIPES">Equipes</option>
              <option value="METAS">Metas</option>
              <option value="AGENDA">Agenda</option>
              <option value="CONFIGURACOES">Configurações</option>
              <option value="SISTEMA">Sistema</option>
            </select>
          </div>

          {/* Tipo de Ação */}
          <select
            value={selectedActionType}
            onChange={(e) => onActionTypeChange(e.target.value)}
            className="bg-background border border-border rounded-lg px-2.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue text-xs"
          >
            <option value="ALL">Todas as Ações</option>
            <option value="CREATE">Criação (CREATE)</option>
            <option value="UPDATE">Atualização (UPDATE)</option>
            <option value="DELETE">Exclusão (DELETE)</option>
            <option value="LOGIN">Login (LOGIN)</option>
            <option value="PASSWORD_CHANGE">Troca de Senha</option>
            <option value="INVITE">Convite de Membro</option>
            <option value="EXPORT">Exportação de Dados</option>
          </select>

          {/* Botão Exportar CSV */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold border border-border transition-colors"
            title="Exportar logs filtrados em formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-connect-blue" />
            <span>CSV</span>
          </button>

          {/* Botão Resetar Logs */}
          <button
            onClick={onResetMock}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors"
            title="Restaurar registros padrão de demonstração"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Contagem de registros */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
        <span>
          Mostrando <strong className="text-foreground">{totalFiltered}</strong> de{" "}
          <strong className="text-foreground">{totalLogs}</strong> registros no log de auditoria
        </span>
        <span className="text-[10px] text-muted-foreground">
          Histórico com carimbo de tempo inviolável
        </span>
      </div>
    </div>
  );
}
