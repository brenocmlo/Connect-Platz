"use client";

import React from "react";
import { ArrowDown, ArrowUp, EyeOff, Globe, Trash2 } from "lucide-react";
import type { PropertyCardData } from "./PropertyProductCard";
import { SiteVitrineCardPreview } from "./SiteVitrineCardPreview";
import { fieldInput, fieldLabel, fieldSelect, SelectWithChevron } from "./PropertyModalShell";
import {
  defaultShowcaseTag,
  formatShowcaseEyebrow,
  type VitrineCardConfig,
  type VitrineFilterModalidade,
} from "@/lib/domain/portal/vitrineShowcase";
import { BEDROOM_OPTIONS, PROPERTY_TYPES } from "@/components/portal/portalUtils";

interface SiteVitrineCardEditorRowProps {
  index: number;
  total: number;
  card: VitrineCardConfig;
  properties: PropertyCardData[];
  onChange: (updated: VitrineCardConfig) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onToggleLandingPage?: (id: string, current: boolean) => Promise<void>;
}

const MODALIDADE_FILTER_OPTIONS: { value: VitrineFilterModalidade; label: string }[] = [
  { value: "", label: "Todas as modalidades" },
  { value: "VENDA", label: "Compra / Venda" },
  { value: "VERANEIO", label: "Temporada" },
  { value: "ALUGUEL", label: "Aluguel Mensal" },
  { value: "REPASSE", label: "Repasse" },
];

export function SiteVitrineCardEditorRow({
  index,
  total,
  card,
  properties,
  onChange,
  onMove,
  onRemove,
  onToggleLandingPage,
}: SiteVitrineCardEditorRowProps) {
  const linked = card.propertyId ? properties.find((p) => p.id === card.propertyId) : undefined;
  const hasOrphanPropertyRef = Boolean(card.propertyId && !linked);
  const previewFoto = (card.foto || "").trim() || linked?.fotos?.[0] || "";
  const isLinkedHidden = Boolean(linked && linked.exibirNaLandingPage === false);

  const handlePropertySelect = (propertyId: string) => {
    if (!propertyId) {
      onChange({ ...card, propertyId: "" });
      return;
    }
    const target = properties.find((p) => p.id === propertyId);
    if (!target) {
      onChange({ ...card, propertyId });
      return;
    }
    onChange({
      ...card,
      propertyId: target.id,
      tag: defaultShowcaseTag(target),
      eyebrow: formatShowcaseEyebrow(target),
      titulo: target.nome.slice(0, 80),
      foto: "",
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:border-connect-blue/30">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-connect-blue/15 px-2 text-[11px] font-black text-connect-blue">
            #{index + 1}
          </span>
          <span className="text-xs font-bold text-foreground">
            {linked
              ? `Imóvel Real: ${linked.nome}`
              : card.propertyId
              ? "Imóvel de outra vertical / inativo"
              : "Card por Filtro"}
          </span>
          {isLinkedHidden && onToggleLandingPage && linked && (
            <button
              type="button"
              onClick={() => onToggleLandingPage(linked.id, false)}
              className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
              title="Este imóvel está oculto do site. Clique para publicar."
            >
              <EyeOff className="h-3 w-3" />
              Oculto no site — Publicar agora
            </button>
          )}
          {linked && linked.exibirNaLandingPage !== false && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <Globe className="h-3 w-3" /> Publicado
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label={`Mover card ${index + 1} para cima`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            aria-label={`Mover card ${index + 1} para baixo`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remover card ${index + 1}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/25 bg-red-500/5 text-red-600 hover:bg-red-600 hover:text-white dark:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[190px_1fr]">
        <SiteVitrineCardPreview
          titulo={card.titulo}
          tag={card.tag}
          eyebrow={card.eyebrow}
          previewFoto={previewFoto}
          hasCustomFoto={Boolean(card.foto)}
          hasLinkedProperty={Boolean(linked)}
          onChangeFoto={(foto) => onChange({ ...card, foto })}
        />

        <div className="space-y-3">
          <div>
            <label htmlFor={`card-prop-${card.id}`} className={fieldLabel}>
              Imóvel Real Vinculado
            </label>
            <SelectWithChevron>
              <select
                id={`card-prop-${card.id}`}
                value={card.propertyId || ""}
                onChange={(e) => handlePropertySelect(e.target.value)}
                className={fieldSelect}
              >
                <option value="">🔍 Modo Filtro de Busca (sem imóvel fixo)</option>
                {hasOrphanPropertyRef && (
                  <option value={card.propertyId}>
                    Imóvel vinculado ({card.titulo || card.propertyId?.slice(0, 8)}) — outra vertical/inativo
                  </option>
                )}
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — {[p.bairro, p.cidade].filter(Boolean).join(", ") || "Sem localização"}
                    {p.exibirNaLandingPage === false ? " (Oculto no site)" : ""}
                  </option>
                ))}
              </select>
            </SelectWithChevron>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor={`card-tag-${card.id}`} className={fieldLabel}>
                Etiqueta (Tag)
              </label>
              <input
                id={`card-tag-${card.id}`}
                type="text"
                maxLength={40}
                value={card.tag}
                onChange={(e) => onChange({ ...card, tag: e.target.value })}
                placeholder="Ex: Pé na areia"
                className={fieldInput}
              />
            </div>

            <div>
              <label htmlFor={`card-eyebrow-${card.id}`} className={fieldLabel}>
                Rótulo Superior
              </label>
              <input
                id={`card-eyebrow-${card.id}`}
                type="text"
                maxLength={40}
                value={card.eyebrow}
                onChange={(e) => onChange({ ...card, eyebrow: e.target.value })}
                placeholder="Ex: Imóveis ou Bairro"
                className={fieldInput}
              />
            </div>

            <div>
              <label htmlFor={`card-title-${card.id}`} className={fieldLabel}>
                Título do Card *
              </label>
              <input
                id={`card-title-${card.id}`}
                type="text"
                maxLength={80}
                value={card.titulo}
                onChange={(e) => onChange({ ...card, titulo: e.target.value })}
                placeholder="Nome do imóvel ou chamada"
                className={fieldInput}
              />
            </div>
          </div>

          {!card.propertyId && (
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-border/70 bg-background/60 p-3 sm:grid-cols-3">
              <div>
                <label htmlFor={`card-mod-${card.id}`} className={fieldLabel}>
                  Modalidade do Filtro
                </label>
                <SelectWithChevron>
                  <select
                    id={`card-mod-${card.id}`}
                    value={card.modalidade || ""}
                    onChange={(e) => onChange({ ...card, modalidade: e.target.value as VitrineFilterModalidade })}
                    className={fieldSelect}
                  >
                    {MODALIDADE_FILTER_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </SelectWithChevron>
              </div>
              <div>
                <label htmlFor={`card-tipo-${card.id}`} className={fieldLabel}>
                  Tipo de Imóvel
                </label>
                <SelectWithChevron>
                  <select
                    id={`card-tipo-${card.id}`}
                    value={card.tipoImovel || "TODOS"}
                    onChange={(e) => onChange({ ...card, tipoImovel: e.target.value })}
                    className={fieldSelect}
                  >
                    {PROPERTY_TYPES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </SelectWithChevron>
              </div>
              <div>
                <label htmlFor={`card-qts-${card.id}`} className={fieldLabel}>
                  Quartos Mínimos
                </label>
                <SelectWithChevron>
                  <select
                    id={`card-qts-${card.id}`}
                    value={card.quartosMin || ""}
                    onChange={(e) => onChange({ ...card, quartosMin: e.target.value })}
                    className={fieldSelect}
                  >
                    {BEDROOM_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value === "TODOS" ? "" : o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </SelectWithChevron>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
