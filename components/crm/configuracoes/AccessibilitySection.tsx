"use client";

import React from "react";
import {
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Eye,
  Sliders,
  Sparkles,
} from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { useCrm, FontSizePreference } from "@/components/crm/CrmContext";
import { ScoreBadge } from "@/components/crm/primitives/ScoreBadge";

interface FontOption {
  id: FontSizePreference;
  label: string;
  percent: string;
  badge: string;
  description: string;
  sampleClass: string;
}

const fontOptions: FontOption[] = [
  {
    id: "small",
    label: "Pequena",
    percent: "87.5% (14px)",
    badge: "Compacta",
    description: "Mais densidade de dados na tela. Ideal para ver mais colunas no Kanban e tabelas sem rolar.",
    sampleClass: "text-xs font-medium",
  },
  {
    id: "normal",
    label: "Padrão",
    percent: "100% (16px)",
    badge: "Recomendado",
    description: "Tamanho de escala oficial do Connect Platz CRM, balanceado para nitidez e proporção.",
    sampleClass: "text-sm font-semibold",
  },
  {
    id: "large",
    label: "Grande",
    percent: "112.5% (18px)",
    badge: "Confortável",
    description: "Fontes aumentadas para leitura mais relaxada e alívio do cansaço visual em rotinas intensas.",
    sampleClass: "text-base font-bold",
  },
  {
    id: "extra-large",
    label: "Extra Grande",
    percent: "125% (20px)",
    badge: "Ampliada",
    description: "Máxima legibilidade e alto contraste tipográfico para facilitar a visualização em qualquer tela.",
    sampleClass: "text-lg font-extrabold",
  },
];

export function AccessibilitySection() {
  const {
    fontSize,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    setActionMessage,
  } = useCrm();

  const handleSelectSize = (size: FontSizePreference, label: string) => {
    setFontSize(size);
    setActionMessage(`Acessibilidade: Escala de fonte definida como ${label}!`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleIncrease = () => {
    increaseFontSize();
    setActionMessage("Fonte aumentada (+1 nível)");
    setTimeout(() => setActionMessage(null), 2500);
  };

  const handleDecrease = () => {
    decreaseFontSize();
    setActionMessage("Fonte reduzida (-1 nível)");
    setTimeout(() => setActionMessage(null), 2500);
  };

  const handleReset = () => {
    resetFontSize();
    setActionMessage("Fonte restaurada para o padrão (100%)");
    setTimeout(() => setActionMessage(null), 2500);
  };

  const activeOption = fontOptions.find((opt) => opt.id === fontSize) || fontOptions[1];

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
      {/* 1. TÍTULO E EXPLICAÇÃO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <SectionTitle title="Acessibilidade & Escala Tipográfica" />
          <p className="text-xs text-muted-foreground mt-1">
            Aumente ou reduza o tamanho das fontes de todo o CRM de acordo com sua preferência visual.
          </p>
        </div>

        {/* Toolbar de Ações Rápidas A- / A+ */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 border border-border rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={fontSize === "small"}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-foreground hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Reduzir tamanho da fonte (A-)"
          >
            <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
            <span>A-</span>
          </button>

          <span className="px-2 py-1 text-[11px] font-bold text-connect-blue bg-connect-blue/10 rounded-md whitespace-nowrap">
            {activeOption.percent.split(" ")[0]}
          </span>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={fontSize === "extra-large"}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-foreground hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Aumentar tamanho da fonte (A+)"
          >
            <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
            <span>A+</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={fontSize === "normal"}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-all ml-1"
            title="Restaurar tamanho padrão (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. GRID DE OPÇÕES DE TAMANHO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {fontOptions.map((opt) => {
          const isSelected = fontSize === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectSize(opt.id, opt.label)}
              className={`text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between gap-3 ${
                isSelected
                  ? "border-connect-blue bg-connect-blue/5 shadow-sm shadow-connect-blue/10 ring-1 ring-connect-blue"
                  : "border-border bg-background/50 hover:bg-muted/40 hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? "bg-connect-blue text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className={opt.sampleClass}>Aa</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{opt.label}</h4>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {opt.percent}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-connect-blue text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {opt.badge === "Recomendado" && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Padrão
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* 3. ÁREA DE PRÉ-VISUALIZAÇÃO EM TEMPO REAL */}
      <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Eye className="w-4 h-4 text-connect-blue" />
            <span>Exemplo em Tempo Real ({activeOption.label} — {activeOption.percent})</span>
          </div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Atualização instantânea
          </span>
        </div>

        {/* Card de Simulação */}
        <div className="bg-card border border-border rounded-lg p-3.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-connect-blue text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                RV
              </div>
              <div>
                <span className="font-bold text-foreground block">
                  Dr. Roberto Vasconcelos
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Interesse: Reserva Imperial • Há 12 minutos
                </span>
              </div>
            </div>
            <ScoreBadge score={88} size="sm" showLabel={true} />
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Oportunidade estimada:
            </span>
            <span className="font-bold text-connect-blue">
              R$ 850.000,00
            </span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground italic">
          Nota: O tamanho escolhido é salvo no seu navegador e aplicado automaticamente em todas as telas, cards de leads, relatórios e menus do CRM.
        </p>
      </div>
    </div>
  );
}
