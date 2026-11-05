"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Loader2, AlertCircle, Save } from "lucide-react";
import { useCrmLookups } from "@/components/crm/agenda/useCrmLookups";
import { SaleItem } from "./types";
import { SaleCalculationsTab } from "./SaleCalculationsTab";
import {
  SaleParticipantsSection,
  ParticipantsForm,
  ParticipantFormState,
  EMPTY_PARTICIPANT,
} from "./SaleParticipantsSection";
import { NumericInput } from "@/components/crm/primitives/NumericInput";
import { calculateSaleValues, ParticipantRole } from "./saleSplitHelper";

interface EditSaleModalProps {
  sale: SaleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaleUpdated: (updated: SaleItem) => void;
}

const ROLES: ParticipantRole[] = ["CORRETOR_1", "CORRETOR_2", "GESTOR", "CAPTADOR"];

const PAYMENT_METHODS = [
  { id: "TED", label: "TED" },
  { id: "PIX", label: "PIX" },
  { id: "BOLETO", label: "Boleto" },
  { id: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { id: "FINANCIAMENTO_BANCARIO", label: "Financiamento Bancário" },
];

export function EditSaleModal({ sale, isOpen, onClose, onSaleUpdated }: EditSaleModalProps) {
  const { members, loading: loadingLookups } = useCrmLookups({ enabled: isOpen, members: true });

  const [activeTab, setActiveTab] = useState<"dados" | "calculos">("dados");
  const [dataVenda, setDataVenda] = useState("");
  const [vgv, setVgv] = useState(0);
  const [percentualComissao, setPercentualComissao] = useState(5);
  const [impostoPercentual, setImpostoPercentual] = useState(6);
  const [meioPagamento, setMeioPagamento] = useState("TED");
  const [hasCorretor2, setHasCorretor2] = useState(false);
  const [participants, setParticipants] = useState<ParticipantsForm>({
    CORRETOR_1: { ...EMPTY_PARTICIPANT },
    CORRETOR_2: { ...EMPTY_PARTICIPANT },
    GESTOR: { ...EMPTY_PARTICIPANT },
    CAPTADOR: { ...EMPTY_PARTICIPANT },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializa com dados da venda quando o modal abre
  useEffect(() => {
    if (!sale) return;
    setDataVenda(sale.dataVendaIso || "");
    setVgv(sale.vgv || 0);
    setPercentualComissao(sale.percentualComissao || 5);
    setImpostoPercentual(sale.impostoPercentual || 0);
    setMeioPagamento(sale.meioPagamento || "TED");
    setHasCorretor2(Boolean(sale.segundoCorretor));

    // Mapeia splits existentes para os papéis do formulário
    const nextParts: ParticipantsForm = {
      CORRETOR_1: { ...EMPTY_PARTICIPANT },
      CORRETOR_2: { ...EMPTY_PARTICIPANT },
      GESTOR: { ...EMPTY_PARTICIPANT },
      CAPTADOR: { ...EMPTY_PARTICIPANT },
    };

    sale.splits.forEach((sp) => {
      let role: ParticipantRole | null = null;
      if (sp.tipo === "CORRETOR_TITULAR") role = "CORRETOR_1";
      else if (sp.tipo === "CO_CORRETOR") role = "CORRETOR_2";
      else if (sp.tipo === "SOCIO_GESTOR") role = "GESTOR";
      else if (sp.tipo === "CAPTACAO") role = "CAPTADOR";

      if (role) {
        nextParts[role] = {
          userId: sp.userId || "",
          percentual: sp.percentual || 0,
          desconto: 0,
          bonus: 0,
        };
      }
    });

    setParticipants(nextParts);
    setError(null);
    setActiveTab("dados");
  }, [sale]);

  const memberNameById = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m) => map.set(m.id, m.nome));
    return map;
  }, [members]);

  const nameByRole = useMemo(() => {
    const map: Partial<Record<string, string>> = {};
    ROLES.forEach((r) => {
      const uid = participants[r]?.userId;
      if (uid && memberNameById.has(uid)) {
        map[r] = memberNameById.get(uid)!;
      }
    });
    return map;
  }, [participants, memberNameById]);

  const calculated = useMemo(
    () =>
      calculateSaleValues({
        vgvValue: vgv,
        percentualComissao,
        impostoPercentual,
        participants: ROLES.map((role) => ({
          role,
          userId: participants[role]?.userId,
          nome: nameByRole[role] || "",
          percentual: participants[role]?.percentual || 0,
          desconto: participants[role]?.desconto || 0,
          bonus: participants[role]?.bonus || 0,
        })),
      }),
    [vgv, percentualComissao, impostoPercentual, participants, nameByRole]
  );

  if (!isOpen || !sale) return null;

  const handleSave = async () => {
    setError(null);
    if (!dataVenda) {
      setError("Informe a data da venda.");
      return;
    }
    if (vgv <= 0) {
      setError("O VGV deve ser maior que zero.");
      return;
    }
    if (calculated.isOverAllocated) {
      setError("A soma dos participantes excede a base líquida de comissão.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        dataVenda,
        vgv,
        percentualComissao,
        impostoPercentual,
        meioPagamento,
        participants: ROLES.filter((r) => participants[r]?.userId && participants[r]?.percentual > 0).map((role) => ({
          role,
          userId: participants[role].userId,
          percentual: participants[role].percentual,
          desconto: participants[role].desconto || 0,
          bonus: participants[role].bonus || 0,
        })),
      };

      const res = await fetch(`/api/vendas/${sale.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Erro ao salvar alterações da venda.");
        return;
      }

      onSaleUpdated(data.sale);
      onClose();
    } catch {
      setError("Falha de conexão ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0">
      <div className="bg-card border border-border w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h3 className="text-base font-bold text-foreground">Editar Venda #{sale.codigoVenda}</h3>
            <p className="text-xs text-muted-foreground">
              {sale.imovelNome} • {sale.compradorNome}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-5 bg-muted/20">
          <button
            onClick={() => setActiveTab("dados")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "dados"
                ? "border-connect-blue text-connect-blue font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Dados & Participantes
          </button>
          <button
            onClick={() => setActiveTab("calculos")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "calculos"
                ? "border-connect-blue text-connect-blue font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Cálculos & Repasse Financeiro
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === "dados" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Data da Venda</label>
                  <input
                    type="date"
                    value={dataVenda}
                    onChange={(e) => setDataVenda(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">VGV Comercial (R$)</label>
                  <NumericInput
                    value={vgv}
                    onChange={setVgv}
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Meio de Pagamento</label>
                  <select
                    value={meioPagamento}
                    onChange={(e) => setMeioPagamento(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">% Comissão Bruta</label>
                  <NumericInput
                    value={percentualComissao}
                    onChange={setPercentualComissao}
                    max={100}
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">% Imposto sobre Comissão</label>
                  <NumericInput
                    value={impostoPercentual}
                    onChange={setImpostoPercentual}
                    max={100}
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <SaleParticipantsSection
                  participants={participants}
                  onChange={(role, patch) =>
                    setParticipants((prev) => ({
                      ...prev,
                      [role]: { ...prev[role], ...patch },
                    }))
                  }
                  hasCorretor2={hasCorretor2}
                  setHasCorretor2={setHasCorretor2}
                  members={members}
                />
              </div>
            </div>
          )}

          {activeTab === "calculos" && (
            <SaleCalculationsTab
              calculated={calculated}
              impostoPercentual={impostoPercentual}
              nameByRole={nameByRole}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || calculated.isOverAllocated}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-connect-blue text-white hover:bg-connect-deep-blue flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-connect-blue/20 hover:scale-[1.02] transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
