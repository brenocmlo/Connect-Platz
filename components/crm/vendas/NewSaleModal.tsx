"use client";

import React, { useState } from "react";
import { X, Building2, CheckCircle2 } from "lucide-react";
import { SaleItem } from "./types";
import { SaleCalculationsTab } from "./SaleCalculationsTab";
import { SaleParticipantsSection } from "./SaleParticipantsSection";
import { SaleAttachmentsTab, SaleAttachment } from "./SaleAttachmentsTab";
import { initialSampleProperties } from "@/components/crm/properties/sampleProperties";
import { calculateSaleValues, buildSaleSplits } from "./saleSplitHelper";

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sale: SaleItem) => void;
}

export function NewSaleModal({ isOpen, onClose, onSubmit }: NewSaleModalProps) {
  const [activeTab, setActiveTab] = useState<"dados" | "resumo" | "anexos">("dados");

  // Dados do Empreendimento e Construtora
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("prop-1");
  const [imovel, setImovel] = useState("Villa Platz Beach");
  const [construtora, setConstrutora] = useState("Platz Urbanismo");
  const [isCustomProperty, setIsCustomProperty] = useState(false);

  const [unidade, setUnidade] = useState("403 (Torre Coral)");
  const [cliente, setCliente] = useState("");
  const [vgvValue, setVgvValue] = useState<number>(1250000);
  const [percentualComissao, setPercentualComissao] = useState<number>(5);

  // Anexos
  const [attachments, setAttachments] = useState<SaleAttachment[]>([]);

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

  const handlePropertySelect = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    if (propertyId === "custom") {
      setIsCustomProperty(true);
      setImovel("");
      setConstrutora("");
    } else {
      setIsCustomProperty(false);
      const found = initialSampleProperties.find((p) => p.id === propertyId);
      if (found) {
        setImovel(found.nome);
        setConstrutora(found.construtora || "Platz Urbanismo");
        if (found.valorVenda) setVgvValue(found.valorVenda);
      }
    }
  };

  const handleAddAttachments = (fileList: FileList) => {
    const newItems: SaleAttachment[] = Array.from(fileList).map((f) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }));
    setAttachments((prev) => [...prev, ...newItems]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const splitParams = {
    vgvValue,
    percentualComissao,
    corretor1,
    corretor1Pct,
    hasCorretor2,
    corretor2,
    corretor2Pct,
    gerente,
    gerentePct,
    gestor,
    gestorPct,
    captador,
    captadorPct,
    descontoCorretor,
    bonusCorretor,
  };

  const calculated = calculateSaleValues(splitParams);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const splits = buildSaleSplits(splitParams, calculated);

    const newSaleItem: SaleItem = {
      id: `sale-${Date.now()}`,
      codigoVenda: `CP-2026-${Math.floor(100 + Math.random() * 900)}`,
      imovelNome: imovel,
      construtora: construtora || "Platz Urbanismo",
      unidadeNumero: unidade || "Unid. 101",
      compradorNome: cliente || "Comprador Cadastrado",
      corretorTitular: corretor1,
      segundoCorretor: hasCorretor2 ? corretor2 : undefined,
      gerente,
      gestor,
      captador,
      dataVenda: new Date().toLocaleDateString("pt-BR"),
      vgv: vgvValue,
      valorAvaliacao: vgvValue,
      comissaoTotal: calculated.comissaoTotalBruta,
      impostoValor: calculated.impostoEstimado,
      impostoPercentual: 6,
      proximoPagamento: new Date(Date.now() + 15 * 86400000).toLocaleDateString("pt-BR"),
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
              Cálculo automatizado e divisão determinística de fechamento
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
                : `Anexos ${attachments.length > 0 ? `(${attachments.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === "dados" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-connect-blue" />
                    Empreendimento Cadastrado *
                  </label>
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => handlePropertySelect(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-connect-blue"
                  >
                    {initialSampleProperties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} — ({p.construtora || "Platz Urbanismo"})
                      </option>
                    ))}
                    <option value="custom">Outro / Digitar Personalizado...</option>
                  </select>

                  {isCustomProperty && (
                    <input
                      type="text"
                      placeholder="Nome do Empreendimento"
                      value={imovel}
                      onChange={(e) => setImovel(e.target.value)}
                      required
                      className="w-full mt-2 bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Construtora / Incorporadora</span>
                    {!isCustomProperty && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Auto-preenchido
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={construtora}
                    onChange={(e) => setConstrutora(e.target.value)}
                    required
                    placeholder="Nome da Construtora"
                    className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-semibold"
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
                    placeholder="Ex: 403, 1201"
                    className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Comprador / Cliente *
                  </label>
                  <input
                    type="text"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    required
                    placeholder="Ex: Dr. Roberto Guimarães"
                    className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    VGV da Venda (R$) *
                  </label>
                  <input
                    type="number"
                    value={vgvValue}
                    onChange={(e) => setVgvValue(Number(e.target.value))}
                    required
                    min={1000}
                    className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    % Comissão Bruta Imobiliária *
                  </label>
                  <input
                    type="number"
                    value={percentualComissao}
                    onChange={(e) => setPercentualComissao(Number(e.target.value))}
                    required
                    min={1}
                    max={15}
                    className="w-full bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] rounded-xl p-2.5 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

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

          {activeTab === "resumo" && (
            <SaleCalculationsTab
              comissaoTotalBruta={calculated.comissaoTotalBruta}
              impostoEstimado={calculated.impostoEstimado}
              valorCorretor1={calculated.valorCorretor1}
              corretor1={corretor1}
              hasCorretor2={hasCorretor2}
              valorCorretor2={calculated.valorCorretor2}
              corretor2={corretor2}
              receitaImobiliaria={calculated.receitaImobiliaria}
            />
          )}

          {activeTab === "anexos" && (
            <SaleAttachmentsTab
              attachments={attachments}
              onAddAttachments={handleAddAttachments}
              onRemoveAttachment={handleRemoveAttachment}
            />
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
