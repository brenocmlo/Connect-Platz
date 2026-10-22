// lib/services/location.ts
// Localização de imóveis: CEP (ViaCEP/Correios primeiro), geocodificação (Nominatim/OSM)
// e links de navegação (Waze / Google Maps). As funções de rede devem rodar no servidor
// (rotas /api/location/*); os componentes cliente usam apenas formatCep e os geradores de URL.

export type LocationService = "viacep" | "brasilapi" | "nominatim" | "brasilapi-centroide" | "informado" | "cache";

export interface LocationData {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude?: number;
  longitude?: number;
  /** Origem do endereço (viacep/brasilapi). */
  service?: LocationService;
  /** Origem das coordenadas: nominatim (endereço) ou brasilapi-centroide (centro do município). */
  coordsService?: LocationService;
}

export interface PropertyLocationEnriched extends LocationData {
  addressFormatted: string;
  wazeUrl: string;
  googleMapsUrl: string;
  osmEmbedUrl: string;
  pois: { label: string; iconType: "beach" | "shopping" | "food" | "route" | "nature" }[];
}

// Bairros mais frequentes da imobiliária para sugestão rápida
export const REGIONAL_NEIGHBORHOODS: Record<string, string[]> = {
  Fortaleza: ["Meireles", "Aldeota", "Mucuripe", "Cocó", "Praia de Iracema", "Dionísio Torres", "Varjota", "Guararapes", "Fátima", "Papicu", "Engenheiro Luciano Cavalcante"],
  Aquiraz: ["Porto das Dunas", "Prainha", "Centro", "Camocim", "Japuara", "Iguape"],
  Eusébio: ["Centro", "Urucunema", "Coaçu", "Tamandatuba", "Mangabeira", "Amador"],
};

// Pontos de Interesse (POIs) curados por bairro (somente bairros conhecidos)
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
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

const hasCoords = (lat?: number | null, lng?: number | null) =>
  typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng);

// ---------------------------------------------------------------------------
// Caches em memória (servidor) para evitar consultas repetidas
// ---------------------------------------------------------------------------
const cepCache = new Map<string, LocationData | null>();
const geocodeCache = new Map<string, { lat: number; lng: number } | null>();
const NOMINATIM_UA = "ConnectPlatzCRM/1.0";
let lastNominatimCall = 0;

async function fetchJson(url: string, headers: Record<string, string> = {}, timeoutMs = 6000): Promise<{ ok: boolean; status: number; data: any }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { Accept: "application/json", ...headers }, signal: controller.signal, cache: "no-store" });
    const data = res.ok ? await res.json() : null;
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Geocodifica um endereço via Nominatim (OpenStreetMap), com cache e limite de 1 req/s.
 * Retorna null quando não encontra.
 */
export async function geocodeAddress(params: {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalcode?: string | null;
}): Promise<{ lat: number; lng: number } | null> {
  const street = (params.street || "").trim();
  const city = (params.city || "").trim();
  const state = (params.state || "").trim();
  if (!street && !city) return null;

  const key = [street, city, state].join("|").toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;

  const query = new URLSearchParams({ format: "json", limit: "1", countrycodes: "br" });
  if (street) query.set("street", street);
  if (city) query.set("city", city);
  if (state) query.set("state", state);

  // Política de uso do Nominatim: no máximo 1 requisição por segundo.
  const wait = 1000 - (Date.now() - lastNominatimCall);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastNominatimCall = Date.now();

  try {
    const { ok, data } = await fetchJson(
      `https://nominatim.openstreetmap.org/search?${query.toString()}`,
      { "User-Agent": NOMINATIM_UA, "Accept-Language": "pt-BR" }
    );
    const first = ok && Array.isArray(data) ? data[0] : null;
    const lat = first ? Number(first.lat) : NaN;
    const lng = first ? Number(first.lon) : NaN;
    const result = hasCoords(lat, lng) ? { lat, lng } : null;
    geocodeCache.set(key, result);
    return result;
  } catch {
    return null; // falha de rede não é cacheada
  }
}

/** Centróide do município pela BrasilAPI v2 (usado só quando o endereço não geocodifica). */
async function fetchBrasilApiCep(cep: string): Promise<any | null> {
  try {
    const { ok, data } = await fetchJson(`https://brasilapi.com.br/api/cep/v2/${cep}`);
    return ok ? data : null;
  } catch {
    return null;
  }
}

/**
 * Busca endereço por CEP. Ordem: ViaCEP (base dos Correios) -> BrasilAPI (apenas se o ViaCEP
 * estiver indisponível). Se o ViaCEP responder `erro`, o CEP não existe e retorna null.
 * Coordenadas: Nominatim pelo logradouro; na falha, centróide do município (BrasilAPI).
 */
export async function fetchAddressByCep(cepInput: string): Promise<LocationData | null> {
  const cleanCep = String(cepInput || "").replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;
  if (cepCache.has(cleanCep)) {
    const cached = cepCache.get(cleanCep);
    return cached ? { ...cached } : null;
  }

  let result: LocationData | null = null;
  let viaCepRespondeu = false;
  let brasilApiData: any | null = null;

  // 1. ViaCEP (fonte Correios)
  try {
    const { ok, data } = await fetchJson(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (ok && data) {
      viaCepRespondeu = true;
      if (!data.erro) {
        result = {
          cep: cleanCep,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          uf: data.uf || "",
          service: "viacep",
        };
      }
    }
  } catch {
    // ViaCEP fora do ar: tenta a BrasilAPI abaixo
  }

  if (viaCepRespondeu && !result) {
    cepCache.set(cleanCep, null);
    return null; // CEP inexistente segundo os Correios
  }

  // 2. BrasilAPI apenas se o ViaCEP estiver indisponível
  if (!result) {
    brasilApiData = await fetchBrasilApiCep(cleanCep);
    if (!brasilApiData) return null;
    result = {
      cep: cleanCep,
      logradouro: brasilApiData.street || "",
      bairro: brasilApiData.neighborhood || "",
      cidade: brasilApiData.city || "",
      uf: brasilApiData.state || "",
      service: "brasilapi",
    };
  }

  // 3. Coordenadas: logradouro geocodificado (preciso) -> centróide do município (aproximado)
  if (result.logradouro) {
    const geo = await geocodeAddress({ street: result.logradouro, city: result.cidade, state: result.uf });
    if (geo) {
      result.latitude = geo.lat;
      result.longitude = geo.lng;
      result.coordsService = "nominatim";
    }
  }
  if (!hasCoords(result.latitude, result.longitude)) {
    brasilApiData = brasilApiData || (await fetchBrasilApiCep(cleanCep));
    const lat = Number(brasilApiData?.location?.coordinates?.latitude);
    const lng = Number(brasilApiData?.location?.coordinates?.longitude);
    if (hasCoords(lat, lng)) {
      result.latitude = lat;
      result.longitude = lng;
      result.coordsService = "brasilapi-centroide";
    }
  }

  cepCache.set(cleanCep, result);
  return { ...result };
}

/**
 * Gera URL de navegação direta para o Waze (coordenadas quando houver, senão busca por endereço).
 */
export function getWazeNavigationUrl(params: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}): string {
  if (hasCoords(params.latitude, params.longitude)) {
    return `https://waze.com/ul?ll=${params.latitude},${params.longitude}&navigate=yes`;
  }
  return `https://waze.com/ul?q=${encodeURIComponent(params.address || "")}&navigate=yes`;
}

/**
 * Gera URL de navegação direta para o Google Maps
 */
export function getGoogleMapsNavigationUrl(params: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}): string {
  if (hasCoords(params.latitude, params.longitude)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${params.latitude},${params.longitude}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(params.address || "")}`;
}

export interface PropertyLocationInput {
  cep?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  endereco?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/** Indica se há dados mínimos para localizar um imóvel. */
export function hasLocationInput(p: PropertyLocationInput): boolean {
  const cep = String(p.cep || "").replace(/\D/g, "");
  return cep.length === 8 || Boolean(p.endereco?.trim()) || Boolean(p.bairro?.trim()) || hasCoords(p.latitude, p.longitude);
}

/** Resolve coordenadas de um imóvel: informadas -> CEP -> endereço/bairro/cidade. */
export async function resolvePropertyCoordinates(
  p: PropertyLocationInput
): Promise<{ latitude?: number; longitude?: number; service?: LocationService; cepData?: LocationData | null }> {
  const lat = p.latitude != null ? Number(p.latitude) : NaN;
  const lng = p.longitude != null ? Number(p.longitude) : NaN;
  if (hasCoords(lat, lng)) return { latitude: lat, longitude: lng, service: "informado" };

  // Endereço informado tem prioridade sobre o logradouro genérico do CEP
  const street = [p.endereco, p.bairro].filter((x) => x && String(x).trim()).join(", ");
  if (p.endereco?.trim() && p.cidade?.trim()) {
    const geo = await geocodeAddress({ street: p.endereco, city: p.cidade, state: p.estado });
    if (geo) return { latitude: geo.lat, longitude: geo.lng, service: "nominatim" };
  }

  const cep = String(p.cep || "").replace(/\D/g, "");
  if (cep.length === 8) {
    const cepData = await fetchAddressByCep(cep);
    if (cepData && hasCoords(cepData.latitude, cepData.longitude)) {
      return { latitude: cepData.latitude, longitude: cepData.longitude, service: cepData.coordsService, cepData };
    }
  }

  if (street && p.cidade?.trim()) {
    const geo = await geocodeAddress({ street, city: p.cidade, state: p.estado });
    if (geo) return { latitude: geo.lat, longitude: geo.lng, service: "nominatim" };
  }
  return {};
}

/** Monta o endereço legível: logradouro, bairro, cidade - UF, CEP. */
export function buildAddressFormatted(p: PropertyLocationInput & { logradouro?: string | null }): string {
  const cep = String(p.cep || "").replace(/\D/g, "");
  const cidadeUf = [p.cidade, p.estado].filter(Boolean).join(" - ");
  return [p.endereco || p.logradouro, p.bairro, cidadeUf, cep.length === 8 ? `CEP ${formatCep(cep)}` : ""]
    .filter((x) => x && String(x).trim())
    .join(", ");
}

/**
 * Resolve os dados enriquecidos de localização e mobilidade de um imóvel.
 * Retorna null quando nenhum dado de localização foi informado (sem padrão fictício).
 */
export async function getPropertyLocationDetails(params: PropertyLocationInput): Promise<PropertyLocationEnriched | null> {
  if (!hasLocationInput(params)) return null;

  const coords = await resolvePropertyCoordinates(params);
  const cepData = coords.cepData;
  const cep = String(params.cep || "").replace(/\D/g, "");
  const bairro = params.bairro || cepData?.bairro || "";
  const cidade = params.cidade || cepData?.cidade || "";
  const estado = params.estado || cepData?.uf || "";
  const logradouro = params.endereco || cepData?.logradouro || "";

  const addressFormatted = buildAddressFormatted({ endereco: logradouro, bairro, cidade, estado, cep });
  const { latitude: lat, longitude: lng } = coords;
  const wazeUrl = getWazeNavigationUrl({ latitude: lat, longitude: lng, address: addressFormatted });
  const googleMapsUrl = getGoogleMapsNavigationUrl({ latitude: lat, longitude: lng, address: addressFormatted });

  // OpenStreetMap embed somente quando há coordenadas reais
  const d = 0.006;
  const osmEmbedUrl =
    lat !== undefined && lng !== undefined
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`
      : "";

  return {
    cep,
    logradouro,
    bairro,
    cidade,
    uf: estado,
    latitude: lat,
    longitude: lng,
    service: coords.service,
    coordsService: coords.service,
    addressFormatted,
    wazeUrl,
    googleMapsUrl,
    osmEmbedUrl,
    // POIs apenas para bairros com curadoria real; nada genérico inventado
    pois: (bairro && REGIONAL_POIS[bairro]) || [],
  };
}
