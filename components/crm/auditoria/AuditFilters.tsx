"use client";

import React from "react";
import { Search, Filter, Download, RefreshCw, CalendarDays } from "lucide-react";

export interface AuditFilterState {
  q: string;
  modulo: string;
  tipoAcao: string;
  userId: string;
  from: string;
  to: string;
}

interface AuditFiltersProps {
  filters: AuditFilterState;
  onChange: (patch: Partial<AuditFilterState>) => void;
  usuarios: { id: string; nome: string }[];
  onExportCsv: () => void;
  onRefresh: () => void;
  loading?: boolean;
  totalShown: number;
  total: number;
}

const MODULES: [string, string][] = [
  ["ALL", "Todos os Módulos"],
  ["AUTENTICACAO", "Autenticação"],
  ["LEADS", "Leads"],
  ["VENDAS", "Vendas"],
  ["FLUXO_DE_CAIXA", "Fluxo de Caixa"],
  ["EQUIPES", "Equipes"],
  ["METAS", "Metas"],
  ["AGENDA", "Agenda"],
  ["EMPREENDIMENTOS", "Empreendimentos"],
  ["INTEGRACOES", "Integrações"],
  ["CONFIGURACOES", "Configurações"],
  ["SISTEMA", "Sistema"],
];

const ACTIONS: [string, string][] = [
  ["ALL", "Todas as Ações"],
  ["CREATE", "Criação (CREATE)"],
  ["UPDATE", "Atualização (UPDATE)"],
  ["DELETE", "Exclusão (DELETE)"],
  ["STATUS_CHANGE", "Mudança de Status"],
  ["LOGIN", "Login (LOGIN)"],
  ["INVITE", "Convite de Membro"],
  ["EXPORT", "Exportação de Dados"],
];

const selectClass =
  "bg-background border border-border rounded-lg px-2.5 py-2 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue text-xs";

export function AuditFilters({
  filters,
  onChange,
  usuarios,
  onExportCsv,
  onRefresh,
  loading,
  totalShown,
  total,
}: AuditFiltersProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3 text-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Buscar por colaborador, ação, IP ou detalhe do evento..."
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
          <select value={filters.modulo} onChange={(e) => onChange({ modulo: e.target.value })} className={selectClass}>
            {MODULES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>

          <select value={filters.tipoAcao} onChange={(e) => onChange({ tipoAcao: e.target.value })} className={selectClass}>
            {ACTIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>

          <select value={filters.userId} onChange={(e) => onChange({ userId: e.target.value })} className={selectClass}>
            <option value="ALL">Todos os usuários</option>
            <option value="SISTEMA">Sistema / Integrações</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(e) => onChange({ from: e.target.value })}
            className={selectClass}
            aria-label="Data inicial"
          />
          <span className="text-muted-foreground">até</span>
          <input
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => onChange({ to: e.target.value })}
            className={selectClass}
            aria-label="Data final"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors disabled:opacity-50"
            title="Atualizar registros"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onExportCsv}
            disabled={totalShown === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold border border-border transition-colors disabled:opacity-50"
            title="Exportar a página atual em CSV"
          >
            <Download className="w-3.5 h-3.5 text-connect-blue" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
        <span>
          Exibindo <strong className="text-foreground">{totalShown}</strong> de{" "}
          <strong className="text-foreground">{total}</strong> registros encontrados
        </span>
        <span className="text-[10px] hidden sm:inline">Registros gravados pelo servidor com carimbo de tempo</span>
      </div>
    </div>
  );
}
