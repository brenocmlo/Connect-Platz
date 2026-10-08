"use client";

import React, { useState, useMemo } from "react";
import { Plus, Filter, Eye, EyeOff, Calendar } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { SaleItem, VendasFilterState } from "@/components/crm/vendas/types";
import { VendasStatCards } from "@/components/crm/vendas/VendasStatCards";
import { VendasTable } from "@/components/crm/vendas/VendasTable";
import { VendasFilterSheet } from "@/components/crm/vendas/VendasFilterSheet";
import { NewSaleModal } from "@/components/crm/vendas/NewSaleModal";
import { SaleDetailModal } from "@/components/crm/vendas/SaleDetailModal";

const initialSales: SaleItem[] = [
  {
    id: "sale-1",
    codigoVenda: "CP-2026-089",
    imovelNome: "Villa Platz Beach Residence",
    construtora: "Platz Empreendimentos",
    unidadeNumero: "403 (Torre Coral)",
    compradorNome: "Dr. Marcelo Cavalcante",
    corretorTitular: "Lucas Santos",
    gerente: "Mariana Oliveira",
    gestor: "Diretoria Platz",
    captador: "Rafael Mendes",
    dataVenda: "28/09/2026",
    vgv: 1050000,
    valorAvaliacao: 1100000,
    comissaoTotal: 52500,
    impostoValor: 3150,
    impostoPercentual: 6,
    proximoPagamento: "05/10/2026",
    meioPagamento: "TED",
    status: "APROVADA",
    splits: [
      { id: "s-1", beneficiario: "Connect Platz Imobiliária", categoria: "Imobiliária", percentual: 40, valor: 21000, status: "PAGO" },
      { id: "s-2", beneficiario: "Lucas Santos", categoria: "Corretor 1", percentual: 40, valor: 21000, status: "PAGO", pix: "lucas.corretor@pix.com" },
      { id: "s-3", beneficiario: "Mariana Oliveira", categoria: "Gerente", percentual: 10, valor: 5250, status: "PAGO", pix: "mariana.gerente@pix.com" },
      { id: "s-4", beneficiario: "Rafael Mendes", categoria: "Captador", percentual: 10, valor: 5250, status: "PENDENTE", pix: "rafael.captador@pix.com" },
    ],
  },
  {
    id: "sale-2",
    codigoVenda: "CP-2026-090",
    imovelNome: "Residencial Aldeota Platz",
    construtora: "Platz Empreendimentos",
    unidadeNumero: "201",
    compradorNome: "Roberto Simões",
    corretorTitular: "Mariana Oliveira",
    segundoCorretor: "Carlos Eduardo",
    gerente: "Mariana Oliveira",
    gestor: "Diretoria Platz",
    captador: "Lucas Santos",
    dataVenda: "29/09/2026",
    vgv: 880000,
    valorAvaliacao: 900000,
    comissaoTotal: 44000,
    impostoValor: 2640,
    impostoPercentual: 6,
    proximoPagamento: "10/10/2026",
    meioPagamento: "PIX",
    status: "EM_ANALISE",
    splits: [
      { id: "s-5", beneficiario: "Connect Platz Imobiliária", categoria: "Imobiliária", percentual: 45, valor: 19800, status: "PAGO" },
      { id: "s-6", beneficiario: "Mariana Oliveira", categoria: "Corretor 1", percentual: 30, valor: 13200, status: "PENDENTE", pix: "mariana.pix@banco.com" },
      { id: "s-7", beneficiario: "Carlos Eduardo", categoria: "Corretor 2", percentual: 15, valor: 6600, status: "PENDENTE", pix: "carlos.pix@banco.com" },
      { id: "s-8", beneficiario: "Lucas Santos", categoria: "Captador", percentual: 10, valor: 4400, status: "PENDENTE" },
    ],
  },
];

const initialFilters: VendasFilterState = {
  corretor: "ALL",
  gerente: "ALL",
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

export default function VendasComissoesPage() {
  const { setActionMessage, selectedPeriod, setSelectedPeriod } = useCrm();
  const [sales, setSales] = useState<SaleItem[]>(initialSales);
  const [activeTab, setActiveTab] = useState<
    "vendas_mensais" | "comissoes" | "agenda_vencimentos" | "pendencias" | "estatisticas"
  >("vendas_mensais");
  const [hideValues, setHideValues] = useState<boolean>(false);
  const [filters, setFilters] = useState<VendasFilterState>(initialFilters);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<SaleItem | null>(null);

  // Filtragem (incluindo período)
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (filters.status !== "ALL" && s.status !== filters.status) return false;
      if (
        filters.corretor !== "ALL" &&
        s.corretorTitular !== filters.corretor &&
        s.segundoCorretor !== filters.corretor
      )
        return false;
      if (filters.gerente !== "ALL" && s.gerente !== filters.gerente) return false;
      if (filters.captador !== "ALL" && s.captador !== filters.captador) return false;
      if (filters.construtora !== "ALL" && s.construtora !== filters.construtora) return false;
      if (
        filters.codigoVenda &&
        !s.codigoVenda.toLowerCase().includes(filters.codigoVenda.toLowerCase())
      )
        return false;
      if (filters.vgvMin && s.vgv < Number(filters.vgvMin)) return false;
      if (filters.vgvMax && s.vgv > Number(filters.vgvMax)) return false;

      // Filtro de período determinístico
      if (selectedPeriod && selectedPeriod !== "todos") {
        const parts = s.dataVenda.split("/");
        let saleDate = new Date();
        if (parts.length === 3) {
          saleDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
        const now = new Date();
        const diffMs = Math.abs(now.getTime() - saleDate.getTime());
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (selectedPeriod === "hoje") {
          if (diffDays > 1 && saleDate.toDateString() !== now.toDateString()) return false;
        } else if (selectedPeriod === "7d") {
          if (diffDays > 7) return false;
        } else if (selectedPeriod === "mes" || selectedPeriod === "30d") {
          if (diffDays > 31) return false;
        } else if (selectedPeriod === "ano") {
          if (diffDays > 365) return false;
        }
      }

      return true;
    });
  }, [sales, filters, selectedPeriod]);

  // Totais reativos para os StatCards baseados nas vendas filtradas
  const vgvTotal = useMemo(() => filteredSales.reduce((acc, s) => acc + s.vgv, 0), [filteredSales]);
  const totalVendas = filteredSales.length;
  const comissaoRecebida = useMemo(
    () => filteredSales.reduce((acc, s) => acc + s.comissaoTotal, 0),
    [filteredSales]
  );
  const comissoesPagas = useMemo(
    () =>
      filteredSales.reduce(
        (acc, s) =>
          acc + s.splits.filter((sp) => sp.status === "PAGO").reduce((a, b) => a + b.valor, 0),
        0
      ),
    [filteredSales]
  );
  const comissoesPendentes = useMemo(
    () =>
      filteredSales.reduce(
        (acc, s) =>
          acc + s.splits.filter((sp) => sp.status === "PENDENTE").reduce((a, b) => a + b.valor, 0),
        0
      ),
    [filteredSales]
  );

  const handleBaixaComissao = (saleId: string, splitId: string) => {
    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId
          ? {
              ...s,
              splits: s.splits.map((sp) =>
                sp.id === splitId ? { ...sp, status: "PAGO" as const } : sp
              ),
            }
          : s
      )
    );
    if (selectedSaleDetail && selectedSaleDetail.id === saleId) {
      setSelectedSaleDetail((prev) =>
        prev
          ? {
              ...prev,
              splits: prev.splits.map((sp) =>
                sp.id === splitId ? { ...sp, status: "PAGO" as const } : sp
              ),
            }
          : null
      );
    }
    setActionMessage("Baixa financeira de comissão confirmada com sucesso!");
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleAddSale = (newSale: SaleItem) => {
    setSales([newSale, ...sales]);
    setActionMessage("Venda cadastrada e splits gerados com sucesso!");
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header com ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Vendas e Comissões
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controle de fechamentos, comissões pagas, a liberar e split de corretores.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Eye Button (Ocultar Valores Monetários) */}
          <button
            onClick={() => setHideValues(!hideValues)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#0A0E17] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#161F30] transition-colors"
            title={hideValues ? "Mostrar valores" : "Ocultar valores monetários"}
            aria-label="Alternar exibição de valores"
          >
            {hideValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Seletor de Período Interativo */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="appearance-none pl-8 pr-7 py-2 rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#0A0E17] text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#161F30] cursor-pointer transition-colors shadow-xs"
              aria-label="Filtrar por período"
            >
              <option value="hoje">Hoje</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="mes">Mês atual</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="ano">Ano atual</option>
              <option value="todos">Todo o período</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Botão Filtros (Abre Sheet) */}
          <button
            onClick={() => setIsFilterSheetOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#0A0E17] text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#161F30] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Filter className="w-3.5 h-3.5" />
            Filtros
          </button>

          {/* CTA Nova Venda */}
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-connect-blue hover:bg-connect-deep-blue text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-connect-blue/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Nova Venda
          </button>
        </div>
      </div>

      {/* 2. 5 StatCards */}
      <VendasStatCards
        vgvTotal={vgvTotal}
        totalVendas={totalVendas}
        comissaoRecebida={comissaoRecebida}
        comissoesPagas={comissoesPagas}
        comissoesPendentes={comissoesPendentes}
        hideValues={hideValues}
      />

      {/* 3. Tabs de navegação interna */}
      <div className="flex border-b border-slate-200 dark:border-[#1C2537] bg-slate-100/60 dark:bg-[#0A0E17] p-1 rounded-xl overflow-x-auto">
        {[
          { id: "vendas_mensais", label: "Vendas Mensais" },
          { id: "comissoes", label: "Comissões" },
          { id: "agenda_vencimentos", label: "Agenda de Vencimentos" },
          { id: "pendencias", label: "Pendências Colaboradores" },
          { id: "estatisticas", label: "Estatísticas" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-[#161F30] text-connect-blue dark:text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Tabela de Vendas */}
      <VendasTable
        sales={filteredSales}
        hideValues={hideValues}
        onViewDetails={(s) => setSelectedSaleDetail(s)}
        onViewReceipt={(s) => setSelectedSaleDetail(s)}
        onEditPayment={(s) => setSelectedSaleDetail(s)}
      />

      {/* 5. Modais & Sheet */}
      <VendasFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() => setFilters(initialFilters)}
        totalFilteredCount={filteredSales.length}
      />

      <NewSaleModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleAddSale}
      />

      <SaleDetailModal
        sale={selectedSaleDetail}
        onClose={() => setSelectedSaleDetail(null)}
        onBaixaComissao={handleBaixaComissao}
      />
    </div>
  );
}
