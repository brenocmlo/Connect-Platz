/**
 * Utilitário de captura e persistência de parâmetros UTM e cookies da Meta (_fbp, _fbc).
 * Garante atribuição precisa mesmo se o visitante navegar por várias páginas antes de preencher o formulário.
 */

export interface CapturedUtmData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbp?: string;
  fbc?: string;
}

const STORAGE_KEY = "cp_utm_attribution_v1";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days = 90) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Inicializa a captura na entrada de qualquer página pública.
 */
export function initUtmCapture(): CapturedUtmData {
  if (typeof window === "undefined") return {};

  const url = new URL(window.location.href);
  const q = url.searchParams;

  const rawSource = q.get("utm_source");
  const rawMedium = q.get("utm_medium");
  const rawCampaign = q.get("utm_campaign");
  const rawContent = q.get("utm_content");
  const rawTerm = q.get("utm_term");
  const fbclid = q.get("fbclid");

  // Gerenciamento do cookie _fbp (Facebook Browser ID)
  let fbp = getCookie("_fbp");
  if (!fbp) {
    fbp = `fb.1.${Date.now()}.${Math.floor(1e9 + Math.random() * 9e8)}`;
    setCookie("_fbp", fbp);
  }

  // Gerenciamento do cookie _fbc (Facebook Click ID)
  let fbc = getCookie("_fbc");
  if (fbclid) {
    fbc = `fb.1.${Date.now()}.${fbclid}`;
    setCookie("_fbc", fbc);
  }

  // Recupera dados anteriores da sessão se existirem
  let stored: CapturedUtmData = {};
  try {
    const rawStored = sessionStorage.getItem(STORAGE_KEY);
    if (rawStored) stored = JSON.parse(rawStored);
  } catch {}

  const current: CapturedUtmData = {
    utmSource: rawSource || stored.utmSource || undefined,
    utmMedium: rawMedium || stored.utmMedium || undefined,
    utmCampaign: rawCampaign || stored.utmCampaign || undefined,
    utmContent: rawContent || stored.utmContent || undefined,
    utmTerm: rawTerm || stored.utmTerm || undefined,
    fbp: fbp || stored.fbp || undefined,
    fbc: fbc || stored.fbc || undefined,
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {}

  return current;
}

/**
 * Retorna os dados capturados da sessão atual para envio no formulário de lead.
 */
export function getCapturedUtmData(): CapturedUtmData {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...parsed,
      fbp: getCookie("_fbp") || parsed.fbp,
      fbc: getCookie("_fbc") || parsed.fbc,
    };
  } catch {
    return {};
  }
}
