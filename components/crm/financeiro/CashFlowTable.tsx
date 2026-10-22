"use client";

import React, { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, RotateCcw, Clock, Trash2, Receipt } from "lucide-react";
import { ConfirmCashMovementModal } from "./ConfirmCashMovementModal";
import { paymentMethodLabel, formatDateBr } from "./paymentMethods";

export interface CashFlowItem {
  id: string;
  tipo: "RECEITA" | "DESPESA";
  categoria: string;
  descricao: string;
  valor: number;
  /** AAAA-MM-DD */
  dataVencimento: string;
  status: "PAGO" | "PENDENTE";
  meioPagamento?: string | null;
  /** AAAA-MM-DD */
  dataLiquidacao?: string;
  foiAntecipado?: boolean;
  observacaoLiquidacao?: string;
  centroCusto?: string;
  saleId?: string | null;
  bookingId?: string | null;
  isRecorrente?: boolean;
}

interface CashFlowTableProps {
  cashFlows: CashFlowItem[];
  filterTipo: "TODOS" | "RECEITA" | "DESPESA";
  onSetFilterTipo: (tipo: "TODOS" | "RECEITA" | "DESPESA") => void;
  onConfirmMovement?: (
    item: CashFlowItem,
    dataEfetiva: string,
    meio: string,
    observacao?: string
  ) => Promise<boolean>;
  onRevertMovement?: (item: CashFlowItem) => void;
  onDelete?: (item: CashFlowItem) => void;
  /** Id do lançamento com operação em andamento (desabilita as ações da linha). */
  busyId?: string | null;
}

export function CashFlowTable({
  cashFlows,
  filterTipo,
  onSetFilterTipo,
  onConfirmMovement,
  onRevertMovement,
  onDelete,
  busyId,
}: CashFlowTableProps) {
  const [selectedItemToConfirm, setSelectedItemToConfirm] = useState<CashFlowItem | null>(null);

  const handleOpenConfirm = (item: CashFlowItem) => {
    setSelectedItemToConfirm(item);
  };

  const handleConfirm = async (
    item: CashFlowItem,
    dataEfetiva: string,
    meio: string,
    observacao?: string
  ): Promise<boolean> => {
    if (!onConfirmMovement) return false;
    return onConfirmMovement(item, dataEfetiva, meio, observacao);
  };

  const visible = cashFlows.filter((c) => filterTipo === "TODOS" || c.tipo === filterTipo);

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground">Extrato de Contas Operacionais</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Controle de liquidações em tempo real e conciliação de entradas e saídas antecipadas.
            </p>
          </div>
          <div className="flex bg-muted p-1 rounded-xl text-xs">
            {(["TODOS", "RECEITA", "DESPESA"] as const).map((t) => (
              <button
                key={t}
                onClick={() => onSetFilterTipo(t)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  filterTipo === t
                    ? "bg-connect-blue text-white font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-muted/60 text-[10px] text-muted-foreground uppercase font-bold border-b border-border">
              <tr>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4">Meio</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações / Antecipação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <div className="p-3 rounded-full bg-connect-blue/10 text-connect-blue">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">Nenhum lançamento encontrado</span>
                      <span className="text-xs">
                        Registre receitas e despesas em &quot;Novo Lançamento&quot; ou realize vendas para gerar títulos.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              {visible.map((cf) => {
                  const isPendente = cf.status === "PENDENTE";
                  const isReceita = cf.tipo === "RECEITA";
                  const isBusy = busyId === cf.id;
                  const canDelete = Boolean(onDelete) && !cf.saleId && !cf.bookingId;

                  return (
                    <tr
                      key={cf.id}
                      className="hover:bg-connect-blue/5 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-foreground block">{cf.descricao}</span>
                        {cf.observacaoLiquidacao && (
                          <span className="text-[10px] text-muted-foreground italic">
                            Nota: {cf.observacaoLiquidacao}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{cf.categoria}</td>
                      <td className="py-3 px-4 font-mono text-foreground/80">
                        {formatDateBr(cf.dataVencimento)}
                        {cf.status === "PAGO" && cf.dataLiquidacao && (
                          <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-sans">
                            Quitado em: {formatDateBr(cf.dataLiquidacao)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-connect-blue font-semibold">{paymentMethodLabel(cf.meioPagamento)}</td>
                      <td
                        className={`py-3 px-4 font-bold ${
                          isReceita
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {isReceita ? "+" : "-"}
                        {cf.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit ${
                              cf.status === "PAGO"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {cf.status === "PAGO" ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                {cf.foiAntecipado ? "Liquidado (Antecipado)" : "Liquidado"}
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-500" />
                                Pendente
                              </>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                        {isPendente ? (
                          <button
                            onClick={() => handleOpenConfirm(cf)}
                            disabled={isBusy}
                            className={`disabled:opacity-50 px-2.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02] ${
                              isReceita
                                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30"
                            }`}
                            title={
                              isReceita
                                ? "Confirmar entrada do dinheiro antes da data prevista"
                                : "Confirmar saída do dinheiro antes da data prevista"
                            }
                          >
                            {isReceita ? (
                              <>
                                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Confirmar Entrada</span>
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
                                <span>Confirmar Saída</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <>
                            <span className="text-[11px] text-muted-foreground font-medium">
                              {cf.foiAntecipado ? "Antecipado ✓" : "Concluído ✓"}
                            </span>
                            {onRevertMovement && (
                              <button
                                onClick={() => onRevertMovement(cf)}
                                disabled={isBusy}
                                className="disabled:opacity-50 p-1 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                                title="Reverter para Pendente"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDelete?.(cf)}
                            disabled={isBusy}
                            className="disabled:opacity-50 p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Excluir lançamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        </div>
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação Antecipada */}
      <ConfirmCashMovementModal
        isOpen={Boolean(selectedItemToConfirm)}
        onClose={() => setSelectedItemToConfirm(null)}
        item={selectedItemToConfirm}
        onConfirm={handleConfirm}
      />
    </>
  );
}
