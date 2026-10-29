"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Filter, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { SaleItem, VendasFilterState } from "@/components/crm/vendas/types";
import { VendasStatCards } from "@/components/crm/vendas/VendasStatCards";
import { VendasTable } from "@/components/crm/vendas/VendasTable";
import { VendasFilterSheet } from "@/components/crm/vendas/VendasFilterSheet";
import { NewSaleModal } from "@/components/crm/vendas/NewSaleModal";
import { SaleDetailModal } from "@/components/crm/vendas/SaleDetailModal";
import { CommissionReceiptModal } from "@/components/crm/vendas/CommissionReceiptModal";
import {
  PeriodKey,
  periodWindow,
  inWindow,
  matchesFilters,
  sortSales,
  computeTotals,
  trendOf,
} from "@/components/crm/vendas/vendasMetrics";

const initialFilters: VendasFilterState = {
  corretor: "ALL",
  captador: "ALL",
  gestor: "ALL",
  equipe: "ALL",
  construtora: "ALL",
  vgvMin: "",
  vgvMax: "",
  codigoVenda: "",
  status: "ALL",
  ordenarPor: "recente",
};

const TABS = [
  { id: "vendas_mensais", label: "Vendas Mensais" },
  { id: "comissoes", label: "Comissões" },
  { id: "agenda_vencimentos", label: "Agenda de Vencimentos" },
  { id: "pendencias", label: "Pendências Colaboradores" },
  { id: "estatisticas", label: "Estatísticas" },
] as const;

export default function VendasComissoesPage() {
  const { user, setActionMessage, selectedPeriod, hideValues, toggleHideValues } = useCrm();
  const canManageSales = user?.role === "ADMINISTRADOR" || user?.role === "FINANCEIRO_VENDA";
  const canManagePayments = canManageSales;

  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("vendas_mensais");
  const [filters, setFilters] = useState<VendasFilterState>(initialFilters);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<SaleItem | null>(null);
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<SaleItem | null>(null);

  const notify = useCallback(
    (msg: string) => {
      setActionMessage(msg);
      setTimeout(() => setActionMessage(null), 4000);
    },
    [setActionMessage]
  );

  const loadSales = useCallback(async () => {
    setLoadingSales(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/vendas", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoadError(data?.error || "Não foi possível carregar as vendas.");
        return;
      }
      setSales(data.sales || []);
    } catch {
      setLoadError("Falha de conexão ao carregar as vendas.");
    } finally {
      setLoadingSales(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const period = (selectedPeriod || "todos") as PeriodKey;

  const filteredSales = useMemo(
    () =>
      sortSales(
        sales.filter((s) => matchesFilters(s, filters) && inWindow(s, periodWindow(period))),
        filters.ordenarPor
      ),
    [sales, filters, period]
  );

  const totals = useMemo(() => computeTotals(filteredSales), [filteredSales]);

  // Tendência real: mesmo filtro aplicado à janela imediatamente anterior
  const trends = useMemo(() => {
    const prevWindow = periodWindow(period, 1);
    if (!prevWindow) return {};
    const prev = computeTotals(sales.filter((s) => matchesFilters(s, filters) && inWindow(s, prevWindow)));
    return {
      vgvTotal: trendOf(totals.vgvTotal, prev.vgvTotal),
      totalVendas: trendOf(totals.totalVendas, prev.totalVendas),
      comissaoRecebida: trendOf(totals.comissaoRecebida, prev.comissaoRecebida),
      comissoesPagas: trendOf(totals.comissoesPagas, prev.comissoesPagas),
      comissoesPendentes: trendOf(totals.comissoesPendentes, prev.comissoesPendentes),
    };
  }, [sales, filters, period, totals]);

  const replaceSale = (updated: SaleItem) => {
    setSales((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedSaleDetail((prev) => (prev && prev.id === updated.id ? updated : prev));
  };

  const handleUpdateSplitStatus = async (
    splitId: string,
    status: "PAGO" | "PENDENTE",
    dataPagamento?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/vendas/splits/${splitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(dataPagamento ? { dataPagamento } : {}) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(data?.error || "Não foi possível atualizar a comissão.");
        return false;
      }
      replaceSale(data.sale);
      notify(status === "PAGO" ? "Baixa de comissão confirmada!" : "Baixa de comissão estornada.");
      return true;
    } catch {
      notify("Falha de conexão ao atualizar a comissão.");
      return false;
    }
  };

  const handleSaleCreated = (created: SaleItem) => {
    setSales((prev) => [created, ...prev]);
    notify(`Venda ${created.codigoVenda} registrada e splits gerados!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendas e Comissões</h1>
          <p className="text-xs text-muted-foreground">
            Controle de fechamentos, comissões pagas, a liberar e split de corretores.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleHideValues}
            className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={hideValues ? "Mostrar valores" : "Ocultar valores monetários"}
            aria-label="Alternar exibição de valores"
          >
            {hideValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsFilterSheetOpen(true)}
            className="px-3.5 py-2 rounded-lg border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted flex items-center gap-1.5 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            Filtros
          </button>
          {canManageSales && (
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="bg-connect-blue hover:bg-connect-deep-blue text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-connect-blue/20 hover:shadow-connect-blue/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Nova Venda
            </button>
          )}
        </div>
      </div>

      <VendasStatCards totals={totals} trends={trends} hideValues={hideValues} loading={loadingSales} />

      <div className="flex bg-muted p-1 rounded-lg overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-card text-connect-blue dark:text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loadingSales ? (
        <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-connect-blue" />
          <span className="text-xs">Carregando vendas...</span>
        </div>
      ) : loadError ? (
        <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="text-sm font-semibold text-foreground">{loadError}</p>
          <button
            onClick={loadSales}
            className="px-4 py-2 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold transition-all hover:scale-[1.02]"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <VendasTable
          sales={filteredSales}
          hideValues={hideValues}
          canManagePayments={canManagePayments}
          onViewDetails={(s) => setSelectedSaleDetail(s)}
          onViewReceipt={(s) => setSelectedReceiptSale(s)}
          onEditPayment={(s) => setSelectedSaleDetail(s)}
        />
      )}

      <VendasFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() => setFilters(initialFilters)}
        totalFilteredCount={filteredSales.length}
        sales={sales}
      />

      <NewSaleModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onSubmit={handleSaleCreated} />

      <SaleDetailModal
        sale={selectedSaleDetail}
        canManagePayments={canManagePayments}
        onClose={() => setSelectedSaleDetail(null)}
        onUpdateSplitStatus={handleUpdateSplitStatus}
      />

      <CommissionReceiptModal sale={selectedReceiptSale} onClose={() => setSelectedReceiptSale(null)} />
    </div>
  );
}
