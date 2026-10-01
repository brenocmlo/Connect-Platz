"use client";

import React, { useState } from "react";
import { SaleItem } from "./SaleCard";

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sale: SaleItem) => void;
}

export function NewSaleModal({ isOpen, onClose, onSubmit }: NewSaleModalProps) {
  const [imovel, setImovel] = useState("Villa Platz Beach Residence");
  const [unidade, setUnidade] = useState("302");
  const [cliente, setCliente] = useState("");
  const [corretor, setCorretor] = useState("Lucas Santos");
  const [vgvValue, setVgvValue] = useState<number>(920000);
  const [avaliacaoValue, setAvaliacaoValue] = useState<number>(950000);
  const [percentualComissao, setPercentualComissao] = useState<number>(5);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalComissao = (vgvValue * percentualComissao) / 100;
    const newSaleItem: SaleItem = {
      id: `sale-${Date.now()}`,
      codigoVenda: `CP-2026-${Math.floor(100 + Math.random() * 900)}`,
      imovelNome: imovel,
      unidadeNumero: unidade,
      compradorNome: cliente || "Comprador Cadastrado",
      corretorTitular: corretor,
      dataVenda: new Date().toLocaleDateString("pt-BR"),
      vgv: vgvValue,
      valorAvaliacao: avaliacaoValue,
      comissaoTotal: totalComissao,
      meioPagamento: "TED",
      splits: [
        { id: `sp-1-${Date.now()}`, beneficiario: "Connect Platz Imobiliária", categoria: "Imobiliária", percentual: 45, valor: totalComissao * 0.45, status: "PAGO" },
        { id: `sp-2-${Date.now()}`, beneficiario: corretor, categoria: "Corretor Titular", percentual: 45, valor: totalComissao * 0.45, status: "PENDENTE", pix: "pix@corretor.com" },
        { id: `sp-3-${Date.now()}`, beneficiario: "Gerência Comercial", categoria: "Gerente", percentual: 10, valor: totalComissao * 0.1, status: "PENDENTE" },
      ],
    };
    onSubmit(newSaleItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white">Registrar Fechamento de Venda</h3>
        <p className="text-xs text-slate-400">
          O fechamento calcula os splits e lança automaticamente as contas a receber e comissões no ERP.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Empreendimento</label>
            <input
              type="text"
              value={imovel}
              onChange={(e) => setImovel(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Unidade</label>
              <input
                type="text"
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nome do Comprador</label>
              <input
                type="text"
                required
                placeholder="Ex: Ana Paula Ribeiro"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">VGV Comercial (R$)</label>
              <input
                type="number"
                value={vgvValue}
                onChange={(e) => setVgvValue(Number(e.target.value))}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Avaliação Bancária (R$)</label>
              <input
                type="number"
                value={avaliacaoValue}
                onChange={(e) => setAvaliacaoValue(Number(e.target.value))}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Comissão (%)</label>
              <input
                type="number"
                value={percentualComissao}
                onChange={(e) => setPercentualComissao(Number(e.target.value))}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#111827] text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#D9BB4C] text-black font-black shadow-md"
            >
              Salvar Fechamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
