"use client";

import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import { SaleItem, SplitItem } from "./types";
import { SaleCalculationsTab } from "./SaleCalculationsTab";
import { SaleParticipantsSection } from "./SaleParticipantsSection";

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sale: SaleItem) => void;
}

export function NewSaleModal({ isOpen, onClose, onSubmit }: NewSaleModalProps) {
  const [activeTab, setActiveTab] = useState<"dados" | "resumo" | "anexos">("dados");

  // Dados e Financeiro
  const [imovel, setImovel] = useState("Villa Platz Beach Residence");
  const [construtora, setConstrutora] = useState("Platz Empreendimentos");
  const [unidade, setUnidade] = useState("403");
  const [cliente, setCliente] = useState("");
  const [vgvValue, setVgvValue] = useState<number>(1050000);
  const [percentualComissao, setPercentualComissao] = useState<number>(5);

  // Participantes
  const [corretor1, setCorretor1] = useState("Lucas Santos");
  const [corretor1Pct, setCorretor1Pct] = useState<number>(40);
  const [hasCorretor2, setHasCorretor2] = useState<boolean>(false);
  const [corretor2, setCorretor2] = useState("Mariana Oliveira");
  const [corretor2Pct, setCorretor2Pct] = useState<number>(20);

  const [gerente, setGerente] = useState("Mariana Oliveira");
  const [gerentePct, setGerentePct] = useState<number>(10);
  const [gestor, setGestor] = useState("Diretoria Platz");
  const [gestorPct, setGestorPct] = useState<number>(10);
  const [captador, setCaptador] = useState("Rafael Mendes");
  const [captadorPct, setCaptadorPct] = useState<number>(10);

  const [descontoCorretor, setDescontoCorretor] = useState<number>(0);
  const [bonusCorretor, setBonusCorretor] = useState<number>(0);

  if (!isOpen) return null;

  // Cálculos determinísticos
  const comissaoTotalBruta = (vgvValue * percentualComissao) / 100;
  const impostoEstimado = comissaoTotalBruta * 0.06;
  const baseLiquida = comissaoTotalBruta - impostoEstimado;

  const valorCorretor1 = (baseLiquida * (corretor1Pct / 100)) - descontoCorretor + bonusCorretor;
  const valorCorretor2 = hasCorretor2 ? (baseLiquida * (corretor2Pct / 100)) : 0;
  const valorGerente = baseLiquida * (gerentePct / 100);
  const valorGestor = baseLiquida * (gestorPct / 100);
  const valorCaptador = baseLiquida * (captadorPct / 100);

  const somaParticipantes =
    valorCorretor1 + valorCorretor2 + valorGerente + valorGestor + valorCaptador;
  const receitaImobiliaria = Math.max(0, comissaoTotalBruta - impostoEstimado - somaParticipantes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const splits: SplitItem[] = [
      {
        id: `sp-imob-${Date.now()}`,
        beneficiario: "Connect Platz Imobiliária",
        categoria: "Imobiliária",
        percentual: Math.round((receitaImobiliaria / comissaoTotalBruta) * 100),
        valor: receitaImobiliaria,
        status: "PAGO",
      },
      {
        id: `sp-c1-${Date.now()}`,
        beneficiario: corretor1,
        categoria: "Corretor 1",
        percentual: corretor1Pct,
        valor: valorCorretor1,
        status: "PENDENTE",
        pix: "lucas.corretor@pix.com",
      },
      ...(hasCorretor2
        ? [
            {
              id: `sp-c2-${Date.now()}`,
              beneficiario: corretor2,
              categoria: "Corretor 2",
              percentual: corretor2Pct,
              valor: valorCorretor2,
              status: "PENDENTE" as const,
              pix: "segundo.corretor@pix.com",
            },
          ]
        : []),
      {
        id: `sp-ger-${Date.now()}`,
        beneficiario: gerente,
        categoria: "Gerente",
        percentual: gerentePct,
        valor: valorGerente,
        status: "PENDENTE",
      },
      {
        id: `sp-cap-${Date.now()}`,
        beneficiario: captador,
        categoria: "Captador",
        percentual: captadorPct,
        valor: valorCaptador,
        status: "PENDENTE",
      },
    ];

    const newSaleItem: SaleItem = {
      id: `sale-${Date.now()}`,
      codigoVenda: `CP-2026-${Math.floor(100 + Math.random() * 900)}`,
      imovelNome: imovel,
      construtora,
      unidadeNumero: unidade,
      compradorNome: cliente || "Comprador Cadastrado",
      corretorTitular: corretor1,
      segundoCorretor: hasCorretor2 ? corretor2 : undefined,
      gerente,
      gestor,
      captador,
      dataVenda: new Date().toLocaleDateString("pt-BR"),
      vgv: vgvValue,
      comissaoTotal: comissaoTotalBruta,
      impostoValor: impostoEstimado,
      impostoPercentual: 6,
      proximoPagamento: "10/10/2026",
      meioPagamento: "TED",
      status: "APROVADA",
      splits,
    };

    onSubmit(newSaleItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#1C2537] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nova Venda & Split de Comissões
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cálculo automatizado conforme Seção 5.8
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-[#1C2537] bg-slate-50 dark:bg-[#080C14] px-4 pt-2">
          {(["dados", "resumo", "anexos"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold capitalize border-b-2 transition-all ${
                activeTab === tab
                  ? "border-connect-blue text-connect-blue"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {tab === "dados"
                ? "Dados e Financeiro"
                : tab === "resumo"
                ? "Resumo e Cálculos"
                : "Anexos"}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* ABA 1: DADOS E FINANCEIRO */}
          {activeTab === "dados" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Empreendimento *
                  </label>
                  <input
                    type="text"
                    value={imovel}
                    onChange={(e) => setImovel(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Construtora
                  </label>
                  <input
                    type="text"
                    value={construtora}
                    onChange={(e) => setConstrutora(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unidade
                  </label>
                  <input
                    type="text"
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Comprador / Cliente *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dr. Roberto Guimarães"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937]">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    VGV da Venda (R$) *
                  </label>
                  <input
                    type="number"
                    value={vgvValue}
                    onChange={(e) => setVgvValue(Number(e.target.value))}
                    required
                    className="w-full bg-white dark:bg-[#0E1624] border border-slate-300 dark:border-[#242C3D] rounded-xl p-2.5 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    % Comissão Bruta Imobiliária *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={percentualComissao}
                    onChange={(e) => setPercentualComissao(Number(e.target.value))}
                    required
                    className="w-full bg-white dark:bg-[#0E1624] border border-slate-300 dark:border-[#242C3D] rounded-xl p-2.5 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Bloco de Participantes Extraído */}
              <SaleParticipantsSection
                corretor1={corretor1}
                setCorretor1={setCorretor1}
                corretor1Pct={corretor1Pct}
                setCorretor1Pct={setCorretor1Pct}
                hasCorretor2={hasCorretor2}
                setHasCorretor2={setHasCorretor2}
                corretor2={corretor2}
                setCorretor2={setCorretor2}
                corretor2Pct={corretor2Pct}
                setCorretor2Pct={setCorretor2Pct}
                gerente={gerente}
                setGerente={setGerente}
                gerentePct={gerentePct}
                captador={captador}
                setCaptador={setCaptador}
                captadorPct={captadorPct}
              />
            </div>
          )}

          {/* ABA 2: RESUMO E CÁLCULOS DETERMINÍSTICOS */}
          {activeTab === "resumo" && (
            <SaleCalculationsTab
              comissaoTotalBruta={comissaoTotalBruta}
              impostoEstimado={impostoEstimado}
              valorCorretor1={valorCorretor1}
              corretor1={corretor1}
              hasCorretor2={hasCorretor2}
              valorCorretor2={valorCorretor2}
              corretor2={corretor2}
              receitaImobiliaria={receitaImobiliaria}
            />
          )}

          {/* ABA 3: ANEXOS */}
          {activeTab === "anexos" && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-300 dark:border-[#242C3D] rounded-2xl p-6 text-center space-y-2">
                <Upload className="w-8 h-8 mx-auto text-slate-400" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Arraste arquivos ou clique para anexar
                </span>
                <p className="text-[10px] text-slate-400">
                  Contrato de compra e venda assinado, espelho da proposta, comprovante de TED/PIX (máx 10 MB cada).
                </p>
              </div>
            </div>
          )}

          {/* Rodapé Fixo */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#1C2537]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161F30] font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white font-extrabold shadow-sm transition-all"
            >
              Cadastrar Fechamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
