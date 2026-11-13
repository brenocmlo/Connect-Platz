import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  DEFAULT_VITRINE_SUBTITULO,
  DEFAULT_VITRINE_TITULO,
  FALLBACK_VITRINE_CATEGORIES,
  VITRINE_FALLBACK_PHOTO,
  deriveCardFromProperty,
  resolveVitrineShowcaseCards,
  type VitrineCardConfig,
} from "@/lib/domain/portal/vitrineShowcase";
import type { PropertyItem } from "@/components/portal/types";
import { PortalCategories } from "@/components/portal/PortalCategories";

let mockSettingsState = {
  settings: {
    whatsapp: "",
    email: "",
    corretorNome: "",
    creci: "",
    vitrineSubtitulo: DEFAULT_VITRINE_SUBTITULO,
    vitrineTitulo: DEFAULT_VITRINE_TITULO,
    vitrineCards: [] as VitrineCardConfig[],
  },
  loaded: true,
};

vi.mock("@/components/portal/PortalSettingsContext", () => ({
  usePortalSettingsState: () => mockSettingsState,
}));

function makeProperty(overrides: Partial<PropertyItem> & { id: string; nome: string }): PropertyItem {
  return {
    id: overrides.id,
    slug: overrides.id,
    nome: overrides.nome,
    modalidade: overrides.modalidade || "VERANEIO_TEMPORADA",
    bairro: overrides.bairro ?? "Porto das Dunas",
    cidade: overrides.cidade ?? "Aquiraz",
    fotos: overrides.fotos ?? ["https://cdn.connectplatz.com.br/imovel-real.webp"],
    valorDiaria: 1200,
    valorVenda: null,
  } as PropertyItem;
}

describe("Vitrine de Capítulos Editável & Imóveis Reais (vitrineShowcase + PortalCategories)", () => {
  beforeEach(() => {
    const noopObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    globalThis.ResizeObserver = noopObserver as unknown as typeof ResizeObserver;
    globalThis.IntersectionObserver = noopObserver as unknown as typeof IntersectionObserver;
    mockSettingsState = {
      settings: {
        whatsapp: "",
        email: "",
        corretorNome: "",
        creci: "",
        vitrineSubtitulo: DEFAULT_VITRINE_SUBTITULO,
        vitrineTitulo: DEFAULT_VITRINE_TITULO,
        vitrineCards: [],
      },
      loaded: true,
    };
  });

  it("deriva automaticamente um card editável a partir de um imóvel real", () => {
    const prop = makeProperty({
      id: "11111111-1111-4111-8111-111111111111",
      nome: "Villa Platz Beach Residence",
      modalidade: "VERANEIO_TEMPORADA",
      bairro: "Porto das Dunas",
      cidade: "Aquiraz",
    });

    const card = deriveCardFromProperty(prop);
    expect(card.propertyId).toBe(prop.id);
    expect(card.tag).toBe("Temporada");
    expect(card.eyebrow).toBe("Porto das Dunas • Aquiraz");
    expect(card.titulo).toBe("Villa Platz Beach Residence");
  });

  it("exibe automaticamente os imóveis reais publicados quando vitrineCards está vazio", () => {
    const props = [
      makeProperty({ id: "prop-1", nome: "Villa Platz Beach Residence", fotos: ["https://cdn.site/villa.webp"] }),
      makeProperty({ id: "prop-2", nome: "Edifício Beira Mar", modalidade: "VENDA", fotos: [] }),
    ];

    const resolved = resolveVitrineShowcaseCards([], props);
    expect(resolved).toHaveLength(2);
    expect(resolved[0].linkedProperty?.id).toBe("prop-1");
    expect(resolved[0].foto).toBe("https://cdn.site/villa.webp");
    expect(resolved[1].linkedProperty?.id).toBe("prop-2");
    expect(resolved[1].foto).toBe(VITRINE_FALLBACK_PHOTO);
  });

  it("aplica textos/foto customizados de cards configurados, ignora imóveis ocultos/excluídos e mantém cards de filtro", () => {
    const realProp = makeProperty({
      id: "prop-real",
      nome: "Laguna Residence",
      fotos: ["https://cdn.site/original.webp"],
    });

    const configured: VitrineCardConfig[] = [
      {
        id: "c1",
        propertyId: "prop-real",
        tag: "Pé na areia",
        eyebrow: "Aquiraz",
        titulo: "Laguna Frente Mar",
        foto: "https://cdn.site/capa-editada.webp",
      },
      {
        id: "c-ghost",
        propertyId: "prop-apagado-ou-oculto",
        tag: "Exclusivo",
        eyebrow: "Ceará",
        titulo: "Não deve aparecer",
      },
      {
        id: "c-filter",
        propertyId: "",
        tag: "Família",
        eyebrow: "Imóveis",
        titulo: "3 quartos ou mais",
        foto: "",
        modalidade: "VENDA",
        tipoImovel: "Apartamento",
        quartosMin: "3",
      },
    ];

    const resolved = resolveVitrineShowcaseCards(configured, [realProp]);
    expect(resolved).toHaveLength(2);
    expect(resolved[0].titulo).toBe("Laguna Frente Mar");
    expect(resolved[0].foto).toBe("https://cdn.site/capa-editada.webp");
    expect(resolved[0].linkedProperty?.id).toBe("prop-real");

    expect(resolved[1].linkedProperty).toBeUndefined();
    expect(resolved[1].filtros).toEqual({
      modalidade: "VENDA",
      tipoImovel: "Apartamento",
      quartosMin: "3",
    });
  });

  it("usa o fallback estático apenas quando não há configuração nem imóveis reais publicados", () => {
    expect(resolveVitrineShowcaseCards([], [])).toEqual(FALLBACK_VITRINE_CATEGORIES);
  });

  it("renderiza título customizado, card vinculado a imóvel real com abertura direta da ficha e card de filtro", () => {
    const prop = makeProperty({
      id: "prop-villa",
      nome: "Villa Platz Beach Residence",
      modalidade: "VERANEIO_TEMPORADA",
    });

    mockSettingsState = {
      loaded: true,
      settings: {
        ...mockSettingsState.settings,
        vitrineSubtitulo: "Destaques Reais Connect Platz",
        vitrineTitulo: "Escolha seu próximo imóvel",
        vitrineCards: [
          deriveCardFromProperty(prop),
          {
            id: "filtro-vendas",
            propertyId: "",
            tag: "Lançamentos",
            eyebrow: "Oportunidades",
            titulo: "Ver imóveis à venda",
            modalidade: "VENDA",
          },
        ],
      },
    };

    const onSelectProperty = vi.fn();
    const onPick = vi.fn();

    render(
      <PortalCategories
        properties={[prop]}
        loading={false}
        onSelectProperty={onSelectProperty}
        onPick={onPick}
      />
    );

    expect(screen.getByText("Destaques Reais Connect Platz")).toBeInTheDocument();
    expect(screen.getByText("Escolha seu próximo imóvel")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Villa Platz Beach Residence"));
    expect(onSelectProperty).toHaveBeenCalledTimes(1);
    expect(onSelectProperty).toHaveBeenCalledWith(expect.objectContaining({ id: "prop-villa" }));

    fireEvent.click(screen.getByText("Ver imóveis à venda"));
    expect(onPick).toHaveBeenCalledWith({ modalidade: "VENDA" });
  });
});
