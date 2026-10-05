"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  BarChart3,
  Layers,
  Wallet,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { TrendBadge } from "@/components/crm/primitives/TrendBadge";
import { DreTable } from "@/components/crm/financeiro/DreTable";
import { CashFlowTable, CashFlowItem } from "@/components/crm/financeiro/CashFlowTable";
import { CashFlowProjection } from "@/components/crm/financeiro/CashFlowProjection";
import { NewCashFlowModal } from "@/components/crm/financeiro/NewCashFlowModal";
import { AccessDeniedCard } from "@/components/crm/AccessDeniedCard";

const initialCashFlows: CashFlowItem[] = [
  { id: "cf-1", tipo: "RECEITA", categoria: "Comissão Venda", descricao: "Comissão Venda Apt 403 • Villa Platz Beach", valor: 52500, dataVencimento: "28/09/2026", status: "PAGO", meioPagamento: "TED" },
  { id: "cf-2", tipo: "RECEITA", categoria: "Aluguel Veraneio", descricao: "Reserva #408 • Solarium Porto das Dunas (5 diárias)", valor: 6500, dataVencimento: "29/09/2026", status: "PAGO", meioPagamento: "PIX" },
  { id: "cf-3", tipo: "DESPESA", categoria: "Split Comissão", descricao: "Repasse Corretor Titular (Lucas Santos)", valor: 21000, dataVencimento: "29/09/2026", status: "PAGO", meioPagamento: "PIX" },
  { id: "cf-4", tipo: "DESPESA", categoria: "Tráfego Pago Meta Ads", descricao: "Fatura Anúncios Campanha Instagram/Facebook Lançamento", valor: 12500, dataVencimento: "05/10/2026", status: "PENDENTE", meioPagamento: "Cartão de Crédito" },
  { id: "cf-5", tipo: "DESPESA", categoria: "Sede & Administrativo", descricao: "Aluguel & Condomínio Sede Aldeota", valor: 8500, dataVencimento: "10/10/2026", status: "PENDENTE", meioPagamento: "Boleto" },
  { id: "cf-6", tipo: "RECEITA", categoria: "Comissão Venda", descricao: "Comissão Venda Apt 201 • Residencial Aldeota Platz", valor: 44000, dataVencimento: "15/10/2026", status: "PENDENTE", meioPagamento: "TED" },
];

export default function FluxoCaixaDREPage() {
  const { user, setActionMessage, hideValues } = useCrm();

  if (user && user.role === "CORRETOR") {
    return <AccessDeniedCard moduleName="o Fluxo de Caixa e DRE corporativo" />;
  }

  const [activeTab, setActiveTab] = useState<"contas" | "dre" | "projecao">("contas");
  const [cashFlows, setCashFlows] = useState<CashFlowItem[]>(initialCashFlows);
  const [filterTipo, setFilterTipo] = useState<"TODOS" | "RECEITA" | "DESPESA">("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalReceitas = cashFlows
    .filter((c) => c.tipo === "RECEITA" && c.status === "PAGO")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalDespesas = cashFlows
    .filter((c) => c.tipo === "DESPESA" && c.status === "PAGO")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  // Lógica contábil do DRE
  const receitaBruta = 342500;
  const deducoesImpostos = 20550;
  const receitaLiquida = receitaBruta - deducoesImpostos;
  const custosVariaveisSplits = 137000;
  const margemContribuicao = receitaLiquida - custosVariaveisSplits;
  const despesasOperacionais = 48500;
  const ebitda = margemContribuicao - despesasOperacionais;

  const handleAddEntry = (entry: CashFlowItem) => {
    setCashFlows([entry, ...cashFlows]);
    setActionMessage(
      entry.status === "PAGO"
        ? "Lançamento liquidado e registrado no caixa com sucesso!"
        : "Lançamento agendado adicionado com sucesso!"
    );
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleConfirmMovement = (
    item: CashFlowItem,
    dataEfetiva: string,
    meio: string,
    observacao?: string
  ) => {
    setCashFlows((prev) =>
      prev.map((c) =>
        c.id === item.id
          ? {
              ...c,
              status: "PAGO",
              dataLiquidacao: dataEfetiva,
              foiAntecipado: true,
              meioPagamento: meio,
              observacaoLiquidacao: observacao,
            }
          : c
      )
    );
    const tipoLabel = item.tipo === "RECEITA" ? "Entrada" : "Saída";
    setActionMessage(
      `${tipoLabel} de ${item.valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })} confirmada com sucesso em ${dataEfetiva}! Saldo de caixa recalculado.`
    );
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleRevertMovement = (id: string) => {
    setCashFlows((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "PENDENTE",
              dataLiquidacao: undefined,
              foiAntecipado: false,
            }
          : c
      )
    );
    setActionMessage("Lançamento revertido para pendente.");
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. CABEÇALHO PADRÃO SEÇÃO 5.2 */}
      <PageHeader
        title="Fluxo de Caixa & DRE"
        subtitle="Conciliação de faturamento de vendas, estadias de temporada e custos operacionais."
        actionLabel="Novo Lançamento"
        onActionClick={() => setIsModalOpen(true)}
        showPeriodSelector={true}
        showExportButton={true}
      />

      {/* 2. RESUMO DE CAIXA & RENTABILIDADE */}
      <div className="space-y-4">
        <SectionTitle>Resumo de Caixa & Rentabilidade</SectionTitle>

        {/* 3 STATCARDS COM COUNT-UP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <TrendBadge value="+18.4%" isPositive={true} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Receitas Liquidadas (Mês)
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {hideValues ? "••••••" : <CountUpNumber value={totalReceitas} prefix="R$ " decimals={2} />}
              </span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <TrendBadge value="+4.2%" isPositive={false} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Despesas & Splits Pagos
              </span>
              <span className="text-2xl font-black text-red-600 dark:text-red-400 mt-1 block">
                {hideValues ? "••••••" : <CountUpNumber value={totalDespesas} prefix="R$ " decimals={2} />}
              </span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-platz-gold/15 text-platz-gold">
                <Wallet className="w-4 h-4" />
              </div>
              <TrendBadge value="+12.8%" isPositive={true} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Saldo Operacional em Caixa
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-[#F8DA56] mt-1 block">
                {hideValues ? "••••••" : <CountUpNumber value={saldoLiquido} prefix="R$ " decimals={2} />}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABS SHADCN STYLE */}
      <div className="flex bg-muted p-1 rounded-xl gap-1 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("dre")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === "dre"
              ? "bg-card text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4 text-connect-blue" />
          DRE Gerencial em Tempo Real
        </button>

        <button
          onClick={() => setActiveTab("contas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === "contas"
              ? "bg-card text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="w-4 h-4 text-connect-blue" />
          Contas a Pagar & Receber
        </button>

        <button
          onClick={() => setActiveTab("projecao")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === "projecao"
              ? "bg-card text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-connect-blue" />
          Projeção de Saldo (90 Dias)
        </button>
      </div>

      {/* 4. CONTEÚDO DAS ABAS MODULARIZADAS */}
      {activeTab === "dre" && (
        <DreTable
          receitaBruta={receitaBruta}
          deducoesImpostos={deducoesImpostos}
          receitaLiquida={receitaLiquida}
          custosVariaveisSplits={custosVariaveisSplits}
          margemContribuicao={margemContribuicao}
          despesasOperacionais={despesasOperacionais}
          ebitda={ebitda}
        />
      )}

      {activeTab === "contas" && (
        <CashFlowTable
          cashFlows={cashFlows}
          filterTipo={filterTipo}
          onSetFilterTipo={setFilterTipo}
          onConfirmMovement={handleConfirmMovement}
          onRevertMovement={handleRevertMovement}
        />
      )}

      {activeTab === "projecao" && <CashFlowProjection />}

      {/* MODAL */}
      <NewCashFlowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEntry}
      />
    </div>
  );
}
