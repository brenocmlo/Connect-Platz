"use client";

import React, { useMemo } from "react";
import { Building2, UserPlus, Users } from "lucide-react";
import { SearchCombobox } from "@/components/crm/agenda/SearchCombobox";
import { LookupLead, LookupProperty } from "@/components/crm/agenda/useCrmLookups";
import { NumericInput } from "@/components/crm/primitives/NumericInput";

export interface SaleDealState {
  propertyId: string | null;
  unidadeNumero: string;
  leadId: string | null;
  novoComprador: boolean;
  compradorNome: string;
  compradorTelefone: string;
  compradorEmail: string;
  dataVenda: string;
  dataPrevistaPagamento: string;
  vgv: number;
  percentualComissao: number;
  impostoPercentual: number;
  meioPagamento: string;
}

interface SaleDealFieldsProps {
  deal: SaleDealState;
  onChange: (patch: Partial<SaleDealState>) => void;
  leads: LookupLead[];
  properties: LookupProperty[];
  loading: boolean;
}

const fieldClass =
  "w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue";
const labelClass = "block font-semibold text-muted-foreground mb-1";

const PAYMENT_METHODS = [
  { id: "TED", label: "TED" },
  { id: "PIX", label: "PIX" },
  { id: "BOLETO", label: "Boleto" },
  { id: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { id: "CARTAO_DEBITO", label: "Cartão de Débito" },
];

export function SaleDealFields({ deal, onChange, leads, properties, loading }: SaleDealFieldsProps) {
  const propertyOptions = useMemo(
    () =>
      properties.map((p) => ({
        id: p.id,
        label: p.nome,
        sublabel: [p.construtora, p.bairro].filter(Boolean).join(" · "),
      })),
    [properties]
  );
  const leadOptions = useMemo(
    () => leads.map((l) => ({ id: l.id, label: l.nome, sublabel: [l.telefone, l.email].filter(Boolean).join(" · ") })),
    [leads]
  );
  const selectedProperty = properties.find((p) => p.id === deal.propertyId);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className={`${labelClass} flex items-center gap-1.5`}>
            <Building2 className="w-3.5 h-3.5 text-connect-blue" />
            Empreendimento *
          </label>
          <SearchCombobox
            options={propertyOptions}
            value={deal.propertyId}
            onChange={(id) => {
              const prop = properties.find((p) => p.id === id);
              onChange({ propertyId: id, ...(prop?.valorVenda ? { vgv: prop.valorVenda } : {}) });
            }}
            loading={loading}
            required
            placeholder="Busque o empreendimento..."
            emptyText="Nenhum empreendimento cadastrado"
          />
          {selectedProperty?.construtora && (
            <span className="text-[10px] text-muted-foreground mt-1 block">
              Construtora: <strong className="text-foreground">{selectedProperty.construtora}</strong>
            </span>
          )}
        </div>
        <div>
          <label className={labelClass}>Unidade</label>
          <input
            type="text"
            value={deal.unidadeNumero}
            onChange={(e) => onChange({ unidadeNumero: e.target.value })}
            placeholder="Ex: 403"
            className={fieldClass}
          />
        </div>
      </div>

      {/* Comprador: lead existente ou cadastro de novo comprador real */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={`${labelClass} mb-0`}>Comprador / Cliente *</label>
          <button
            type="button"
            onClick={() => onChange({ novoComprador: !deal.novoComprador, leadId: null })}
            className="text-[11px] font-semibold text-connect-blue hover:underline flex items-center gap-1"
          >
            {deal.novoComprador ? <Users className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            {deal.novoComprador ? "Selecionar lead cadastrado" : "Cadastrar novo comprador"}
          </button>
        </div>
        {deal.novoComprador ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 animate-in fade-in-0">
            <input
              type="text"
              required
              placeholder="Nome completo *"
              value={deal.compradorNome}
              onChange={(e) => onChange({ compradorNome: e.target.value })}
              className={fieldClass}
            />
            <input
              type="tel"
              required
              placeholder="Telefone com DDD *"
              value={deal.compradorTelefone}
              onChange={(e) => onChange({ compradorTelefone: e.target.value })}
              className={fieldClass}
            />
            <input
              type="email"
              placeholder="E-mail"
              value={deal.compradorEmail}
              onChange={(e) => onChange({ compradorEmail: e.target.value })}
              className={fieldClass}
            />
          </div>
        ) : (
          <SearchCombobox
            options={leadOptions}
            value={deal.leadId}
            onChange={(id) => onChange({ leadId: id })}
            loading={loading}
            required
            placeholder="Busque o lead por nome, telefone ou e-mail..."
            emptyText="Nenhum lead encontrado — cadastre um novo comprador"
          />
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Data da Venda *</label>
          <input type="date" required value={deal.dataVenda} onChange={(e) => onChange({ dataVenda: e.target.value })} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Previsão de Pagamento</label>
          <input
            type="date"
            value={deal.dataPrevistaPagamento}
            onChange={(e) => onChange({ dataPrevistaPagamento: e.target.value })}
            className={fieldClass}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={labelClass}>Meio de Pagamento</label>
          <select value={deal.meioPagamento} onChange={(e) => onChange({ meioPagamento: e.target.value })} className={fieldClass}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className={labelClass}>VGV da Venda (R$) *</label>
          <NumericInput
            required
            min={1}
            value={deal.vgv}
            onChange={(vgv) => onChange({ vgv })}
            placeholder="0,00"
            className={`${fieldClass} font-mono font-bold`}
          />
        </div>
        <div>
          <label className={labelClass}>% Comissão Bruta *</label>
          <NumericInput
            required
            min={0.01}
            max={100}
            value={deal.percentualComissao}
            onChange={(percentualComissao) => onChange({ percentualComissao })}
            placeholder="0"
            className={`${fieldClass} font-mono font-bold`}
          />
        </div>
        <div>
          <label className={labelClass}>% Imposto</label>
          <NumericInput
            min={0}
            max={100}
            value={deal.impostoPercentual}
            onChange={(impostoPercentual) => onChange({ impostoPercentual })}
            placeholder="0"
            className={`${fieldClass} font-mono`}
          />
        </div>
      </div>
    </div>
  );
}
