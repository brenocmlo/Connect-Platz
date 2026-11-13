import type { PortalFilters, PropertyItem } from "@/components/portal/types";

export type VitrineFilterModalidade = "" | "VENDA" | "ALUGUEL" | "VERANEIO" | "REPASSE";

export interface VitrineCardConfig {
  id: string;
  propertyId?: string;
  tag: string;
  eyebrow: string;
  titulo: string;
  foto?: string;
  modalidade?: VitrineFilterModalidade;
  tipoImovel?: string;
  quartosMin?: string;
}

export interface ResolvedVitrineCard {
  id: string;
  tag: string;
  eyebrow: string;
  titulo: string;
  foto: string;
  linkedProperty?: PropertyItem;
  filtros?: Partial<PortalFilters>;
}

export const DEFAULT_VITRINE_SUBTITULO = "Sua vida mudou de fase?";
export const DEFAULT_VITRINE_TITULO = "Encontre o imóvel certo para o próximo capítulo.";
export const VITRINE_FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=75`;

export const FALLBACK_VITRINE_CATEGORIES: ResolvedVitrineCard[] = [
  {
    id: "fallback-pe-na-areia",
    tag: "Pé na areia",
    eyebrow: "Imóveis",
    titulo: "Casas de praia",
    foto: unsplash("photo-1499793983690-e29da59ef1c2"),
    filtros: { modalidade: "VERANEIO", tipoImovel: "Beach" },
  },
  {
    id: "fallback-compactos",
    tag: "Compactos",
    eyebrow: "Imóveis",
    titulo: "Studios e apartamentos",
    foto: unsplash("photo-1502672260266-1c1ef2d93688"),
    filtros: { modalidade: "VENDA", tipoImovel: "Apartamento" },
  },
  {
    id: "fallback-familia",
    tag: "Família",
    eyebrow: "Imóveis",
    titulo: "Três quartos ou mais",
    foto: unsplash("photo-1600585154340-be6161a56a0c"),
    filtros: { quartosMin: "3" },
  },
  {
    id: "fallback-exclusivos",
    tag: "Exclusivos",
    eyebrow: "Imóveis",
    titulo: "Coberturas",
    foto: unsplash("photo-1600607687939-ce8a6c25118c"),
    filtros: { tipoImovel: "Cobertura" },
  },
  {
    id: "fallback-condominio",
    tag: "Condomínio",
    eyebrow: "Imóveis",
    titulo: "Casas e villas",
    foto: unsplash("photo-1564013799919-ab600027ffc6"),
    filtros: { tipoImovel: "Casa" },
  },
  {
    id: "fallback-ferias",
    tag: "Férias",
    eyebrow: "Imóveis",
    titulo: "Temporada no litoral",
    foto: unsplash("photo-1560448204-e02f11c3d0e2"),
    filtros: { modalidade: "VERANEIO" },
  },
];

type PropertyLike = {
  id: string;
  nome: string;
  modalidade?: string | null;
  estagioObra?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  fotos?: string[];
};

export function defaultShowcaseTag(p: PropertyLike): string {
  if (p.modalidade === "VERANEIO_TEMPORADA" || p.modalidade === "VERANEIO") return "Temporada";
  if (p.modalidade === "LOCACAO_ANUAL") return "Locação";
  if (p.modalidade === "REPASSE") return "Repasse";
  if (p.modalidade === "AMBOS") return "Venda & Temporada";
  if (p.estagioObra && p.estagioObra.trim()) return p.estagioObra.trim().slice(0, 28);
  return "Venda";
}

export function formatShowcaseEyebrow(p: PropertyLike): string {
  const local = [p.bairro, p.cidade].filter(Boolean).join(" • ");
  return local ? local.slice(0, 40) : "Imóveis";
}

/** Constrói um card editável para o editor do CRM a partir de um imóvel real do catálogo. */
export function deriveCardFromProperty(p: PropertyLike): VitrineCardConfig {
  return {
    id: `card-${p.id}`,
    propertyId: p.id,
    tag: defaultShowcaseTag(p),
    eyebrow: formatShowcaseEyebrow(p),
    titulo: p.nome.slice(0, 80),
    foto: "",
    modalidade: "",
    tipoImovel: "TODOS",
    quartosMin: "",
  };
}

function buildFilterPayload(card: VitrineCardConfig): Partial<PortalFilters> {
  const filtros: Partial<PortalFilters> = {};
  if (card.modalidade) filtros.modalidade = card.modalidade;
  if (card.tipoImovel && card.tipoImovel !== "TODOS") filtros.tipoImovel = card.tipoImovel;
  if (card.quartosMin) filtros.quartosMin = card.quartosMin;
  return filtros;
}

/** Resolve os cards exibidos na vitrine pública a partir da configuração salva e dos imóveis reais ativos. */
export function resolveVitrineShowcaseCards(
  configuredCards: VitrineCardConfig[] | undefined,
  properties: PropertyItem[]
): ResolvedVitrineCard[] {
  const byId = new Map(properties.map((p) => [p.id, p]));

  if (configuredCards && configuredCards.length > 0) {
    const resolved: ResolvedVitrineCard[] = [];

    for (const card of configuredCards) {
      if (card.propertyId) {
        const linked = byId.get(card.propertyId);
        // Se o imóvel vinculado foi apagado, desativado ou ocultado do site, não exibe item fantasma.
        if (!linked) continue;

        resolved.push({
          id: card.id || linked.id,
          tag: card.tag.trim() || defaultShowcaseTag(linked),
          eyebrow: card.eyebrow.trim() || formatShowcaseEyebrow(linked),
          titulo: card.titulo.trim() || linked.nome,
          foto: (card.foto || "").trim() || linked.fotos?.[0] || VITRINE_FALLBACK_PHOTO,
          linkedProperty: linked,
        });
      } else {
        resolved.push({
          id: card.id || card.titulo,
          tag: card.tag.trim() || "Destaque",
          eyebrow: card.eyebrow.trim() || "Imóveis",
          titulo: card.titulo.trim() || "Ver imóveis",
          foto: (card.foto || "").trim() || VITRINE_FALLBACK_PHOTO,
          filtros: buildFilterPayload(card),
        });
      }
    }

    if (resolved.length > 0) return resolved;
  }

  // Sem cards configurados (ou todos os vinculados ocultos): prioriza imóveis reais publicados no portal.
  if (properties.length > 0) {
    return properties.slice(0, 8).map((p) => ({
      id: p.id,
      tag: defaultShowcaseTag(p),
      eyebrow: formatShowcaseEyebrow(p),
      titulo: p.nome,
      foto: p.fotos?.[0] || VITRINE_FALLBACK_PHOTO,
      linkedProperty: p,
    }));
  }

  return FALLBACK_VITRINE_CATEGORIES;
}
