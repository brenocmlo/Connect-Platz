export interface LocationData {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude?: number;
  longitude?: number;
  service?: "brasilapi" | "viacep" | "cache" | "nominatim" | "geocoded";
}

export interface PropertyLocationEnriched extends LocationData {
  addressFormatted: string;
  wazeUrl: string;
  googleMapsUrl: string;
  osmEmbedUrl: string;
  pois: { label: string; iconType: "beach" | "shopping" | "food" | "route" | "nature" }[];
}

// Cache em memória para evitar requisições redundantes durante digitação
const cepCache = new Map<string, LocationData>();

// Mapeamento de CEPs para empreendimentos de referência da imobiliária
export const KNOWN_PROPERTY_CEPS: Record<string, string> = {
  "edificio-platinum-meireles": "60165070",
  "residencial-jardins-de-platz": "60170151",
  "cobertura-beira-mar-fortaleza": "60165121",
  "platz-business-tower": "60175047",
  "villa-platz-beach-residence": "61700000",
  "casa-mandara-beach-resort": "61700000",
  "mansao-alphaville-eusebio": "61760000",
  "villa-cumbuco-kitesurf-paradise": "61619000",
};

// Mapeamento de CEPs por Bairro (Ceará)
export const NEIGHBORHOOD_CEPS: Record<string, string> = {
  "Meireles": "60165070",
  "Aldeota": "60170151",
  "Mucuripe": "60165121",
  "Cocó": "60175047",
  "Porto das Dunas": "61700000",
  "Praia do Japão": "61700000",
  "Alphaville": "61760000",
  "Cumbuco": "61619000",
  "Praia de Iracema": "60060000",
  "Varjota": "60175000",
};

// Bairros mais frequentes da imobiliária para sugestão rápida
export const REGIONAL_NEIGHBORHOODS: Record<string, string[]> = {
  Fortaleza: [
    "Meireles",
    "Aldeota",
    "Mucuripe",
    "Cocó",
    "Praia de Iracema",
    "Dionísio Torres",
    "Varjota",
    "Guararapes",
    "Fátima",
    "Papicu",
    "Engenheiro Luciano Cavalcante",
  ],
  Aquiraz: [
    "Porto das Dunas",
    "Prainha",
    "Centro",
    "Camocim",
    "Japuara",
    "Iguape",
  ],
  Eusébio: [
    "Centro",
    "Urucunema",
    "Coaçu",
    "Tamandatuba",
    "Mangabeira",
    "Amador",
  ],
};

// Coordenadas geográficas de referência por bairro/região
export const REGIONAL_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Meireles": { lat: -3.7280338, lng: -38.4968518 },
  "Aldeota": { lat: -3.7375210, lng: -38.4990420 },
  "Mucuripe": { lat: -3.7214150, lng: -38.4815230 },
  "Cocó": { lat: -3.7483120, lng: -38.4831450 },
  "Porto das Dunas": { lat: -3.8340120, lng: -38.3890210 },
  "Praia do Japão": { lat: -3.8560340, lng: -38.3610450 },
  "Alphaville": { lat: -3.8820450, lng: -38.4550120 },
  "Cumbuco": { lat: -3.6260120, lng: -38.7310450 },
  "Fortaleza": { lat: -3.7319, lng: -38.5267 },
  "Aquiraz": { lat: -3.9031, lng: -38.3911 },
  "Eusébio": { lat: -3.8906, lng: -38.4528 },
  "Caucaia": { lat: -3.7361, lng: -38.6531 },
};

// Pontos de Interesse (POIs) e Mobilidade por Bairro/Região
export const REGIONAL_POIS: Record<string, { label: string; iconType: "beach" | "shopping" | "food" | "route" | "nature" }[]> = {
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
};

/**
 * Formata string para máscara de CEP: 00000-000
 */
export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * Busca dados de endereço e coordenadas via BrasilAPI (v2) com fallback para ViaCEP
 */
export async function fetchAddressByCep(cepInput: string): Promise<LocationData | null> {
  const cleanCep = cepInput.replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;

  if (cepCache.has(cleanCep)) {
    return cepCache.get(cleanCep)!;
  }

  // 1. Consulta BrasilAPI v2 (retorna coordenadas de latitude e longitude)
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data = await res.json();
      const rawLat = data.location?.coordinates?.latitude;
      const rawLng = data.location?.coordinates?.longitude;
      const lat = rawLat ? Number(rawLat) : undefined;
      const lng = rawLng ? Number(rawLng) : undefined;

      const result: LocationData = {
        cep: cleanCep,
        logradouro: data.street || "",
        bairro: data.neighborhood || "",
        cidade: data.city || "",
        uf: data.state || "",
        latitude: lat && !isNaN(lat) ? lat : undefined,
        longitude: lng && !isNaN(lng) ? lng : undefined,
        service: "brasilapi",
      };

      cepCache.set(cleanCep, result);
      return result;
    }
  } catch {
    // Fallback gracioso para ViaCEP
  }

  // 2. Fallback: ViaCEP
  try {
    const resFallback = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
      headers: { Accept: "application/json" },
    });

    if (resFallback.ok) {
      const data = await resFallback.json();
      if (!data.erro) {
        const result: LocationData = {
          cep: cleanCep,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          uf: data.uf || "",
          service: "viacep",
        };

        cepCache.set(cleanCep, result);
        return result;
      }
    }
  } catch {
    // Falha silenciosa
  }

  return null;
}

/**
 * Gera URL de navegação direta para o Waze
 */
export function getWazeNavigationUrl(params: {
  latitude?: number;
  longitude?: number;
  address?: string;
}): string {
  if (params.latitude && params.longitude) {
    return `https://waze.com/ul?ll=${params.latitude},${params.longitude}&navigate=yes`;
  }
  const query = encodeURIComponent(params.address || "Fortaleza, CE");
  return `https://waze.com/ul?q=${query}&navigate=yes`;
}

/**
 * Gera URL de navegação direta para o Google Maps
 */
export function getGoogleMapsNavigationUrl(params: {
  latitude?: number;
  longitude?: number;
  address?: string;
}): string {
  if (params.latitude && params.longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${params.latitude},${params.longitude}`;
  }
  const query = encodeURIComponent(params.address || "Fortaleza, CE");
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}

/**
 * Resolve os dados enriquecidos de localização e mobilidade de um imóvel
 */
export async function getPropertyLocationDetails(params: {
  slug?: string;
  cep?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
}): Promise<PropertyLocationEnriched> {
  const bairro = params.bairro || "Meireles";
  const cidade = params.cidade || "Fortaleza";
  const estado = params.estado || "CE";
  const slug = params.slug || "";

  // Descobre o CEP: parâmetro explícito -> slug conhecido -> bairro conhecido -> default Meireles
  const resolvedCep =
    params.cep?.replace(/\D/g, "") ||
    (slug ? KNOWN_PROPERTY_CEPS[slug] : undefined) ||
    NEIGHBORHOOD_CEPS[bairro] ||
    "60165070";

  let loc = await fetchAddressByCep(resolvedCep);

  const fallbackCoords =
    REGIONAL_COORDINATES[bairro] ||
    REGIONAL_COORDINATES[cidade] ||
    REGIONAL_COORDINATES["Fortaleza"];

  const lat = loc?.latitude || fallbackCoords.lat;
  const lng = loc?.longitude || fallbackCoords.lng;
  const service = loc?.service || "brasilapi";

  const addressParts = [
    params.endereco || loc?.logradouro,
    bairro,
    `${cidade} - ${estado}`,
    `CEP ${formatCep(resolvedCep)}`,
  ].filter(Boolean);

  const addressFormatted = addressParts.join(", ");
  const wazeUrl = getWazeNavigationUrl({ latitude: lat, longitude: lng, address: addressFormatted });
  const googleMapsUrl = getGoogleMapsNavigationUrl({ latitude: lat, longitude: lng, address: addressFormatted });

  // OpenStreetMap embed URL para renderização responsiva
  const bboxDelta = 0.006;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - bboxDelta}%2C${lat - bboxDelta}%2C${lng + bboxDelta}%2C${lat + bboxDelta}&layer=mapnik&marker=${lat}%2C${lng}`;

  const pois = REGIONAL_POIS[bairro] || [
    { label: `Localização privilegiada no bairro ${bairro}`, iconType: "route" },
    { label: `Fácil acesso às principais vias de ${cidade}`, iconType: "route" },
  ];

  return {
    cep: resolvedCep,
    logradouro: params.endereco || loc?.logradouro || `Rua do ${bairro}`,
    bairro,
    cidade,
    uf: estado,
    latitude: lat,
    longitude: lng,
    service,
    addressFormatted,
    wazeUrl,
    googleMapsUrl,
    osmEmbedUrl,
    pois,
  };
}
