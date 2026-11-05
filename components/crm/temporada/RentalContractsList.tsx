"use client";

import React from "react";

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
}

export function RentalContractsList({ rentals, hideValues }: RentalContractsListProps) {
  if (rentals.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center text-xs text-muted-foreground">
        Nenhum contrato de aluguel tradicional registrado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rentals.map((c) => (
        <div
          key={c.id}
          className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-connect-blue/30 transition-all"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">{c.imovelNome}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue font-semibold">
                {c.codigoContrato}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                {c.status}
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

          <div className="text-left sm:text-right">
            <div className="text-base font-extrabold text-foreground">
              {hideValues ? "••••••" : c.valorAluguelMensal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              <span className="text-xs text-muted-foreground font-normal"> /mês</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              Taxa Adm: {c.taxaAdministracaoPerc}% ({c.taxaAdministracaoValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
