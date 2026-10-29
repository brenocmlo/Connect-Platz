"use client";

import React, { useMemo, useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { useCrmLookups } from "@/components/crm/agenda/useCrmLookups";
import { localDateKey } from "@/components/crm/agenda/types";
import { SaleItem } from "./types";
import { SaleCalculationsTab } from "./SaleCalculationsTab";
import {
  SaleParticipantsSection,
  ParticipantsForm,
  ParticipantFormState,
  EMPTY_PARTICIPANT,
} from "./SaleParticipantsSection";
import { SaleAttachmentsTab, SaleAttachment } from "./SaleAttachmentsTab";
import { SaleDealFields, SaleDealState } from "./SaleDealFields";
import { calculateSaleValues, ParticipantRole } from "./saleSplitHelper";

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Chamado somente após a API confirmar o registro, com a venda real retornada. */
  onSubmit: (sale: SaleItem) => void;
  preselectedLead?: {
    id: string;
    nome: string;
    telefone?: string | null;
    email?: string | null;
    empreendimentoInteresse?: string | null;
    corretorId?: string | null;
    corretor?: { id: string; nome: string } | null;
  } | null;
}

const ROLES: ParticipantRole[] = ["CORRETOR_1", "CORRETOR_2", "GESTOR", "CAPTADOR"];

function initialDeal(preselectedLead?: NewSaleModalProps["preselectedLead"]): SaleDealState {
  const today = new Date();
  return {
    propertyId: null,
    unidadeNumero: "",
    leadId: preselectedLead?.id || null,
    novoComprador: false,
    compradorNome: "",
    compradorTelefone: "",
    compradorEmail: "",
    dataVenda: localDateKey(today),
    dataPrevistaPagamento: localDateKey(new Date(today.getTime() + 30 * 86400000)),
    vgv: 0,
    percentualComissao: 5,
    impostoPercentual: 6,
    meioPagamento: "TED",
  };
}

function initialParticipants(): ParticipantsForm {
  // Gestor e Captador começam em 0% (opcionais) — sem super-alocação por padrão
  return {
    CORRETOR_1: { ...EMPTY_PARTICIPANT, percentual: 50 },
    CORRETOR_2: { ...EMPTY_PARTICIPANT },
    GESTOR: { ...EMPTY_PARTICIPANT },
    CAPTADOR: { ...EMPTY_PARTICIPANT },
  };
}

export function NewSaleModal({ isOpen, onClose, onSubmit, preselectedLead }: NewSaleModalProps) {
  const { user } = useCrm();
  const canManage = user?.role === "ADMINISTRADOR" || user?.role === "FINANCEIRO_VENDA";
  const { leads, properties, members, loading } = useCrmLookups({ enabled: isOpen, members: true });

  const [activeTab, setActiveTab] = useState<"dados" | "resumo" | "anexos">("dados");
  const [deal, setDeal] = useState<SaleDealState>(() => initialDeal(preselectedLead));
  const [participants, setParticipants] = useState<ParticipantsForm>(initialParticipants);
  const [hasCorretor2, setHasCorretor2] = useState(false);
  const [attachments, setAttachments] = useState<SaleAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Garante que o lead pré-selecionado sempre conste na lista, mesmo se a busca assíncrona ainda estiver carregando
  const effectiveLeads = useMemo(() => {
    const list = [...leads];
    if (preselectedLead && !list.some((l) => l.id === preselectedLead.id)) {
      list.unshift({
        id: preselectedLead.id,
        nome: preselectedLead.nome,
        telefone: preselectedLead.telefone,
        email: preselectedLead.email,
        corretorId: preselectedLead.corretorId || preselectedLead.corretor?.id,
        corretorNome: preselectedLead.corretor?.nome,
      });
    }
    return list;
  }, [leads, preselectedLead]);

  // Pré-seleciona lead, empreendimento de interesse e corretor caso fornecidos
  React.useEffect(() => {
    if (preselectedLead && isOpen) {
      const matchedProp = preselectedLead.empreendimentoInteresse
        ? properties.find((p) =>
            p.nome.toLowerCase().includes(preselectedLead.empreendimentoInteresse!.toLowerCase())
          )
        : null;

      const brokerId = preselectedLead.corretorId || preselectedLead.corretor?.id || null;

      setDeal((prev) => {
        const nextPropId = matchedProp?.id || prev.propertyId;
        const nextVgv = matchedProp?.valorVenda ? matchedProp.valorVenda : prev.vgv;
        if (prev.leadId === preselectedLead.id && prev.propertyId === nextPropId && prev.vgv === nextVgv) {
          return prev;
        }
        return {
          ...prev,
          leadId: preselectedLead.id,
          novoComprador: false,
          propertyId: nextPropId,
          vgv: nextVgv,
        };
      });

      if (brokerId) {
        setParticipants((prev) => {
          if (prev.CORRETOR_1.userId === brokerId) return prev;
          return {
            ...prev,
            CORRETOR_1: { ...prev.CORRETOR_1, userId: brokerId, percentual: 50 },
          };
        });
      }
    }
  }, [preselectedLead, isOpen, properties]);

  // Papéis ativos: titular sempre; demais apenas com participante escolhido
  const activeRoles = ROLES.filter((role) => {
    if (role === "CORRETOR_1") return true;
    if (role === "CORRETOR_2" && !hasCorretor2) return false;
    return Boolean(participants[role].userId);
  });

  const nameByRole = useMemo(() => {
    const map: Partial<Record<string, string>> = {};
    ROLES.forEach((role) => {
      const id = participants[role].userId;
      map[role] = members.find((m) => m.id === id)?.nome;
    });
    return map;
  }, [participants, members]);

  const calculated = calculateSaleValues({
    vgvValue: deal.vgv,
    percentualComissao: deal.percentualComissao,
    impostoPercentual: deal.impostoPercentual,
    participants: activeRoles.map((role) => ({
      role,
      userId: participants[role].userId,
      nome: nameByRole[role] || "",
      percentual: participants[role].percentual,
      desconto: participants[role].desconto,
      bonus: participants[role].bonus,
    })),
  });

  if (!isOpen) return null;

  const handleDealChange = (patch: Partial<SaleDealState>) => {
    setDeal((prev) => {
      const next = { ...prev, ...patch };
      // Se selecionou ou trocou o lead, sincronizar Corretor 1 automaticamente com o corretor responsável
      if (patch.leadId !== undefined && patch.leadId !== prev.leadId && patch.leadId) {
        const matched = effectiveLeads.find((l) => l.id === patch.leadId);
        const brokerId = matched?.corretorId;
        if (brokerId) {
          setParticipants((p) => ({
            ...p,
            CORRETOR_1: { ...p.CORRETOR_1, userId: brokerId, percentual: p.CORRETOR_1.percentual || 50 },
          }));
        }
      }
      return next;
    });
  };

  const updateParticipant = (role: ParticipantRole, patch: Partial<ParticipantFormState>) =>
    setParticipants((prev) => ({ ...prev, [role]: { ...prev[role], ...patch } }));

  const handleClose = () => {
    setDeal(initialDeal());
    setParticipants(initialParticipants());
    setHasCorretor2(false);
    setAttachments([]);
    setError(null);
    setActiveTab("dados");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!deal.propertyId) return setError("Selecione o empreendimento.");
    if (!deal.novoComprador && !deal.leadId) return setError("Selecione o comprador ou cadastre um novo.");
    if (deal.novoComprador && (deal.compradorNome.trim().length < 2 || deal.compradorTelefone.replace(/\D/g, "").length < 10)) {
      setActiveTab("dados");
      return setError("Informe nome e telefone (com DDD) do novo comprador.");
    }
    if (!deal.dataVenda) return setError("Informe a data da venda.");
    if (deal.percentualComissao <= 0) return setError("Informe a % de comissão bruta.");
    if (deal.vgv <= 0) return setError("Informe o VGV da venda.");
    const titularId = participants.CORRETOR_1.userId;
    if (!titularId) return setError("Selecione o Corretor 1 (titular).");
    const orphan = ROLES.find((r) => r !== "CORRETOR_1" && participants[r].percentual > 0 && !participants[r].userId);
    if (orphan) return setError("Há percentual definido para um papel sem participante selecionado.");
    if (calculated.isOverAllocated) {
      setActiveTab("resumo");
      return setError("A soma dos participantes excede 100% da comissão líquida.");
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: deal.propertyId,
          unidadeNumero: deal.unidadeNumero || undefined,
          ...(deal.novoComprador
            ? {
                novoComprador: {
                  nome: deal.compradorNome,
                  telefone: deal.compradorTelefone,
                  email: deal.compradorEmail || undefined,
                },
              }
            : { leadId: deal.leadId }),
          dataVenda: deal.dataVenda,
          dataPrevistaPagamento: deal.dataPrevistaPagamento || undefined,
          vgv: deal.vgv,
          percentualComissao: deal.percentualComissao,
          impostoPercentual: deal.impostoPercentual,
          meioPagamento: deal.meioPagamento,
          participants: activeRoles.map((role) => ({
            role,
            userId: role === "CORRETOR_1" ? titularId : participants[role].userId,
            percentual: participants[role].percentual,
            desconto: participants[role].desconto,
            bonus: participants[role].bonus,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Não foi possível registrar a venda.");
        return;
      }
      onSubmit(data.sale);
      handleClose();
    } catch {
      setError("Falha de conexão ao registrar a venda.");
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: "dados" as const, label: "Dados e Financeiro" },
    { id: "resumo" as const, label: "Resumo e Cálculos" },
    { id: "anexos" as const, label: `Anexos${attachments.length > 0 ? ` (${attachments.length})` : ""}` },
  ];

  if (!isOpen || !canManage) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Nova Venda & Split de Comissões</h3>
            <p className="text-xs text-muted-foreground">Cálculo automatizado e divisão determinística do fechamento</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-border bg-muted/40 px-4 pt-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-connect-blue text-connect-blue"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.id === "resumo" && calculated.isOverAllocated && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse align-middle" />
              )}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col min-h-0 text-xs">
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Validação feita em handleSubmit (noValidate): a aba de dados pode estar oculta */}
            <div className={activeTab === "dados" ? "space-y-4" : "hidden"}>
              <SaleDealFields
                deal={deal}
                onChange={handleDealChange}
                leads={effectiveLeads}
                properties={properties}
                loading={loading}
                preselectedLead={preselectedLead}
              />
              <SaleParticipantsSection
                participants={participants}
                onChange={updateParticipant}
                hasCorretor2={hasCorretor2}
                setHasCorretor2={setHasCorretor2}
                members={members}
                lockedTitular={null}
              />
            </div>

            {activeTab === "resumo" && (
              <SaleCalculationsTab
                calculated={calculated}
                impostoPercentual={deal.impostoPercentual}
                nameByRole={nameByRole}
              />
            )}

            {activeTab === "anexos" && (
              <SaleAttachmentsTab
                attachments={attachments}
                onAddAttachments={(fileList) =>
                  setAttachments((prev) => [
                    ...prev,
                    ...Array.from(fileList).map((f) => ({
                      id: `att-${f.name}-${f.size}-${f.lastModified}`,
                      name: f.name,
                      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
                      uploadedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                    })),
                  ])
                }
                onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
              />
            )}

            {error && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-[11px] animate-in fade-in-0">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 p-3 border-t border-border bg-card">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || calculated.isOverAllocated}
              className="px-4 py-2 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white font-extrabold shadow-lg shadow-connect-blue/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Cadastrar Fechamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
