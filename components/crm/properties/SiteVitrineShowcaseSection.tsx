"use client";

import React from "react";
import { LayoutGrid, Plus, RotateCcw, Sparkles } from "lucide-react";
import type { PropertyCardData } from "./PropertyProductCard";
import { SiteVitrineCardEditorRow } from "./SiteVitrineCardEditorRow";
import { fieldInput, fieldLabel } from "./PropertyModalShell";
import {
  DEFAULT_VITRINE_SUBTITULO,
  DEFAULT_VITRINE_TITULO,
  deriveCardFromProperty,
  type VitrineCardConfig,
} from "@/lib/domain/portal/vitrineShowcase";

interface SiteVitrineShowcaseSectionProps {
  vitrineSubtitulo: string;
  setVitrineSubtitulo: (v: string) => void;
  vitrineTitulo: string;
  setVitrineTitulo: (v: string) => void;
  vitrineCards: VitrineCardConfig[];
  setVitrineCards: React.Dispatch<React.SetStateAction<VitrineCardConfig[]>>;
  properties: PropertyCardData[];
  onToggleLandingPage?: (id: string, current: boolean) => Promise<void>;
}

const MAX_SHOWCASE_CARDS = 12;

export function SiteVitrineShowcaseSection({
  vitrineSubtitulo,
  setVitrineSubtitulo,
  vitrineTitulo,
  setVitrineTitulo,
  vitrineCards,
  setVitrineCards,
  properties,
  onToggleLandingPage,
}: SiteVitrineShowcaseSectionProps) {
  const handleLoadFromCatalog = () => {
    const publishedFirst = [
      ...properties.filter((p) => p.exibirNaLandingPage !== false),
      ...properties.filter((p) => p.exibirNaLandingPage === false),
    ];
    const derived = publishedFirst.slice(0, 6).map((p) => ({
      ...deriveCardFromProperty(p),
      id: `card-${p.id}-${Date.now().toString(36)}`,
    }));
    setVitrineCards(derived);
  };

  const handleAddCard = () => {
    if (vitrineCards.length >= MAX_SHOWCASE_CARDS) return;
    const usedIds = new Set(vitrineCards.map((c) => c.propertyId).filter(Boolean));
    const nextProp = properties.find((p) => !usedIds.has(p.id)) || properties[0];

    const newCard: VitrineCardConfig = nextProp
      ? { ...deriveCardFromProperty(nextProp), id: `card-${Date.now().toString(36)}-${vitrineCards.length + 1}` }
      : {
          id: `card-${Date.now().toString(36)}-${vitrineCards.length + 1}`,
          propertyId: "",
          tag: "Destaque",
          eyebrow: "Imóveis",
          titulo: "Imóveis Selecionados",
          foto: "",
          modalidade: "",
          tipoImovel: "TODOS",
          quartosMin: "",
        };

    setVitrineCards((prev) => [...prev, newCard]);
  };

  const handleMove = (idx: number, dir: -1 | 1) => {
    setVitrineCards((prev) => {
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.splice(nextIdx, 0, moved);
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <LayoutGrid className="h-4 w-4 text-connect-blue" />
            <span>Vitrine de Capítulos (Seção &ldquo;Sua vida mudou de fase?&rdquo;)</span>
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Edite os títulos e vincule imóveis reais do catálogo para substituir imagens genéricas por ofertas reais.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {properties.length > 0 && (
            <button
              type="button"
              onClick={handleLoadFromCatalog}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-platz-gold/40 bg-platz-gold/10 px-3 text-xs font-bold text-amber-700 transition-colors hover:bg-platz-gold/20 dark:text-platz-gold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Carregar Imóveis Reais</span>
            </button>
          )}
          {vitrineCards.length > 0 && (
            <button
              type="button"
              onClick={() => setVitrineCards([])}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
              title="Limpar seleção manual para exibir automaticamente os imóveis publicados"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Modo Automático</span>
            </button>
          )}
          <button
            type="button"
            disabled={vitrineCards.length >= MAX_SHOWCASE_CARDS}
            onClick={handleAddCard}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-connect-blue px-3.5 text-xs font-bold text-white shadow-sm shadow-connect-blue/25 transition-all hover:bg-connect-deep-blue disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Adicionar Card</span>
          </button>
        </div>
      </div>

      {/* Textos Principais da Seção */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="vitrine-subtitulo" className={fieldLabel}>
            Subtítulo da Seção (Linha em Itálico)
          </label>
          <input
            id="vitrine-subtitulo"
            type="text"
            maxLength={160}
            value={vitrineSubtitulo}
            onChange={(e) => setVitrineSubtitulo(e.target.value)}
            placeholder={DEFAULT_VITRINE_SUBTITULO}
            className={fieldInput}
          />
        </div>
        <div>
          <label htmlFor="vitrine-titulo" className={fieldLabel}>
            Título Principal da Vitrine
          </label>
          <input
            id="vitrine-titulo"
            type="text"
            maxLength={200}
            value={vitrineTitulo}
            onChange={(e) => setVitrineTitulo(e.target.value)}
            placeholder={DEFAULT_VITRINE_TITULO}
            className={fieldInput}
          />
        </div>
      </div>

      {/* Lista de Cards Editáveis ou Estado Automático */}
      {vitrineCards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center space-y-3">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-connect-blue/10 text-connect-blue">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="mx-auto max-w-lg space-y-1">
            <p className="text-xs font-bold text-foreground">
              Modo Automático por Imóveis Reais Ativo
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Enquanto nenhum card personalizado estiver configurado abaixo, o portal exibirá automaticamente os seus{" "}
              <strong>imóveis reais publicados na vitrine</strong> (com fotos, bairros e abertura direta da ficha ao
              clicar). Você pode importar ou montar cards sob medida clicando abaixo.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {properties.length > 0 && (
              <button
                type="button"
                onClick={handleLoadFromCatalog}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-connect-blue px-4 text-xs font-bold text-white shadow-sm hover:bg-connect-deep-blue"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Importar Imóveis Reais para Editar</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleAddCard}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-4 text-xs font-bold text-foreground hover:bg-muted"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Criar Card Manualmente</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {vitrineCards.map((card, idx) => (
            <SiteVitrineCardEditorRow
              key={card.id}
              index={idx}
              total={vitrineCards.length}
              card={card}
              properties={properties}
              onChange={(updated) =>
                setVitrineCards((prev) => prev.map((c, i) => (i === idx ? updated : c)))
              }
              onMove={(dir) => handleMove(idx, dir)}
              onRemove={() =>
                setVitrineCards((prev) => prev.filter((_, i) => i !== idx))
              }
              onToggleLandingPage={onToggleLandingPage}
            />
          ))}
          <p className="text-[11px] text-muted-foreground">
            Mostrando {vitrineCards.length} de {MAX_SHOWCASE_CARDS} cards possíveis. Clique em{" "}
            <strong className="text-foreground">Salvar Alterações</strong> no topo para publicar no site.
          </p>
        </div>
      )}
    </div>
  );
}
