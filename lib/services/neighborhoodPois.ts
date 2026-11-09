// lib/services/neighborhoodPois.ts
// Catálogo e resolvedor dinâmico de Pontos de Interesse (POIs) e Mobilidade Urbana por Bairro.

export type PoiIconType = "beach" | "shopping" | "food" | "route" | "nature";

export interface PoiItem {
  label: string;
  iconType: PoiIconType;
}

export const REGIONAL_POIS: Record<string, PoiItem[]> = {
  "Meireles": [
    { label: "A 200m da Praia do Meireles e Feirinha Beira-Mar", iconType: "beach" },
    { label: "Polo Gastronômico da Varjota e Aldeota", iconType: "food" },
    { label: "A 10 min do Shopping Iguatemi Bosque", iconType: "shopping" },
    { label: "Acesso expresso pela Av. Abolição e Santos Dumont", iconType: "route" },
  ],
  "Aldeota": [
    { label: "A 300m da icônica Praça Portugal", iconType: "nature" },
    { label: "Shopping Aldeota e Del Paseo a 5 minutos", iconType: "shopping" },
    { label: "Centro Financeiro, Clínicas e Hospitais de Referência", iconType: "route" },
    { label: "Bistrôs e Restaurantes de Alta Gastronomia", iconType: "food" },
  ],
  "Mucuripe": [
    { label: "Frente Mar Absoluta da Enseada do Mucuripe", iconType: "beach" },
    { label: "Iate Clube de Fortaleza a 300 metros", iconType: "nature" },
    { label: "Mercado dos Peixes e Orla Gastronômica", iconType: "food" },
    { label: "Ciclovia e Calçadão da Av. Beira-Mar", iconType: "route" },
  ],
  "Cocó": [
    { label: "Em frente ao Parque Ecológico do Cocó", iconType: "nature" },
    { label: "A 4 minutos do Shopping Iguatemi Bosque", iconType: "shopping" },
    { label: "Eixo Corporativo Av. Santos Dumont", iconType: "route" },
    { label: "Complexo Hospitalar e Centros Médicos", iconType: "food" },
  ],
  "Porto das Dunas": [
    { label: "A 400m do Beach Park e Pé na Areia", iconType: "beach" },
    { label: "A 20 minutos de Fortaleza pela Rodovia CE-025", iconType: "route" },
    { label: "Complexo de Resorts e Beach Club Exclusivo", iconType: "food" },
    { label: "Vila Azul do Mar e Polo Turístico", iconType: "shopping" },
  ],
  "Praia do Japão": [
    { label: "Praia preservada com acesso pé na areia", iconType: "beach" },
    { label: "Resort fechado com segurança armada 24h", iconType: "nature" },
    { label: "Acesso duplicado e rápido pela CE-025", iconType: "route" },
    { label: "A 10 minutos da rota dos Resorts de Aquiraz", iconType: "shopping" },
  ],
  "Alphaville": [
    { label: "Condomínio Fechado com Alta Segurança e Lago", iconType: "nature" },
    { label: "Alphaville Mall e Mercadinhos São Luiz", iconType: "shopping" },
    { label: "Colégios Bilíngues e Colégio Christus Eusébio", iconType: "food" },
    { label: "Acesso rápido e direto à Rodovia CE-040", iconType: "route" },
  ],
  "Cumbuco": [
    { label: "Meca Mundial do Kitesurf e Ventos Alísios", iconType: "beach" },
    { label: "Dunas do Cumbuco e Lagoa do Banana", iconType: "nature" },
    { label: "Vila Charmosa com Culinária Internacional", iconType: "food" },
    { label: "A 35 minutos de Fortaleza via Rodovia Estruturante", iconType: "route" },
  ],
  "Dionísio Torres": [
    { label: "Eixo nobre entre Aldeota e Parque do Cocó", iconType: "nature" },
    { label: "A 5 minutos do Shopping Iguatemi Bosque", iconType: "shopping" },
    { label: "Polo corporativo da Av. Desembargador Moreira", iconType: "route" },
    { label: "Clínicas especializadas e alta gastronomia", iconType: "food" },
  ],
  "Papicu": [
    { label: "Ao lado do Shopping RioMar Fortaleza", iconType: "shopping" },
    { label: "Hub de transporte e VLT com ligação à Beira-Mar", iconType: "route" },
    { label: "Hospital São Mateus e centros médicos", iconType: "food" },
    { label: "A 5 minutos da Praia do Futuro", iconType: "beach" },
  ],
  "Guararapes": [
    { label: "Em frente ao Shopping Iguatemi Bosque", iconType: "shopping" },
    { label: "Ao lado da Unifor e Centro de Eventos do Ceará", iconType: "nature" },
    { label: "Eixo Av. Washington Soares com ligação expressa ao Eusébio", iconType: "route" },
    { label: "Supermercados premium e serviços completos", iconType: "food" },
  ],
  "Varjota": [
    { label: "Principal Polo Gastronômico da cidade", iconType: "food" },
    { label: "A 500m da Beira-Mar e Praia do Meireles", iconType: "beach" },
    { label: "Acesso rápido pela Av. Dom Luís e Abolição", iconType: "route" },
    { label: "Comércio de charme e conveniências 24h", iconType: "shopping" },
  ],
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Encontra a chave exata em REGIONAL_POIS ignorando maiúsculas e acentos.
 */
export function findMatchingPoiNeighborhood(bairroName?: string | null): string | null {
  if (!bairroName || !bairroName.trim()) return null;
  const target = normalizeText(bairroName);

  for (const key of Object.keys(REGIONAL_POIS)) {
    if (normalizeText(key) === target) return key;
  }
  return null;
}

/**
 * Resolve os Pontos de Interesse (POIs) de forma determinística:
 * 1. Se o imóvel possui POIs customizados no cadastro, prioriza-os.
 * 2. Se o bairro está mapeado, usa a curadoria regional.
 * 3. Se for um bairro novo, gera referências metropolitanas dinâmicas da localidade.
 */
export function resolveNeighborhoodPois(params: {
  bairro?: string | null;
  cidade?: string | null;
  customPois?: Array<{ nome: string; distancia?: string }>;
}): PoiItem[] {
  const { bairro, cidade, customPois } = params;

  if (Array.isArray(customPois) && customPois.length > 0) {
    return customPois.map((p) => ({
      label: p.distancia ? `${p.nome} (${p.distancia})` : p.nome,
      iconType: "route",
    }));
  }

  const matchedKey = findMatchingPoiNeighborhood(bairro);
  if (matchedKey && REGIONAL_POIS[matchedKey]) {
    return REGIONAL_POIS[matchedKey];
  }

  if (!bairro && !cidade) return [];

  const locNome = (bairro || cidade || "").trim();
  const cidNome = (cidade || "Fortaleza").trim();

  return [
    {
      label: `Acesso aos principais eixos viários e comerciais de ${cidNome}`,
      iconType: "route",
    },
    {
      label: `Região servida por rede de comércios e conveniências em ${locNome}`,
      iconType: "shopping",
    },
    {
      label: `Conexão expressa com polos de serviços e gastronomia da região`,
      iconType: "food",
    },
    {
      label: `Vetor de valorização imobiliária e mobilidade urbana`,
      iconType: "nature",
    },
  ];
}
