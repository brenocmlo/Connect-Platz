"use client";

import React from "react";
import { FilterSheet } from "@/components/crm/primitives";

interface LeadFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFunnel: string;
  setSelectedFunnel: (funnel: string) => void;
  temperatureFilter: string;
  setTemperatureFilter: (temp: string) => void;
  originFilter: string;
  setOriginFilter: (origin: string) => void;
  slaFilter: string;
  setSlaFilter: (sla: string) => void;
  onResetFilters: () => void;
}

export function LeadFilterSheet({
  isOpen,
  onClose,
  selectedFunnel,
  setSelectedFunnel,
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
        {/* 1. Funil de Vendas */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Funil de Vendas
          </label>
          <select
            value={selectedFunnel}
            onChange={(e) => setSelectedFunnel(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
          >
            <option>Lançamentos de Médio & Alto Padrão</option>
            <option>Imóveis Prontos & Avulsos</option>
            <option>Aluguel de Temporada (Veraneio)</option>
            <option>Programa Minha Casa Minha Vida</option>
          </select>
        </div>

        {/* 2. Temperatura do Lead */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Temperatura / Potencial
          </label>
          <select
            value={temperatureFilter}
            onChange={(e) => setTemperatureFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
          >
            <option value="TODAS">Todas as Temperaturas</option>
            <option value="QUENTE">🔥 Quente (Score ≥ 70)</option>
            <option value="MORNO">☕ Morno (Score 40-69)</option>
            <option value="FRIO">🧊 Frio (Score &lt; 40)</option>
          </select>
        </div>

        {/* 3. Origem do Lead */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Canal de Origem
          </label>
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
          >
            <option value="TODAS">Todas as Origens</option>
            <option value="META_ADS">Meta Ads (Instagram / Facebook)</option>
            <option value="GOOGLE_ADS">Google Ads</option>
            <option value="WHATSAPP">WhatsApp Direto</option>
            <option value="SITE">Landing Page / Site Vitrine</option>
            <option value="ORGANICO">Orgânico / Indicação</option>
            <option value="MANUAL_CORRETOR">Cadastro Manual</option>
          </select>
        </div>

        {/* 4. Status de SLA */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Status de SLA
          </label>
          <select
            value={slaFilter}
            onChange={(e) => setSlaFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
          >
            <option value="TODOS">Todos os Leads</option>
            <option value="DENTRO_PRAZO">Em dia (SLA Regular)</option>
            <option value="CRITICO">Próximo do vencimento</option>
            <option value="ESTOURADO">SLA Estourado / Crítico</option>
          </select>
        </div>

        {/* 5. Faixa de Renda */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Faixa de Renda
          </label>
          <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue">
            <option value="TODAS">Qualquer renda</option>
            <option value="ATE_5K">Até R$ 5.000</option>
            <option value="5K_15K">R$ 5.000 a R$ 15.000</option>
            <option value="15K_30K">R$ 15.000 a R$ 30.000</option>
            <option value="ACIMA_30K">Acima de R$ 30.000</option>
          </select>
        </div>
      </div>
    </FilterSheet>
  );
}
