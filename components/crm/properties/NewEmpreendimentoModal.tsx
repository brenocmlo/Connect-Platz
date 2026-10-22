"use client";

import React, { useEffect, useState } from "react";
import { Building2, Sparkles, Globe, Loader2 } from "lucide-react";
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

interface NewEmpreendimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Modalidade = "VENDA" | "VERANEIO_TEMPORADA" | "AMBOS";

export function NewEmpreendimentoModal({ isOpen, onClose, onSuccess }: NewEmpreendimentoModalProps) {
  const [nome, setNome] = useState("");
  const [construtora, setConstrutora] = useState("");
  const [modalidade, setModalidade] = useState<Modalidade>("VENDA");
  const [estagioObra, setEstagioObra] = useState("Lançamento");
  const [valorAPartir, setValorAPartir] = useState("");
  const [valorDiaria, setValorDiaria] = useState("");
  const [location, setLocation] = useState(EMPTY_LOCATION);
  const [tipologia, setTipologia] = useState(EMPTY_TIPOLOGIA);
  const [descricao, setDescricao] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [exibirNaLandingPage, setExibirNaLandingPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulário limpo a cada abertura
  useEffect(() => {
    if (!isOpen) return;
    setNome("");
    setConstrutora("");
    setModalidade("VENDA");
    setEstagioObra("Lançamento");
    setValorAPartir("");
    setValorDiaria("");
    setLocation(EMPTY_LOCATION);
    setTipologia(EMPTY_TIPOLOGIA);
    setDescricao("");
    setFotos([]);
    setExibirNaLandingPage(true);
    setError(null);
  }, [isOpen]);

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
          construtora: construtora || null,
          tipoCadastro: "EMPREENDIMENTO",
          exibirNaLandingPage,
          modalidade,
          estagioObra,
          valorVenda: modalidade !== "VERANEIO_TEMPORADA" && valorAPartir !== "" ? Number(valorAPartir) : null,
          valorDiaria: modalidade !== "VENDA" && valorDiaria !== "" ? Number(valorDiaria) : null,
          ...locationPayload(location),
          descricao: descricao || null,
          fotos,
          caracteristicas: tipologiaPayload(tipologia),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erro ao cadastrar empreendimento.");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar empreendimento.");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        Cancelar
      </button>
      <button
        type="submit"
        form="novo-empreendimento-form"
        disabled={loading}
        className="flex items-center gap-1.5 rounded-lg bg-connect-blue px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-connect-blue/20 transition-all hover:scale-[1.02] hover:bg-connect-deep-blue disabled:opacity-60"
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {loading ? "Cadastrando..." : "Cadastrar Empreendimento"}
      </button>
    </div>
  );

  return (
    <PropertyModalShell
      open={isOpen}
      onClose={onClose}
      title="Cadastrar Novo Empreendimento"
      subtitle="Adicione lançamentos e condomínios ao catálogo da imobiliária."
      icon={
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-connect-blue/10 text-connect-blue">
          <Building2 className="h-5 w-5" />
        </div>
      }
      footer={footer}
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form id="novo-empreendimento-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="emp-nome" className={fieldLabel}>Nome do Empreendimento *</label>
            <input id="emp-nome" type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Residencial Jardins" className={fieldInput} />
          </div>
          <div>
            <label htmlFor="emp-construtora" className={fieldLabel}>Construtora / Incorporadora</label>
            <input id="emp-construtora" type="text" value={construtora} onChange={(e) => setConstrutora(e.target.value)} placeholder="Nome da construtora" className={fieldInput} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="emp-modalidade" className={fieldLabel}>Modalidade</label>
            <select id="emp-modalidade" value={modalidade} onChange={(e) => setModalidade(e.target.value as Modalidade)} className={fieldInput}>
              <option value="VENDA">Venda Tradicional</option>
              <option value="VERANEIO_TEMPORADA">Temporada / Veraneio</option>
              <option value="AMBOS">Ambos (Venda & Temporada)</option>
            </select>
          </div>
          <div>
            <label htmlFor="emp-estagio" className={fieldLabel}>Estágio da Obra</label>
            <select id="emp-estagio" value={estagioObra} onChange={(e) => setEstagioObra(e.target.value)} className={fieldInput}>
              <option value="Lançamento">Lançamento</option>
              <option value="Em Obras">Em Obras</option>
              <option value="Pronto para Morar">Pronto para Morar</option>
            </select>
          </div>
          {modalidade !== "VERANEIO_TEMPORADA" && (
            <div>
              <label htmlFor="emp-valor" className={fieldLabel}>Preço a partir de (R$)</label>
              <input id="emp-valor" type="number" min="0" value={valorAPartir} onChange={(e) => setValorAPartir(e.target.value)} placeholder="Ex.: 850000" className={fieldInput} />
            </div>
          )}
          {modalidade !== "VENDA" && (
            <div>
              <label htmlFor="emp-diaria" className={fieldLabel}>Diária base (R$)</label>
              <input id="emp-diaria" type="number" min="0" value={valorDiaria} onChange={(e) => setValorDiaria(e.target.value)} placeholder="Ex.: 950" className={fieldInput} />
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-platz-gold" />
            Tipologia Comercial Padrão
          </span>
          <PropertyTipologiaFields value={tipologia} onChange={setTipologia} />
        </div>

        <PropertyLocationFields idPrefix="emp" value={location} onChange={setLocation} />

        <ImageUploadZone images={fotos} onChange={setFotos} label="Fotos do Empreendimento (Capa e Galeria)" />

        <div>
          <label htmlFor="emp-descricao" className={fieldLabel}>Descrição Comercial</label>
          <textarea id="emp-descricao" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Destaques, proximidades e infraestrutura do condomínio..." className={fieldInput} />
        </div>

        <label htmlFor="emp-landing" className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:border-connect-blue/40">
          <input id="emp-landing" type="checkbox" checked={exibirNaLandingPage} onChange={(e) => setExibirNaLandingPage(e.target.checked)} className="mt-0.5 h-4 w-4 cursor-pointer accent-connect-blue" />
          <span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Globe className="h-3.5 w-3.5 text-connect-blue" /> Exibir na vitrine pública (site)
            </span>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">O empreendimento fica visível para visitantes do portal.</span>
          </span>
        </label>
      </form>
    </PropertyModalShell>
  );
}
