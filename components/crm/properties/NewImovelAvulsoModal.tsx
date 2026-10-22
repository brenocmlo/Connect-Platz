"use client";

import React, { useEffect, useState } from "react";
import { Home, Globe, Loader2 } from "lucide-react";
import { ImageUploadZone } from "./ImageUploadZone";
import { PropertyModalShell, fieldInput, fieldLabel } from "./PropertyModalShell";
import {
  EMPTY_LOCATION,
  EMPTY_TIPOLOGIA,
  PropertyLocationFields,
  PropertyTipologiaFields,
  locationPayload,
  tipologiaPayload,
} from "./PropertyLocationFields";

interface NewImovelAvulsoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DIFERENCIAIS = ["Piscina Privativa", "Vista Mar", "Mobiliado", "Varanda Gourmet", "Pé na Areia", "Churrasqueira", "Portaria 24h"];

export function NewImovelAvulsoModal({ isOpen, onClose, onSuccess }: NewImovelAvulsoModalProps) {
  const [nome, setNome] = useState("");
  const [modalidade, setModalidade] = useState<"VENDA" | "VERANEIO_TEMPORADA">("VENDA");
  const [valorVenda, setValorVenda] = useState("");
  const [valorDiaria, setValorDiaria] = useState("");
  const [taxaLimpeza, setTaxaLimpeza] = useState("");
  const [location, setLocation] = useState(EMPTY_LOCATION);
  const [tipologia, setTipologia] = useState(EMPTY_TIPOLOGIA);
  const [fotos, setFotos] = useState<string[]>([]);
  const [descricao, setDescricao] = useState("");
  const [exibirNaLandingPage, setExibirNaLandingPage] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setNome("");
    setModalidade("VENDA");
    setValorVenda("");
    setValorDiaria("");
    setTaxaLimpeza("");
    setLocation(EMPTY_LOCATION);
    setTipologia(EMPTY_TIPOLOGIA);
    setFotos([]);
    setDescricao("");
    setExibirNaLandingPage(true);
    setSelectedTags([]);
    setError(null);
  }, [isOpen]);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const temporada = modalidade === "VERANEIO_TEMPORADA";
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
          valorVenda: !temporada && valorVenda !== "" ? Number(valorVenda) : null,
          valorDiaria: temporada && valorDiaria !== "" ? Number(valorDiaria) : null,
          taxaLimpeza: temporada && taxaLimpeza !== "" ? Number(taxaLimpeza) : null,
          ...locationPayload(location),
          descricao: descricao || null,
          fotos,
          caracteristicas: tipologiaPayload(tipologia),
          diferenciais: selectedTags,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erro ao cadastrar imóvel avulso.");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar imóvel.");
    } finally {
      setLoading(false);
    }
  };

  const modalidadeBtn = (active: boolean) =>
    `rounded-lg border p-2.5 text-center text-xs font-bold transition-all ${
      active ? "border-connect-blue bg-connect-blue text-white shadow-md shadow-connect-blue/20" : "border-border bg-background text-muted-foreground hover:border-connect-blue/40 hover:text-foreground"
    }`;

  const footer = (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        Cancelar
      </button>
      <button
        type="submit"
        form="novo-avulso-form"
        disabled={loading}
        className="flex items-center gap-1.5 rounded-lg bg-connect-blue px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-connect-blue/20 transition-all hover:scale-[1.02] hover:bg-connect-deep-blue disabled:opacity-60"
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {loading ? "Cadastrando..." : "Cadastrar Imóvel Avulso"}
      </button>
    </div>
  );

  return (
    <PropertyModalShell
      open={isOpen}
      onClose={onClose}
      title="Novo Imóvel Avulso"
      subtitle="Cadastre apartamentos, casas de rua ou imóveis de temporada individuais."
      icon={
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-platz-gold/15 text-amber-600 dark:text-platz-gold">
          <Home className="h-5 w-5" />
        </div>
      }
      footer={footer}
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-400">{error}</div>
      )}

      <form id="novo-avulso-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setModalidade("VENDA")} className={modalidadeBtn(modalidade === "VENDA")}>
            Imóvel para Venda
          </button>
          <button type="button" onClick={() => setModalidade("VERANEIO_TEMPORADA")} className={modalidadeBtn(modalidade === "VERANEIO_TEMPORADA")}>
            Temporada / Veraneio
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="av-nome" className={fieldLabel}>Título do Imóvel *</label>
            <input id="av-nome" type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Cobertura Duplex 3 Suítes" className={fieldInput} />
          </div>
          {modalidade === "VENDA" ? (
            <div>
              <label htmlFor="av-valor" className={fieldLabel}>Valor de Venda (R$) *</label>
              <input id="av-valor" type="number" min="0" required value={valorVenda} onChange={(e) => setValorVenda(e.target.value)} placeholder="Ex.: 750000" className={fieldInput} />
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="av-diaria" className={fieldLabel}>Valor da Diária (R$) *</label>
                <input id="av-diaria" type="number" min="0" required value={valorDiaria} onChange={(e) => setValorDiaria(e.target.value)} placeholder="Ex.: 850" className={fieldInput} />
              </div>
              <div>
                <label htmlFor="av-limpeza" className={fieldLabel}>Taxa de Limpeza (R$)</label>
                <input id="av-limpeza" type="number" min="0" value={taxaLimpeza} onChange={(e) => setTaxaLimpeza(e.target.value)} className={fieldInput} />
              </div>
            </>
          )}
        </div>

        <PropertyLocationFields idPrefix="av" value={location} onChange={setLocation} />

        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <PropertyTipologiaFields value={tipologia} onChange={setTipologia} />
        </div>

        <div>
          <span className={fieldLabel}>Diferenciais</span>
          <div className="flex flex-wrap gap-1.5">
            {DIFERENCIAIS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  aria-pressed={active}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    active ? "border-connect-blue bg-connect-blue/10 text-connect-blue" : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active ? "✓ " : "+ "}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <ImageUploadZone images={fotos} onChange={setFotos} label="Fotos do Imóvel (Capa e Galeria)" />

        <div>
          <label htmlFor="av-descricao" className={fieldLabel}>Descrição</label>
          <textarea id="av-descricao" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} className={fieldInput} />
        </div>

        <label htmlFor="av-landing" className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:border-connect-blue/40">
          <input id="av-landing" type="checkbox" checked={exibirNaLandingPage} onChange={(e) => setExibirNaLandingPage(e.target.checked)} className="mt-0.5 h-4 w-4 cursor-pointer accent-connect-blue" />
          <span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Globe className="h-3.5 w-3.5 text-connect-blue" /> Exibir na vitrine pública (site)
            </span>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">O imóvel fica visível para visitantes do portal.</span>
          </span>
        </label>
      </form>
    </PropertyModalShell>
  );
}
