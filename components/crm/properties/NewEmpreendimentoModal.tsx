"use client";

import React, { useEffect, useState } from "react";
import { Building2, Sparkles, Globe, Loader2 } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import {
  getAllowedPropertyModalities,
  getDefaultPropertyModalidade,
  isModalidadeAllowedForRole,
  PropertyModalidadeOption,
} from "@/lib/domain/properties/modalityScope";
import { ImageUploadZone } from "./ImageUploadZone";
import {
  PropertyModalShell,
  SelectWithChevron,
  fieldInput,
  fieldLabel,
  fieldSelect,
  fieldTextarea,
} from "./PropertyModalShell";
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

export function NewEmpreendimentoModal({ isOpen, onClose, onSuccess }: NewEmpreendimentoModalProps) {
  const { user } = useCrm();
  const allowedModalities = getAllowedPropertyModalities(user?.role, true);
  const defaultModalidade = getDefaultPropertyModalidade(user?.role);

  const [nome, setNome] = useState("");
  const [construtora, setConstrutora] = useState("");
  const [modalidade, setModalidade] = useState<PropertyModalidadeOption>(defaultModalidade);
  const [estagioObra, setEstagioObra] = useState("Lançamento");
  const [valorAPartir, setValorAPartir] = useState("");
  const [valorDiaria, setValorDiaria] = useState("");
  const [valorAluguel, setValorAluguel] = useState("");
  const [valorRepasse, setValorRepasse] = useState("");
  const [saldoDevedor, setSaldoDevedor] = useState("");
  const [location, setLocation] = useState(EMPTY_LOCATION);
  const [tipologia, setTipologia] = useState(EMPTY_TIPOLOGIA);
  const [descricao, setDescricao] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [exibirNaLandingPage, setExibirNaLandingPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulário limpo a cada abertura com modalidade padrão da vertical do usuário
  useEffect(() => {
    if (!isOpen) return;
    setNome("");
    setConstrutora("");
    setModalidade(getDefaultPropertyModalidade(user?.role));
    setEstagioObra("Lançamento");
    setValorAPartir("");
    setValorDiaria("");
    setValorAluguel("");
    setValorRepasse("");
    setSaldoDevedor("");
    setLocation(EMPTY_LOCATION);
    setTipologia(EMPTY_TIPOLOGIA);
    setDescricao("");
    setFotos([]);
    setExibirNaLandingPage(true);
    setError(null);
  }, [isOpen]);

  // Ajusta apenas a modalidade caso o perfil carregue após a abertura do modal
  useEffect(() => {
    if (!isOpen) return;
    if (!isModalidadeAllowedForRole(modalidade, user?.role, true)) {
      setModalidade(defaultModalidade);
    }
  }, [isOpen, user?.role, modalidade, defaultModalidade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const vVenda =
        modalidade === "REPASSE" && valorRepasse !== ""
          ? Number(valorRepasse) + Number(saldoDevedor || 0)
          : modalidade !== "VERANEIO_TEMPORADA" && modalidade !== "LOCACAO_ANUAL" && valorAPartir !== ""
          ? Number(valorAPartir)
          : null;

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
          valorVenda: vVenda,
          valorDiaria: (modalidade === "VERANEIO_TEMPORADA" || modalidade === "AMBOS") && valorDiaria !== "" ? Number(valorDiaria) : null,
          valorAluguel: (modalidade === "LOCACAO_ANUAL" || modalidade === "AMBOS") && valorAluguel !== "" ? Number(valorAluguel) : null,
          valorRepasse: modalidade === "REPASSE" && valorRepasse !== "" ? Number(valorRepasse) : null,
          saldoDevedor: modalidade === "REPASSE" && saldoDevedor !== "" ? Number(saldoDevedor) : null,
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

        <div className={`grid grid-cols-1 gap-3 ${modalidade === "AMBOS" || modalidade === "REPASSE" ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          <div>
            <label htmlFor="emp-modalidade" className={fieldLabel}>Modalidade</label>
            <SelectWithChevron>
              <select
                id="emp-modalidade"
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value as PropertyModalidadeOption)}
                className={fieldSelect}
              >
                {allowedModalities.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </SelectWithChevron>
          </div>
          <div>
            <label htmlFor="emp-estagio" className={fieldLabel}>Estágio da Obra</label>
            <SelectWithChevron>
              <select id="emp-estagio" value={estagioObra} onChange={(e) => setEstagioObra(e.target.value)} className={fieldSelect}>
                <option value="Lançamento">Lançamento</option>
                <option value="Em Obras">Em Obras</option>
                <option value="Pronto para Morar">Pronto para Morar</option>
              </select>
            </SelectWithChevron>
          </div>
          {modalidade === "VENDA" && (
            <div>
              <label htmlFor="emp-valor" className={fieldLabel}>Preço a partir de (R$)</label>
              <input id="emp-valor" type="number" min="0" value={valorAPartir} onChange={(e) => setValorAPartir(e.target.value)} placeholder="Ex.: 850000" className={fieldInput} />
            </div>
          )}
          {modalidade === "LOCACAO_ANUAL" && (
            <div>
              <label htmlFor="emp-aluguel" className={fieldLabel}>Aluguel a partir de (R$/mês)</label>
              <input id="emp-aluguel" type="number" min="0" value={valorAluguel} onChange={(e) => setValorAluguel(e.target.value)} placeholder="Ex.: 3200" className={fieldInput} />
            </div>
          )}
          {modalidade === "VERANEIO_TEMPORADA" && (
            <div>
              <label htmlFor="emp-diaria" className={fieldLabel}>Diária base (R$)</label>
              <input id="emp-diaria" type="number" min="0" value={valorDiaria} onChange={(e) => setValorDiaria(e.target.value)} placeholder="Ex.: 950" className={fieldInput} />
            </div>
          )}
          {modalidade === "AMBOS" && (
            <>
              <div>
                <label htmlFor="emp-valor" className={fieldLabel}>Preço a partir de (R$)</label>
                <input id="emp-valor" type="number" min="0" value={valorAPartir} onChange={(e) => setValorAPartir(e.target.value)} placeholder="Ex.: 850000" className={fieldInput} />
              </div>
              <div>
                <label htmlFor="emp-diaria" className={fieldLabel}>Diária base (R$)</label>
                <input id="emp-diaria" type="number" min="0" value={valorDiaria} onChange={(e) => setValorDiaria(e.target.value)} placeholder="Ex.: 950" className={fieldInput} />
              </div>
            </>
          )}
          {modalidade === "REPASSE" && (
            <>
              <div>
                <label htmlFor="emp-repasse" className={fieldLabel}>Repasse / Ágio a partir de (R$)</label>
                <input id="emp-repasse" type="number" min="0" value={valorRepasse} onChange={(e) => setValorRepasse(e.target.value)} placeholder="Ex.: 85000" className={fieldInput} />
              </div>
              <div>
                <label htmlFor="emp-saldo" className={fieldLabel}>Saldo Devedor a Assumir (R$)</label>
                <input id="emp-saldo" type="number" min="0" value={saldoDevedor} onChange={(e) => setSaldoDevedor(e.target.value)} placeholder="Ex.: 220000" className={fieldInput} />
              </div>
            </>
          )}
        </div>

        <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-platz-gold" />
            Tipologia Comercial Padrão
          </span>
          <PropertyTipologiaFields idPrefix="emp" value={tipologia} onChange={setTipologia} />
        </div>

        <PropertyLocationFields idPrefix="emp" value={location} onChange={setLocation} />

        <ImageUploadZone images={fotos} onChange={setFotos} label="Fotos do Empreendimento (Capa e Galeria)" />

        <div>
          <label htmlFor="emp-descricao" className={fieldLabel}>Descrição Comercial</label>
          <textarea id="emp-descricao" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Destaques, proximidades e infraestrutura do condomínio..." className={fieldTextarea} />
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
