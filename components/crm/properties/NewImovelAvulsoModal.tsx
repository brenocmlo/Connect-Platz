"use client";

import React, { useState } from "react";
import { Home, Globe, X } from "lucide-react";
import { ImageUploadZone } from "./ImageUploadZone";

interface NewImovelAvulsoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_TAGS = ["Piscina Privativa", "Vista Mar", "Mobiliado", "Varanda Gourmet", "Pé na Areia", "Churrasqueira", "Portaria 24h"];

export function NewImovelAvulsoModal({ isOpen, onClose, onSuccess }: NewImovelAvulsoModalProps) {
  const [nome, setNome] = useState("");
  const [modalidade, setModalidade] = useState<"VENDA" | "VERANEIO_TEMPORADA">("VENDA");
  const [valorVenda, setValorVenda] = useState("");
  const [valorDiaria, setValorDiaria] = useState("");
  const [taxaLimpeza, setTaxaLimpeza] = useState("180");
  const [cidade, setCidade] = useState("Fortaleza");
  const [bairro, setBairro] = useState("");
  const [endereco, setEndereco] = useState("");
  const [areaM2, setAreaM2] = useState("95");
  const [quartos, setQuartos] = useState("3");
  const [suites, setSuites] = useState("2");
  const [vagas, setVagas] = useState("2");
  const [fotos, setFotos] = useState<string[]>([]);
  const [descricao, setDescricao] = useState("");
  const [exibirNaLandingPage, setExibirNaLandingPage] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Varanda Gourmet", "Portaria 24h"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

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
          tipoCadastro: "AVULSO",
          exibirNaLandingPage,
          modalidade,
          estagioObra: "Pronto para Morar",
          valorVenda: modalidade === "VENDA" ? Number(valorVenda) : null,
          valorDiaria: modalidade === "VERANEIO_TEMPORADA" ? Number(valorDiaria) : null,
          taxaLimpeza: modalidade === "VERANEIO_TEMPORADA" ? Number(taxaLimpeza) : null,
          cidade,
          bairro,
          endereco,
          descricao,
          fotos: fotos.length > 0 ? fotos : ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"],
          caracteristicas: { area_m2: Number(areaM2), quartos: Number(quartos), suites: Number(suites), vagas: Number(vagas) },
          diferenciais: selectedTags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao cadastrar imóvel avulso");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar imóvel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#D9BB4C]/20 flex items-center justify-center text-[#D9BB4C]">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Novo Imóvel Avulso</h2>
            <p className="text-xs text-slate-400">Cadastre apartamentos, casas de rua ou veraneio individuais.</p>
          </div>
        </div>

        {error && <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* SELEÇÃO PRINCIPAL: EXIBIR NA LANDING PAGE */}
          <div className="p-4 rounded-2xl bg-[#0D1424] border-2 border-[#D9BB4C]/50 flex items-start gap-3">
            <input
              type="checkbox"
              id="exibirLandingAvulso"
              checked={exibirNaLandingPage}
              onChange={(e) => setExibirNaLandingPage(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#D9BB4C] bg-[#080C14] border-slate-700 cursor-pointer"
            />
            <label htmlFor="exibirLandingAvulso" className="cursor-pointer">
              <span className="font-extrabold text-white flex items-center gap-1.5 text-xs">
                <Globe className="w-3.5 h-3.5 text-[#D9BB4C]" /> Exibir este Imóvel na Landing Page (Site Público)
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">Ficará visível imediatamente para visitantes na vitrine pública do portal.</p>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setModalidade("VENDA")}
              className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                modalidade === "VENDA" ? "bg-connect-blue text-white border-connect-blue shadow-md" : "bg-[#080C14] border-[#1C2537] text-slate-400"
              }`}
            >
              Imóvel para Venda
            </button>
            <button
              type="button"
              onClick={() => setModalidade("VERANEIO_TEMPORADA")}
              className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                modalidade === "VERANEIO_TEMPORADA" ? "bg-[#D9BB4C] text-black border-[#D9BB4C] shadow-md font-extrabold" : "bg-[#080C14] border-[#1C2537] text-slate-400"
              }`}
            >
              Aluguel de Temporada / Veraneio
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">Título do Imóvel *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Cobertura Duplex 3 Suítes Beira Mar"
                className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-2.5 text-white focus:outline-none"
              />
            </div>

            {modalidade === "VENDA" ? (
              <div>
                <label className="block text-slate-300 font-bold mb-1">Valor de Venda (R$) *</label>
                <input
                  type="number"
                  required
                  value={valorVenda}
                  onChange={(e) => setValorVenda(e.target.value)}
                  placeholder="Ex: 750000"
                  className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Valor da Diária (R$) *</label>
                  <input
                    type="number"
                    required
                    value={valorDiaria}
                    onChange={(e) => setValorDiaria(e.target.value)}
                    placeholder="Ex: 850"
                    className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Taxa Limpeza (R$)</label>
                  <input
                    type="number"
                    value={taxaLimpeza}
                    onChange={(e) => setTaxaLimpeza(e.target.value)}
                    className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-300 font-bold mb-1">Cidade</label>
              <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Bairro</label>
              <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Meireles, Mucuripe..." className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Endereço</label>
              <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua / Av..." className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 bg-[#080C14] border border-[#1C2537] p-2.5 rounded-xl">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Área (m²)</label>
              <input type="number" value={areaM2} onChange={(e) => setAreaM2(e.target.value)} className="w-full bg-[#0A0E17] border border-[#1C2537] rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Quartos</label>
              <input type="number" value={quartos} onChange={(e) => setQuartos(e.target.value)} className="w-full bg-[#0A0E17] border border-[#1C2537] rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Suítes</label>
              <input type="number" value={suites} onChange={(e) => setSuites(e.target.value)} className="w-full bg-[#0A0E17] border border-[#1C2537] rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Vagas</label>
              <input type="number" value={vagas} onChange={(e) => setVagas(e.target.value)} className="w-full bg-[#0A0E17] border border-[#1C2537] rounded-lg p-2 text-white" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Diferenciais</label>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    selectedTags.includes(tag) ? "bg-connect-blue/30 text-blue-300 border-connect-blue" : "bg-[#080C14] text-slate-400 border-[#1C2537]"
                  }`}
                >
                  {selectedTags.includes(tag) ? "✓ " : "+ "}{tag}
                </button>
              ))}
            </div>
          </div>

          {/* UPLOAD DE FOTOS ANEXADAS */}
          <ImageUploadZone
            images={fotos}
            onChange={setFotos}
            label="Fotos Anexadas do Imóvel (Capa e Galeria)"
          />

          <div>
            <label className="block text-slate-300 font-bold mb-1">Descrição</label>
            <textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full bg-[#080C14] border border-[#1C2537] rounded-xl p-2.5 text-white" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#111827] text-slate-300 font-semibold">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-[#D9BB4C] text-black font-extrabold shadow-md">
              {loading ? "Cadastrando..." : "Cadastrar Imóvel Avulso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
