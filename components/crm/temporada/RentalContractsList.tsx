"use client";

import React from "react";
import { CheckCircle2, KeyRound, Plus, XCircle } from "lucide-react";

export interface RentalContractItem {
  id: string;
  codigoContrato: string;
  imovelNome: string;
  locatarioNome: string;
  valorAluguelMensal: number;
  taxaAdministracaoPerc: number;
  taxaAdministracaoValor: number;
  diaVencimento: number;
  duracaoMeses: number;
  dataInicio: string;
  dataFim: string;
  tipoGarantia: string;
  status: string;
}

interface RentalContractsListProps {
  rentals: RentalContractItem[];
  hideValues?: boolean;
  canManageRental?: boolean;
  canApproveRental?: boolean;
  onNewContract?: () => void;
  onUpdateStatus?: (id: string, status: "ATIVO" | "CANCELADO") => void;
}

export function RentalContractsList({
  rentals,
  hideValues,
  canManageRental,
  canApproveRental,
  onNewContract,
  onUpdateStatus,
}: RentalContractsListProps) {
  const canValidate = canApproveRental ?? canManageRental;
  if (rentals.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center text-xs text-muted-foreground space-y-3">
        <div className="mx-auto w-10 h-10 rounded-xl bg-connect-blue/10 text-connect-blue flex items-center justify-center">
          <KeyRound className="w-5 h-5" />
        </div>
        <p>Nenhum contrato de aluguel tradicional (locação comum) ativo no momento.</p>
        {canManageRental && onNewContract && (
          <button
            type="button"
            onClick={onNewContract}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-connect-blue text-white text-xs font-bold shadow-md shadow-connect-blue/20 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Contrato de Aluguel Comum
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rentals.map((c) => {
        const repasseProprietario = Math.max(0, c.valorAluguelMensal - c.taxaAdministracaoValor);
        const isCancelado = c.status === "CANCELADO";
        const isPendente = c.status === "PENDENTE_APROVACAO";
        return (
          <div
            key={c.id}
            className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-connect-blue/30 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-foreground">{c.imovelNome}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue font-semibold">
                  {c.codigoContrato}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isCancelado
                      ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400"
                      : isPendente
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                  }`}
                >
                  {!isCancelado && !isPendente && <CheckCircle2 className="w-3 h-3" />}
                  {isCancelado ? "CANCELADO" : isPendente ? "PENDENTE VALIDAÇÃO" : "VALIDADO / ATIVO"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Locatário: <strong className="text-foreground">{c.locatarioNome}</strong> • Garantia:{" "}
                <strong>{c.tipoGarantia}</strong>
              </p>
              <div className="text-[11px] text-muted-foreground font-mono">
                Vigência: {c.dataInicio} a {c.dataFim} ({c.duracaoMeses} meses) • Vencimento: dia {c.diaVencimento}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-left sm:text-right">
                <div className="text-base font-extrabold text-foreground">
                  {hideValues
                    ? "••••••"
                    : c.valorAluguelMensal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  <span className="text-xs text-muted-foreground font-normal"> /mês</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                  Taxa Imob ({c.taxaAdministracaoPerc}%):{" "}
                  {hideValues
                    ? "••••"
                    : c.taxaAdministracaoValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}{" "}
                  • Repasse Prop.:{" "}
                  {hideValues
                    ? "••••"
                    : repasseProprietario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>

              {canManageRental && onUpdateStatus && (
                <div className="flex items-center gap-1.5">
                  {isPendente && canValidate && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(c.id, "ATIVO")}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-500/20 transition-colors"
                      title="Validar e aprovar contrato de aluguel comum"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Validar
                    </button>
                  )}
                  {(!isCancelado || canValidate) && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(c.id, isCancelado ? "ATIVO" : "CANCELADO")}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        isCancelado
                          ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                          : "border-red-500/30 text-red-600 hover:bg-red-500/10"
                      }`}
                      title={isCancelado ? "Reativar contrato" : "Cancelar contrato e enviar para histórico"}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {isCancelado ? "Reativar" : "Cancelar"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
