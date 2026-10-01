"use client";

import React, { useState } from "react";
import { Building2, Globe, Sparkles, X, CheckCircle2 } from "lucide-react";
import { ImageUploadZone } from "./ImageUploadZone";

interface NewEmpreendimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewEmpreendimentoModal({
  isOpen,
  onClose,
  onSuccess,
}: NewEmpreendimentoModalProps) {
  const [nome, setNome] = useState("");
  const [estagioObra, setEstagioObra] = useState("Lançamento");
  const [valorAPartir, setValorAPartir] = useState("");
  const [cidade, setCidade] = useState("Fortaleza");
  const [bairro, setBairro] = useState("");
  const [endereco, setEndereco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [exibirNaLandingPage, setExibirNaLandingPage] = useState(true);

  // Configuração rápida de unidades e andares para o espelho
  const [nomeBloco, setNomeBloco] = useState("Torre A");
  const [andares, setAndares] = useState("4");
  const [unidadesPorAndar, setUnidadesPorAndar] = useState("4");
  const [areaBase, setAreaBase] = useState("120");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          tipoCadastro: "EMPREENDIMENTO",
          exibirNaLandingPage,
          modalidade: "VENDA",
          estagioObra,
          valorVenda: valorAPartir ? Number(valorAPartir) : 800000,
          cidade,
          bairro,
          endereco,
          descricao,
          fotos: fotos.length > 0 ? fotos : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"],
          caracteristicas: { area_m2: Number(areaBase) },
          unidadesConfig: {
            blocos: [nomeBloco],
            andares: Number(andares),
            unidadesPorAndar: Number(unidadesPorAndar),
            valorBase: valorAPartir ? Number(valorAPartir) : 800000,
            areaBase: Number(areaBase),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao cadastrar empreendimento");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro de conexão ao salvar empreendimento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-connect-blue/20 flex items-center justify-center text-connect-blue">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Novo Empreendimento & Espelho</h2>
            <p className="text-xs text-slate-400">
              Cadastre o lançamento com geração automática da matriz de unidades e andares.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* SELEÇÃO PRINCIPAL: EXIBIR NA LANDING PAGE */}
          <div className="p-4 rounded-2xl bg-[#0D1424] border-2 border-[#1266C7]/50 flex items-start gap-3">
            <input
              type="checkbox"
              id="exibirLandingEmp"
              checked={exibirNaLandingPage}
              onChange={(e) => setExibirNaLandingPage(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-connect-blue bg-[#080C14] border-slate-700 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="exibirLandingEmp" className="cursor-pointer">
              <span className="font-extrabold text-white flex items-center gap-1.5 text-xs">
                <Globe className="w-3.5 h-3.5 text-[#D9BB4C]" />
                Exibir este Empreendimento na Landing Page (Site Público)
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Ao manter marcado, este empreendimento aparecerá na vitrine da página inicial para receber leads e propostas de interessados.
              </p>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">Nome do Empreendimento *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Villa Platz Beach Residence, Platinum Aldeota"
                className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-3 text-white focus:outline-none focus:border-connect-blue"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Estágio da Obra</label>
              <select
                value={estagioObra}
                onChange={(e) => setEstagioObra(e.target.value)}
                className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-3 text-white focus:outline-none"
              >
                <option value="Lançamento">Lançamento</option>
                <option value="Em Obras">Em Obras</option>
                <option value="Pronto para Morar">Pronto para Morar</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Valor a Partir de (R$)</label>
              <input
                type="number"
                value={valorAPartir}
                onChange={(e) => setValorAPartir(e.target.value)}
                placeholder="Ex: 850000"
                className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-3 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Cidade</label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Fortaleza, Aquiraz, Eusébio..."
                className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-3 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Bairro / Região</label>
              <input
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Meireles, Porto das Dunas, Aldeota..."
                className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-3 text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Endereço Completo</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Av. Beira Mar, 1200..."
              className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-3 text-white focus:outline-none"
            />
          </div>

          {/* UPLOAD DE FOTOS ANEXADAS */}
          <ImageUploadZone
            images={fotos}
            onChange={setFotos}
            label="Fotos Anexadas do Empreendimento (Capa e Galeria)"
          />

          {/* CONFIGURAÇÃO DO ESPELHO DE VENDAS */}
          <div className="p-4 rounded-2xl bg-[#080C14] border border-[#1C2537] space-y-3">
            <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D9BB4C]" />
              Estrutura do Espelho de Vendas (Geração Automática de Unidades)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nome do Bloco</label>
                <input
                  type="text"
                  value={nomeBloco}
                  onChange={(e) => setNomeBloco(e.target.value)}
                  className="w-full bg-[#0A0E17] border border-[#1C2537] rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Qtd. Andares</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={andares}
                  onChange={(e) => setAndares(e.target.value)}
                  className="w-full bg-[#0A0E17] border border-[#1C2537] rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Unid. / Andar</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={unidadesPorAndar}
                  onChange={(e) => setUnidadesPorAndar(e.target.value)}
                  className="w-full bg-[#0A0E17] border border-[#1C2537] rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Área Média (m²)</label>
                <input
                  type="number"
                  value={areaBase}
                  onChange={(e) => setAreaBase(e.target.value)}
                  className="w-full bg-[#0A0E17] border border-[#1C2537] rounded-xl p-2.5 text-white"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Total gerado: {Number(andares) * Number(unidadesPorAndar)} unidades disponíveis na matriz interativa.
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Descrição Comercial</label>
            <textarea
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Destaques, proximidades e infraestrutura do condomínio..."
              className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-3 text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#111827] text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-connect-blue hover:bg-[#0D478F] text-white font-extrabold shadow-lg transition-all"
            >
              {loading ? "Cadastrando..." : "Cadastrar Empreendimento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
