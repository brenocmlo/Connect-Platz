"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, BarChart3, Layers, Loader2, AlertCircle } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { DreTable } from "@/components/crm/financeiro/DreTable";
import { CashFlowTable, CashFlowItem } from "@/components/crm/financeiro/CashFlowTable";
import { CashFlowProjection } from "@/components/crm/financeiro/CashFlowProjection";
import { CashFlowStatCards } from "@/components/crm/financeiro/CashFlowStatCards";
import { NewCashFlowModal, NewCashFlowPayload } from "@/components/crm/financeiro/NewCashFlowModal";
import { cashFlowFromApi, computeCashFlowSummary } from "@/components/crm/financeiro/cashFlowMetrics";
import { formatDateBr } from "@/components/crm/financeiro/paymentMethods";
import { AccessDeniedCard } from "@/components/crm/AccessDeniedCard";

const TABS = [
  { id: "dre", label: "DRE Gerencial em Tempo Real", icon: FileText },
  { id: "contas", label: "Contas a Pagar & Receber", icon: Layers },
  { id: "projecao", label: "Projeção de Saldo (90 Dias)", icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]["id"];

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function FluxoCaixaDREPage() {
  const { user, setActionMessage, hideValues } = useCrm();
  // Fluxo de Caixa e DRE: exclusivo do administrador (a API também bloqueia com 403)
  const canAccess = !user || user.role === "ADMINISTRADOR";

  const [activeTab, setActiveTab] = useState<TabId>("contas");
  const [cashFlows, setCashFlows] = useState<CashFlowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState<"TODOS" | "RECEITA" | "DESPESA">("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const notify = useCallback(
    (msg: string) => {
      setActionMessage(msg);
      setTimeout(() => setActionMessage(null), 4500);
    },
    [setActionMessage]
  );

  const loadFinanceiro = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/financeiro", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoadError(data?.error || "Não foi possível carregar o fluxo de caixa.");
        return;
      }
      setCashFlows(((data.entries as any[]) || []).map(cashFlowFromApi));
    } catch {
      setLoadError("Falha de conexão ao carregar o fluxo de caixa.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canAccess) loadFinanceiro();
  }, [canAccess, loadFinanceiro]);

  const summary = useMemo(() => computeCashFlowSummary(cashFlows), [cashFlows]);

  const replaceEntry = (raw: any, extra?: Partial<CashFlowItem>) => {
    const updated = { ...cashFlowFromApi(raw), ...extra };
    setCashFlows((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleAddEntry = async (payload: NewCashFlowPayload): Promise<boolean> => {
    try {
      const res = await fetch("/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.entry) {
        notify(data?.error || "Não foi possível salvar o lançamento.");
        return false;
      }
      setCashFlows((prev) => [cashFlowFromApi(data.entry), ...prev]);
      notify(
        payload.status === "PAGO"
          ? "Lançamento liquidado e registrado no caixa com sucesso!"
          : "Lançamento agendado adicionado com sucesso!"
      );
      return true;
    } catch {
      notify("Falha de conexão ao salvar o lançamento.");
      return false;
    }
  };

  const handleConfirmMovement = async (
    item: CashFlowItem,
    dataEfetiva: string,
    meio: string,
    observacao?: string
  ): Promise<boolean> => {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/financeiro/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAGO", dataPagamento: dataEfetiva, meioPagamento: meio, observacao }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.entry) {
        notify(data?.error || "Não foi possível confirmar a liquidação.");
        return false;
      }
      replaceEntry(data.entry, observacao ? { observacaoLiquidacao: observacao } : undefined);
      const tipoLabel = item.tipo === "RECEITA" ? "Entrada" : "Saída";
      notify(`${tipoLabel} de ${brl(item.valor)} confirmada em ${formatDateBr(dataEfetiva)}. Saldo de caixa recalculado.`);
      return true;
    } catch {
      notify("Falha de conexão ao confirmar a liquidação.");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const handleRevertMovement = async (item: CashFlowItem) => {
    if (!window.confirm(`Estornar a liquidação de "${item.descricao}" para pendente?`)) return;
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/financeiro/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDENTE" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.entry) {
        notify(data?.error || "Não foi possível estornar o lançamento.");
        return;
      }
      replaceEntry(data.entry);
      notify("Lançamento revertido para pendente.");
    } catch {
      notify("Falha de conexão ao estornar o lançamento.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: CashFlowItem) => {
    if (!window.confirm(`Excluir o lançamento "${item.descricao}"? Esta ação não pode ser desfeita.`)) return;
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/financeiro/${item.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(data?.error || "Não foi possível excluir o lançamento.");
        return;
      }
      setCashFlows((prev) => prev.filter((c) => c.id !== item.id));
      notify("Lançamento excluído.");
    } catch {
      notify("Falha de conexão ao excluir o lançamento.");
    } finally {
      setBusyId(null);
    }
  };

  if (!canAccess) {
    return <AccessDeniedCard moduleName="o Fluxo de Caixa e DRE corporativo" />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Fluxo de Caixa & DRE"
        subtitle="Conciliação de faturamento de vendas, estadias de temporada e custos operacionais."
        actionLabel="Novo Lançamento"
        onActionClick={() => setIsModalOpen(true)}
        showPeriodSelector={true}
        showExportButton={true}
      />

      <div className="space-y-4">
        <SectionTitle>Resumo de Caixa & Rentabilidade</SectionTitle>
        <CashFlowStatCards summary={summary} hideValues={hideValues} loading={loading} />
      </div>

      <div className="flex bg-muted p-1 rounded-xl gap-1 text-xs font-semibold overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 text-connect-blue" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-2xl p-12 flex items-center justify-center text-muted-foreground gap-2 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-connect-blue" />
          Carregando lançamentos...
        </div>
      ) : loadError ? (
        <div className="bg-card border border-red-500/30 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="text-sm text-foreground font-semibold">{loadError}</p>
          <button
            onClick={loadFinanceiro}
            className="px-4 py-2 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          {activeTab === "dre" && <DreTable entries={cashFlows} />}
          {activeTab === "contas" && (
            <CashFlowTable
              cashFlows={cashFlows}
              filterTipo={filterTipo}
              onSetFilterTipo={setFilterTipo}
              onConfirmMovement={handleConfirmMovement}
              onRevertMovement={handleRevertMovement}
              onDelete={handleDelete}
              busyId={busyId}
            />
          )}
          {activeTab === "projecao" && <CashFlowProjection entries={cashFlows} />}
        </>
      )}

      <NewCashFlowModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddEntry} />
    </div>
  );
}
