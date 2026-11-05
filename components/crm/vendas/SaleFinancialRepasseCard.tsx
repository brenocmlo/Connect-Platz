"use client";

import React from "react";
import { Building2, Home, UserCheck, Target, Receipt, CheckCircle2 } from "lucide-react";
import { SplitItem } from "./types";

interface SaleFinancialRepasseCardProps {
  vgv: number;
  comissaoTotal: number;
  impostoValor?: number;
  impostoPercentual?: number;
  splits?: SplitItem[];
  /** Nome customizado do proprietário / vendedor (opcional) */
  proprietarioNome?: string;
  /** Permite compactar a exibição em cards de detalhe ou tabelas */
  compact?: boolean;
}

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (n: number) =>
  `${n.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

export function SaleFinancialRepasseCard({
  vgv,
  comissaoTotal,
  impostoValor = 0,
  impostoPercentual = 0,
  splits = [],
  proprietarioNome = "Proprietário / Vendedor",
  compact = false,
}: SaleFinancialRepasseCardProps) {
  // Cálculo determinístico do Repasse
  // 1. Líquido do Proprietário / Vendedor = VGV - Comissão Bruta
  const repasseProprietario = Math.max(0, vgv - comissaoTotal);
  const pctProprietario = vgv > 0 ? (repasseProprietario / vgv) * 100 : 0;

  // 2. Corretores (Titular + Segundo Corretor / Co-corretor)
  const corretoresSplits = splits.filter(
    (s) => s.tipo === "CORRETOR_TITULAR" || s.tipo === "CO_CORRETOR"
  );
  const totalCorretores = corretoresSplits.reduce((acc, s) => acc + s.valor, 0);

  // 3. Captador
  const captacaoSplit = splits.find((s) => s.tipo === "CAPTACAO");
  const totalCaptacao = captacaoSplit ? captacaoSplit.valor : 0;

  // 4. Gestor / Sócio
  const gestorSplit = splits.find((s) => s.tipo === "SOCIO_GESTOR");
  const totalGestor = gestorSplit ? gestorSplit.valor : 0;

  // 5. Imobiliária Connect Platz (retenção líquida)
  const imobiliariaSplit = splits.find((s) => s.tipo === "IMOBILIARIA");
  const totalImobiliaria =
    imobiliariaSplit?.valor ??
    Math.max(
      0,
      comissaoTotal - impostoValor - totalCorretores - totalCaptacao - totalGestor
    );

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-connect-blue/10 text-connect-blue">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Demonstrativo de Repasse da Venda
            </h4>
            <p className="text-[10px] text-muted-foreground">
              Divisão financeira completa entre proprietário, corretores e imobiliária
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Determinístico
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* 1. Líquido do Proprietário / Vendedor */}
        <div className="p-3 rounded-lg bg-muted/40 border border-border hover:border-connect-blue/30 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
              <Home className="w-3 h-3 text-emerald-600" />
              {proprietarioNome}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {pct(pctProprietario)}
            </span>
          </div>
          <div className="text-sm font-extrabold text-foreground">
            {brl(repasseProprietario)}
          </div>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            VGV líquido a repassar
          </span>
        </div>

        {/* 2. Corretores de Venda */}
        <div className="p-3 rounded-lg bg-connect-blue/5 border border-connect-blue/20">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-connect-blue flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              Corretores
            </span>
            <span className="text-[10px] font-semibold text-connect-blue">
              {corretoresSplits.length} part.
            </span>
          </div>
          <div className="text-sm font-extrabold text-connect-blue dark:text-blue-400">
            {brl(totalCorretores)}
          </div>
          <div className="text-[10px] text-muted-foreground truncate mt-0.5">
            {corretoresSplits.length > 0
              ? corretoresSplits.map((c) => `${c.beneficiario}: ${brl(c.valor)}`).join(" · ")
              : "Nenhum corretor selecionado"}
          </div>
        </div>

        {/* 3. Captador / Gestão */}
        <div className="p-3 rounded-lg bg-muted/40 border border-border">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
              <Target className="w-3 h-3 text-amber-500" />
              Captação & Gestão
            </span>
          </div>
          <div className="text-sm font-extrabold text-foreground">
            {brl(totalCaptacao + totalGestor)}
          </div>
          <div className="text-[10px] text-muted-foreground truncate mt-0.5">
            {[
              captacaoSplit && `Captador: ${brl(totalCaptacao)}`,
              gestorSplit && `Gestor: ${brl(totalGestor)}`,
            ]
              .filter(Boolean)
              .join(" · ") || "Sem captação externa"}
          </div>
        </div>

        {/* 4. Imobiliária Connect Platz */}
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Imobiliária Líquido
            </span>
          </div>
          <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
            {brl(totalImobiliaria)}
          </div>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            Retenção Connect Platz
          </span>
        </div>
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/60">
          <div className="flex items-center gap-3">
            <span>
              <strong>VGV Total:</strong> {brl(vgv)}
            </span>
            <span>•</span>
            <span>
              <strong>Comissão Bruta:</strong> {brl(comissaoTotal)}
            </span>
            {impostoValor > 0 && (
              <>
                <span>•</span>
                <span>
                  <strong>Imposto:</strong> {brl(impostoValor)} ({pct(impostoPercentual)})
                </span>
              </>
            )}
          </div>
          <span className="text-[10px] italic">
            *Lançamentos sincronizados automaticamente no Fluxo de Caixa.
          </span>
        </div>
      )}
    </div>
  );
}
