"use client";

import React, { useState, useMemo, useEffect } from "react";
import { X, Building2, User, KeyRound, AlertCircle, ShieldCheck } from "lucide-react";
import { useCrmLookups } from "@/components/crm/agenda/useCrmLookups";
import { NumericInput } from "@/components/crm/primitives/NumericInput";
import { RentalContractItem } from "./RentalContractsList";

interface NewRentalContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (contract: RentalContractItem) => void;
}

const GARANTIAS = [
  { id: "CAUCAO", label: "Caução (Depósito / Título)" },
  { id: "FIADOR", label: "Fiador com Imóvel" },
  { id: "SEGURO_FIANCA", label: "Seguro-Fiança Locatícia" },
  { id: "TITULO_CAPITALIZACAO", label: "Título de Capitalização" },
];

export function NewRentalContractModal({
  isOpen,
  onClose,
  onCreated,
}: NewRentalContractModalProps) {
  const { properties, leads, loading } = useCrmLookups({
    enabled: isOpen,
    properties: true,
    leads: true,
  });

  const rentalProperties = useMemo(() => {
    const filtered = properties.filter(
      (p) =>
        p.modalidade === "LOCACAO_ANUAL" ||
        p.modalidade === "AMBOS" ||
        Boolean((p as any).valorAluguel)
    );
    return filtered.length > 0 ? filtered : properties;
  }, [properties]);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [propertyId, setPropertyId] = useState("");
  const [leadId, setLeadId] = useState("");
  const [valorAluguelMensal, setValorAluguelMensal] = useState(2500);
  const [taxaAdministracaoPerc, setTaxaAdministracaoPerc] = useState(10);
  const [diaVencimento, setDiaVencimento] = useState(10);
  const [duracaoMeses, setDuracaoMeses] = useState(12);
  const [dataInicio, setDataInicio] = useState(todayStr);
  const [tipoGarantia, setTipoGarantia] = useState("CAUCAO");
  const [valorGarantia, setValorGarantia] = useState(7500);
  const [observacoes, setObservacoes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (rentalProperties[0] && !propertyId) {
        setPropertyId(rentalProperties[0].id);
        const aluguel = (rentalProperties[0] as any).valorAluguel;
        if (aluguel) {
          setValorAluguelMensal(Number(aluguel));
          setValorGarantia(Number(aluguel) * 3);
        }
      }
      if (leads[0] && !leadId) {
        setLeadId(leads[0].id);
      }
    }
  }, [isOpen, rentalProperties, leads, propertyId, leadId]);

  if (!isOpen) return null;

  const taxaAdmCalculada = (valorAluguelMensal * taxaAdministracaoPerc) / 100;
  const repasseProprietario = Math.max(0, valorAluguelMensal - taxaAdmCalculada);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!propertyId) {
      setErrorMessage("Selecione um imóvel para o contrato.");
      return;
    }
    if (!leadId) {
      setErrorMessage("Selecione um locatário.");
      return;
    }
    if (valorAluguelMensal <= 0) {
      setErrorMessage("O valor do aluguel deve ser maior que zero.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          leadId,
          valorAluguelMensal,
          taxaAdministracaoPerc,
          diaVencimento,
          duracaoMeses,
          dataInicio,
          tipoGarantia,
          valorGarantia: valorGarantia > 0 ? valorGarantia : undefined,
          observacoes: observacoes || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(data?.error || "Erro ao criar contrato de aluguel.");
        return;
      }

      const p = properties.find((item) => item.id === propertyId);
      const l = leads.find((item) => item.id === leadId);

      const contractItem: RentalContractItem = {
        id: data.contract.id,
        codigoContrato: data.contract.codigoContrato,
        imovelNome: p?.nome || "Imóvel",
        locatarioNome: l?.nome || "Locatário",
        valorAluguelMensal,
        taxaAdministracaoPerc,
        taxaAdministracaoValor: taxaAdmCalculada,
        diaVencimento,
        duracaoMeses,
        dataInicio,
        dataFim: data.contract.dataFim ? data.contract.dataFim.slice(0, 10) : "",
        tipoGarantia,
        status: "ATIVO",
      };

      onCreated(contractItem);
      onClose();
    } catch {
      setErrorMessage("Falha de conexão ao registrar o contrato de aluguel.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Novo Contrato de Locação Anual</h3>
              <p className="text-xs text-muted-foreground">Formalização de contrato tradicional com taxa administrativa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Imóvel e Locatário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-connect-blue" />
                Imóvel para Locação *
              </label>
              <select
                value={propertyId}
                onChange={(e) => {
                  const id = e.target.value;
                  setPropertyId(id);
                  const matched = properties.find((p) => p.id === id);
                  const aluguel = (matched as any)?.valorAluguel;
                  if (aluguel) {
                    setValorAluguelMensal(Number(aluguel));
                    setValorGarantia(Number(aluguel) * 3);
                  }
                }}
                required
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              >
                <option value="">Selecione o imóvel...</option>
                {rentalProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} {p.bairro ? `(${p.bairro})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-connect-blue" />
                Locatário / Lead *
              </label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              >
                <option value="">Selecione o locatário...</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome} {l.telefone ? `• ${l.telefone}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Valores Financeiros */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Aluguel Mensal (R$) *</label>
              <NumericInput
                value={valorAluguelMensal}
                onChange={(v) => {
                  setValorAluguelMensal(v);
                  if (tipoGarantia === "CAUCAO") setValorGarantia(v * 3);
                }}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground font-bold text-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Taxa Imobiliária (%) *</label>
              <NumericInput
                value={taxaAdministracaoPerc}
                onChange={setTaxaAdministracaoPerc}
                max={100}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Dia do Vencimento</label>
              <select
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground"
              >
                {[5, 10, 15, 20, 25, 28].map((dia) => (
                  <option key={dia} value={dia}>
                    Todo dia {dia}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resumo Demonstrativo da Taxa */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Receita Mensal Imobiliária ({taxaAdministracaoPerc}%):</span>
              <span className="font-extrabold text-connect-blue text-sm">
                {taxaAdmCalculada.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block text-[11px]">Repasse Líquido Proprietário:</span>
              <span className="font-extrabold text-foreground text-sm">
                {repasseProprietario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>

          {/* Vigência e Garantia */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Início da Locação *</label>
              <input
                type="date"
                required
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Duração do Contrato</label>
              <select
                value={duracaoMeses}
                onChange={(e) => setDuracaoMeses(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground"
              >
                <option value={12}>12 Meses (1 Ano)</option>
                <option value={24}>24 Meses (2 Anos)</option>
                <option value={30}>30 Meses (Padrão Lei 8.245)</option>
                <option value={36}>36 Meses (3 Anos)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Tipo de Garantia</label>
              <select
                value={tipoGarantia}
                onChange={(e) => setTipoGarantia(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground"
              >
                {GARANTIAS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {tipoGarantia === "CAUCAO" && (
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Valor da Caução (R$)</label>
              <NumericInput
                value={valorGarantia}
                onChange={setValorGarantia}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground font-semibold"
              />
              <span className="text-[10px] text-muted-foreground">Normalmente equivalente a 3 meses de aluguel</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Observações Adicionais</label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Cláusulas especiais, número de vagas, permissão de pets..."
              className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground resize-none"
            />
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              {submitting ? "Firmando Contrato..." : "Firmar Contrato de Locação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
