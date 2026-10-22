"use client";

import React from "react";
import { FilterSheet } from "@/components/crm/primitives";
import { DEFAULT_SCORE_RULES } from "@/lib/domain/scoring/leadScore";
import { LEAD_SOURCE_CODES, LEAD_SOURCE_LABELS } from "./leadSource";

interface LeadFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  temperatureFilter: string;
  setTemperatureFilter: (temp: string) => void;
  originFilter: string;
  setOriginFilter: (origin: string) => void;
  slaFilter: string;
  setSlaFilter: (sla: string) => void;
  onResetFilters: () => void;
}

const { hotThreshold, warmThreshold } = DEFAULT_SCORE_RULES;
const selectClass =
  "w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue";
const labelClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5";

export function LeadFilterSheet({
  isOpen,
  onClose,
  temperatureFilter,
  setTemperatureFilter,
  originFilter,
  setOriginFilter,
  slaFilter,
  setSlaFilter,
  onResetFilters,
}: LeadFilterSheetProps) {
  return (
    <FilterSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filtros Avançados de Leads"
      onApply={onClose}
      onReset={onResetFilters}
    >
      <div className="space-y-4">
        {/* 1. Temperatura do Lead (derivada do score determinístico) */}
        <div>
          <label className={labelClass}>Temperatura / Potencial</label>
          <select value={temperatureFilter} onChange={(e) => setTemperatureFilter(e.target.value)} className={selectClass}>
            <option value="TODAS">Todas as Temperaturas</option>
            <option value="QUENTE">🔥 Quente (Score ≥ {hotThreshold})</option>
            <option value="MORNO">☕ Morno (Score {warmThreshold}–{hotThreshold - 1})</option>
            <option value="FRIO">🧊 Frio (Score &lt; {warmThreshold})</option>
          </select>
        </div>

        {/* 2. Origem do Lead */}
        <div>
          <label className={labelClass}>Origem do Lead</label>
          <select value={originFilter} onChange={(e) => setOriginFilter(e.target.value)} className={selectClass}>
            <option value="TODAS">Todas as Origens</option>
            {LEAD_SOURCE_CODES.map((code) => (
              <option key={code} value={code}>
                {LEAD_SOURCE_LABELS[code]}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Status de SLA */}
        <div>
          <label className={labelClass}>Status de SLA</label>
          <select value={slaFilter} onChange={(e) => setSlaFilter(e.target.value)} className={selectClass}>
            <option value="TODOS">Todos os Leads</option>
            <option value="DENTRO_PRAZO">Em dia (SLA Regular)</option>
            <option value="CRITICO">Crítico (vence em até 15 min ou sem 1º contato)</option>
            <option value="ESTOURADO">SLA Estourado</option>
          </select>
        </div>
      </div>
    </FilterSheet>
  );
}
