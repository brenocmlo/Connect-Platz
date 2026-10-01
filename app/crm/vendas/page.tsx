"use client";

import React, { useState } from "react";
import { BadgeDollarSign, Plus } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { SaleCard, SaleItem } from "@/components/crm/vendas/SaleCard";
import { NewSaleModal } from "@/components/crm/vendas/NewSaleModal";

const initialSales: SaleItem[] = [
  {
    id: "sale-1",
    codigoVenda: "CP-2026-089",
    imovelNome: "Villa Platz Beach Residence",
    unidadeNumero: "403 (Torre Coral)",
    compradorNome: "Dr. Marcelo Cavalcante",
    corretorTitular: "Lucas Santos",
    dataVenda: "28/09/2026",
    vgv: 1050000,
    valorAvaliacao: 1100000,
    comissaoTotal: 52500,
    meioPagamento: "TED",
    splits: [
      { id: "s-1", beneficiario: "Connect Platz Imobiliária", categoria: "Imobiliária", percentual: 40, valor: 21000, status: "PAGO" },
      { id: "s-2", beneficiario: "Lucas Santos", categoria: "Corretor Titular", percentual: 40, valor: 21000, status: "PAGO", pix: "lucas.corretor@pix.com" },
      { id: "s-3", beneficiario: "Mariana Oliveira", categoria: "Gerente de Equipe", percentual: 10, valor: 5250, status: "PAGO", pix: "mariana.gerente@pix.com" },
      { id: "s-4", beneficiario: "Rafael Mendes", categoria: "Captação do Imóvel", percentual: 10, valor: 5250, status: "PENDENTE", pix: "rafael.captador@pix.com" },
    ],
  },
  {
    id: "sale-2",
    codigoVenda: "CP-2026-090",
    imovelNome: "Residencial Aldeota Platz",
    unidadeNumero: "201",
    compradorNome: "Roberto Simões",
    corretorTitular: "Mariana Oliveira",
    dataVenda: "29/09/2026",
    vgv: 880000,
    valorAvaliacao: 900000,
    comissaoTotal: 44000,
    meioPagamento: "PIX",
    splits: [
      { id: "s-5", beneficiario: "Connect Platz Imobiliária", categoria: "Imobiliária", percentual: 45, valor: 19800, status: "PAGO" },
      { id: "s-6", beneficiario: "Mariana Oliveira", categoria: "Corretor Titular", percentual: 45, valor: 19800, status: "PENDENTE", pix: "mariana.pix@banco.com" },
      { id: "s-7", beneficiario: "Imobiliária Parceira [UFCM]", categoria: "Parceiro Externo", percentual: 10, valor: 4400, status: "PENDENTE", pix: "financeiro@ufcm.com.br" },
    ],
  },
];

export default function VendasComissoesPage() {
  const { setActionMessage } = useCrm();
  const [sales, setSales] = useState<SaleItem[]>(initialSales);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>("sale-1");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBaixaComissao = (saleId: string, splitId: string) => {
    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId
          ? {
              ...s,
              splits: s.splits.map((sp) => (sp.id === splitId ? { ...sp, status: "PAGO" as const } : sp)),
            }
          : s
      )
    );
    setActionMessage("Baixa financeira de comissão confirmada com sucesso!");
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleAddSale = (newSale: SaleItem) => {
    setSales([newSale, ...sales]);
    setActionMessage("Venda cadastrada e splits gerados com sucesso!");
    setTimeout(() => setActionMessage(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOPBAR & KPI CARDS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#D9BB4C]/15 border border-[#D9BB4C]/30 text-[#D9BB4C]">
            <BadgeDollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Módulo de Vendas & Split de Comissões</h2>
            <p className="text-xs text-slate-400">
              Cálculo automatizado de divisões entre imobiliária, corretores, gerentes e parceiros externos [UFCM].
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#D9BB4C] hover:bg-[#C5A73D] text-black font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#D9BB4C]/15 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Fechamento de Venda
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            VGV Comercial Faturado
          </span>
          <span className="text-2xl font-black text-[#D9BB4C]">
            <CountUpNumber value={1930000} prefix="R$ " decimals={2} />
          </span>
        </div>

        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Comissões Já Liquidadas
          </span>
          <span className="text-2xl font-black text-emerald-400">
            <CountUpNumber value={72250} prefix="R$ " decimals={2} />
          </span>
        </div>

        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Comissões Pendentes (A Liberar)
          </span>
          <span className="text-2xl font-black text-amber-400">
            <CountUpNumber value={24250} prefix="R$ " decimals={2} />
          </span>
        </div>
      </div>

      {/* 2. LISTAGEM DE CARDS DE VENDA MODULARIZADOS */}
      <div className="space-y-4">
        {sales.map((sale) => (
          <SaleCard
            key={sale.id}
            sale={sale}
            isExpanded={expandedSaleId === sale.id}
            onToggleExpand={() => setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)}
            onBaixaComissao={handleBaixaComissao}
          />
        ))}
      </div>

      {/* 3. MODAL DE CADASTRO DE VENDA */}
      <NewSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSale}
      />
    </div>
  );
}
