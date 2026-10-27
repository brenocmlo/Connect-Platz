"use client";

import React from "react";
import Link from "next/link";
import { DollarSign, CheckCircle2, Building2, User, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { useCrm } from "@/components/crm/CrmContext";

interface LeadSaleSectionProps {
  lead: LeadDetail;
}

export function LeadSaleSection({ lead }: LeadSaleSectionProps) {
  const { hideValues, formatMoney } = useCrm();

  if (!lead.sales || lead.sales.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Venda Realizada & Comissões</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          {lead.sales.length === 1 ? "1 Venda Concluída" : `${lead.sales.length} Vendas`}
        </span>
      </div>

      <div className="space-y-3">
        {lead.sales.map((sale) => {
          const isPaga = sale.statusComissao?.toLowerCase() === "paga";
          const dataFormatted = sale.dataVenda
            ? new Date(sale.dataVenda).toLocaleDateString("pt-BR")
            : "—";

          return (
            <div
              key={sale.id}
              className="bg-card border border-emerald-500/30 dark:border-emerald-500/20 rounded-xl p-3.5 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-foreground bg-muted px-2 py-0.5 rounded-md">
                    {sale.codigoVenda}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isPaga
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {isPaga ? "Comissão Paga" : "Comissão Pendente"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Calendar className="w-3 h-3 text-muted-foreground/70" />
                  <span>{dataFormatted}</span>
                </div>
              </div>

              {/* Grid de Valores: VGV e Comissão */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-muted/40 rounded-lg p-2.5 space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                    VGV da Venda
                  </span>
                  <div className="text-sm font-extrabold text-foreground">
                    {hideValues ? "••••" : formatMoney(sale.valorVendaVGV)}
                  </div>
                </div>

                <div className="bg-emerald-500/10 rounded-lg p-2.5 space-y-0.5 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-semibold tracking-wider">
                    Comissão Total ({sale.percentualComissao}%)
                  </span>
                  <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                    {hideValues ? "••••" : formatMoney(sale.valorComissaoTotal)}
                  </div>
                </div>
              </div>

              {/* Metadados: Empreendimento e Corretor */}
              <div className="space-y-1.5 text-[11px] text-muted-foreground pt-1">
                {sale.property?.nome && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                    <span className="truncate">
                      Empreendimento: <strong className="text-foreground">{sale.property.nome}</strong>
                    </span>
                  </div>
                )}
                {sale.corretorTitular?.nome && (
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                    <span className="truncate">
                      Corretor Titular: <strong className="text-foreground">{sale.corretorTitular.nome}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Link para o módulo Vendas & Comissões */}
              <div className="pt-2 border-t border-border/60">
                <Link
                  href="/crm/vendas"
                  className="w-full py-1.5 px-3 rounded-lg bg-connect-blue/10 hover:bg-connect-blue text-connect-blue hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Ver em Vendas e Comissões</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
