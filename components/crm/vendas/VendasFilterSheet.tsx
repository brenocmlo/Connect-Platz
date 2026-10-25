"use client";

import React, { useMemo } from "react";
import { X, Filter, RotateCcw } from "lucide-react";
import { SaleItem, VendasFilterState } from "./types";

interface VendasFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: VendasFilterState;
  onFilterChange: (filters: VendasFilterState) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  /** Vendas carregadas — as opções dos selects são derivadas delas (sem nomes fixos) */
  sales: SaleItem[];
}

const fieldClass =
  "w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue";
const labelClass = "block font-semibold text-muted-foreground mb-1";

const uniq = (values: (string | null | undefined)[]) =>
  Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort((a, b) => a.localeCompare(b, "pt-BR"));

export function VendasFilterSheet({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  totalFilteredCount,
  sales,
}: VendasFilterSheetProps) {
  const options = useMemo(
    () => ({
      corretor: uniq(sales.flatMap((s) => [s.corretorTitular, s.segundoCorretor])),
      captador: uniq(sales.map((s) => s.captador)),
      gestor: uniq(sales.map((s) => s.gestor)),
      construtora: uniq(sales.map((s) => s.construtora)),
    }),
    [sales]
  );

  if (!isOpen) return null;

  const handleChange = (field: keyof VendasFilterState, value: string) =>
    onFilterChange({ ...filters, [field]: value });

  const selects: { field: keyof typeof options; label: string; all: string }[] = [
    { field: "corretor", label: "Corretores", all: "Todos os corretores" },
    { field: "captador", label: "Captadores", all: "Todos os captadores" },
    { field: "gestor", label: "Gestores / Sócios", all: "Todos os gestores" },
    { field: "construtora", label: "Construtoras", all: "Todas as construtoras" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in-0">
      <div className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-connect-blue/10 text-connect-blue">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Filtros de Vendas</h3>
              <p className="text-xs text-muted-foreground">Refine a listagem de negócios e comissões</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Fechar filtros"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          <div>
            <label className={labelClass}>Código da Venda</label>
            <input
              type="text"
              placeholder="Ex: CP-2026-001"
              value={filters.codigoVenda}
              onChange={(e) => handleChange("codigoVenda", e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Status da Venda</label>
            <select value={filters.status} onChange={(e) => handleChange("status", e.target.value)} className={fieldClass}>
              <option value="ALL">Todos os status</option>
              <option value="ativa">Ativa</option>
              <option value="cancelada">Cancelada</option>
              <option value="comissao_pendente">Comissão pendente</option>
              <option value="comissao_parcial">Comissão parcial</option>
              <option value="comissao_paga">Comissão paga</option>
            </select>
          </div>

          {selects.map(({ field, label, all }) => (
            <div key={field}>
              <label className={labelClass}>{label}</label>
              <select value={filters[field]} onChange={(e) => handleChange(field, e.target.value)} className={fieldClass}>
                <option value="ALL">{all}</option>
                {options[field].map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div>
            <label className={labelClass}>VGV Mínimo e Máximo (R$)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Mínimo"
                value={filters.vgvMin}
                onChange={(e) => handleChange("vgvMin", e.target.value)}
                className={fieldClass}
              />
              <input
                type="number"
                placeholder="Máximo"
                value={filters.vgvMax}
                onChange={(e) => handleChange("vgvMax", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Ordenar por</label>
            <select value={filters.ordenarPor} onChange={(e) => handleChange("ordenarPor", e.target.value)} className={fieldClass}>
              <option value="recente">Mais recentes primeiro</option>
              <option value="vgv_desc">Maior VGV</option>
              <option value="vgv_asc">Menor VGV</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/40">
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar Filtros
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-connect-blue text-white hover:bg-connect-deep-blue shadow-lg shadow-connect-blue/20 transition-all hover:scale-[1.02]"
            >
              Ver resultados ({totalFilteredCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
