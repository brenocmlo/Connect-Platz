"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  BarChart3,
  Layers,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { DreTable } from "@/components/crm/financeiro/DreTable";
import { CashFlowTable, CashFlowItem } from "@/components/crm/financeiro/CashFlowTable";
import { CashFlowProjection } from "@/components/crm/financeiro/CashFlowProjection";
import { NewCashFlowModal } from "@/components/crm/financeiro/NewCashFlowModal";

const initialCashFlows: CashFlowItem[] = [
  { id: "cf-1", tipo: "RECEITA", categoria: "Comissão Venda", descricao: "Comissão Venda Apt 403 • Villa Platz Beach", valor: 52500, dataVencimento: "28/09/2026", status: "PAGO", meioPagamento: "TED" },
  { id: "cf-2", tipo: "RECEITA", categoria: "Aluguel Veraneio", descricao: "Reserva #408 • Solarium Porto das Dunas (5 diárias)", valor: 6500, dataVencimento: "29/09/2026", status: "PAGO", meioPagamento: "PIX" },
  { id: "cf-3", tipo: "DESPESA", categoria: "Split Comissão", descricao: "Repasse Corretor Titular (Lucas Santos)", valor: 21000, dataVencimento: "29/09/2026", status: "PAGO", meioPagamento: "PIX" },
  { id: "cf-4", tipo: "DESPESA", categoria: "Tráfego Pago Meta Ads", descricao: "Fatura Anúncios Campanha Instagram/Facebook Lançamento", valor: 12500, dataVencimento: "05/10/2026", status: "PENDENTE", meioPagamento: "Cartão de Crédito" },
  { id: "cf-5", tipo: "DESPESA", categoria: "Sede & Administrativo", descricao: "Aluguel & Condomínio Sede Aldeota", valor: 8500, dataVencimento: "10/10/2026", status: "PENDENTE", meioPagamento: "Boleto" },
  { id: "cf-6", tipo: "RECEITA", categoria: "Comissão Venda", descricao: "Comissão Venda Apt 201 • Residencial Aldeota Platz", valor: 44000, dataVencimento: "15/10/2026", status: "PENDENTE", meioPagamento: "TED" },
];

export default function FluxoCaixaDREPage() {
  const { setActionMessage } = useCrm();
  const [activeTab, setActiveTab] = useState<"contas" | "dre" | "projecao">("dre");
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
    setActionMessage("Lançamento financeiro adicionado com sucesso!");
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOPBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Módulo ERP • Fluxo de Caixa & DRE</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                Diretoria (RLS Ativo)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Conciliação automática de faturamento de vendas de imóveis, aluguéis de temporada e custos de tráfego.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento Financeiro
        </button>
      </div>

      {/* 2. STATCARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Receitas Liquidadas (Mês)
          </span>
          <span className="text-2xl font-black text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            <CountUpNumber value={totalReceitas} prefix="R$ " decimals={2} />
          </span>
        </div>

        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Despesas & Splits Pagos
          </span>
          <span className="text-2xl font-black text-red-400 flex items-center gap-1">
            <ArrowDownRight className="w-5 h-5 text-red-400" />
            <CountUpNumber value={totalDespesas} prefix="R$ " decimals={2} />
          </span>
        </div>

        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Saldo Operacional em Caixa
          </span>
          <span className="text-2xl font-black text-[#D9BB4C]">
            <CountUpNumber value={saldoLiquido} prefix="R$ " decimals={2} />
          </span>
        </div>
      </div>

      {/* 3. ABAS */}
      <div className="flex border-b border-[#1C2537] bg-[#0A0E17] rounded-2xl p-2 gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab("dre")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === "dre" ? "bg-connect-blue text-white shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          DRE Gerencial em Tempo Real
        </button>

        <button
          onClick={() => setActiveTab("contas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === "contas" ? "bg-connect-blue text-white shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          Contas a Pagar & Receber
        </button>

        <button
          onClick={() => setActiveTab("projecao")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === "projecao" ? "bg-connect-blue text-white shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
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
