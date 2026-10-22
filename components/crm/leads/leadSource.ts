// components/crm/leads/leadSource.ts
// Mapeamento determinístico entre o texto de origem informado (UI, planilhas, plano de testes)
// e o enum LeadSource do banco. Módulo puro: usado tanto pela API quanto pela interface.

export const LEAD_SOURCE_CODES = [
  "META_ADS",
  "GOOGLE_ADS",
  "MANUAL_CORRETOR",
  "CATALOGO_SITE",
  "INDICACAO",
  "PORTAL_IMOBILIARIO",
  "API_EXTERNA",
] as const;

export type LeadSourceCode = (typeof LEAD_SOURCE_CODES)[number];

export const LEAD_SOURCE_LABELS: Record<LeadSourceCode, string> = {
  META_ADS: "Meta Ads",
  GOOGLE_ADS: "Google Ads",
  MANUAL_CORRETOR: "Manual / Corretor",
  CATALOGO_SITE: "Catálogo Site",
  INDICACAO: "Indicação",
  PORTAL_IMOBILIARIO: "Portal Imobiliário",
  API_EXTERNA: "API Externa",
};

function normalizeKey(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const ALIASES: Array<[RegExp, LeadSourceCode]> = [
  [/^(META|META_ADS|FACEBOOK|INSTAGRAM|FB|IG)(_|$)/, "META_ADS"],
  [/^GOOGLE/, "GOOGLE_ADS"],
  [/^MANUAL/, "MANUAL_CORRETOR"],
  [/^(CATALOGO|SITE_VITRINE|CATALOGO_SITE)/, "CATALOGO_SITE"],
  [/^INDICACAO/, "INDICACAO"],
  [/^(PORTAL|ZAP|OLX|VIVA_REAL|GRUPO_OLX|CHAVES_NA_MAO|DREAM_CASA)/, "PORTAL_IMOBILIARIO"],
  [/^(API|WEBHOOK)/, "API_EXTERNA"],
];

/**
 * Converte o texto de origem em LeadSource. Quando não há correspondência,
 * usa MANUAL_CORRETOR e devolve o texto original em `utmSource` para não perder a informação.
 */
export function resolveLeadSource(input?: string | null): {
  source: LeadSourceCode;
  utmSource: string | null;
} {
  const raw = String(input || "").trim();
  if (!raw) return { source: "MANUAL_CORRETOR", utmSource: null };
  const key = normalizeKey(raw);
  if ((LEAD_SOURCE_CODES as readonly string[]).includes(key)) {
    return { source: key as LeadSourceCode, utmSource: null };
  }
  for (const [pattern, code] of ALIASES) {
    if (pattern.test(key)) return { source: code, utmSource: null };
  }
  return { source: "MANUAL_CORRETOR", utmSource: raw.slice(0, 120) };
}

/** Rótulo amigável da origem; para cadastros manuais com canal livre, exibe o canal (ex.: "WhatsApp"). */
export function sourceLabel(source?: string | null, utmSource?: string | null): string {
  if (!source) return "Não informada";
  if (source === "MANUAL_CORRETOR" && utmSource) return utmSource;
  return LEAD_SOURCE_LABELS[source as LeadSourceCode] || source;
}
