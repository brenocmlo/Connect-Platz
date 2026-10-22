// Ficha comercial do imóvel: texto para copiar/enviar, link público e rotas de navegação.
import type { PropertyCardData } from "./PropertyProductCard";
import { formatCep, getGoogleMapsNavigationUrl, getWazeNavigationUrl } from "@/lib/services/location";

const brl = (v: number, digits = 0) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v);

export function formatPropertyPrice(p: PropertyCardData): string {
  const venda = p.valorVenda != null ? Number(p.valorVenda) : null;
  const diaria = p.valorDiaria != null ? Number(p.valorDiaria) : null;
  if (p.modalidade === "VERANEIO_TEMPORADA" && diaria) return `${brl(diaria, 2)}/dia`;
  if (venda) return brl(venda);
  if (diaria) return `${brl(diaria, 2)}/dia`;
  return "Consulte valores";
}

export function formatPropertyAddress(p: PropertyCardData): string {
  const cep = String(p.cep || "").replace(/\D/g, "");
  const cidadeUf = [p.cidade, p.estado].filter(Boolean).join(" - ");
  return [p.endereco, p.bairro, cidadeUf, cep.length === 8 ? `CEP ${formatCep(cep)}` : ""].filter(Boolean).join(", ");
}

/** Especificações com 0 respeitado (0 suítes é informação válida). */
export function propertySpecs(p: PropertyCardData) {
  const c = p.caracteristicas || {};
  const has = (v: unknown) => v !== null && v !== undefined && v !== "";
  return [
    { key: "area_m2", label: "Área", value: has(c.area_m2) ? `${c.area_m2} m²` : null },
    { key: "quartos", label: "Quartos", value: has(c.quartos) ? `${c.quartos}` : null },
    { key: "suites", label: "Suítes", value: has(c.suites) ? `${c.suites}` : null },
    { key: "vagas", label: "Vagas", value: has(c.vagas) ? `${c.vagas}` : null },
  ].filter((s) => s.value !== null) as { key: string; label: string; value: string }[];
}

/** Link público do imóvel no portal (abre a ficha do imóvel diretamente). */
export function propertyPublicUrl(p: PropertyCardData, origin: string): string | null {
  if (!p.slug || p.exibirNaLandingPage === false) return null;
  return `${origin}/?imovel=${encodeURIComponent(p.slug)}#vitrine`;
}

export function propertyNavigation(p: PropertyCardData) {
  const address = formatPropertyAddress(p);
  const nav = { latitude: p.latitude ?? null, longitude: p.longitude ?? null, address };
  const hasAny = Boolean(address) || (p.latitude != null && p.longitude != null);
  return {
    hasAny,
    wazeUrl: hasAny ? getWazeNavigationUrl(nav) : null,
    googleMapsUrl: hasAny ? getGoogleMapsNavigationUrl(nav) : null,
  };
}

export function buildFichaText(p: PropertyCardData, origin: string): string {
  const specs = propertySpecs(p).map((s) => `${s.value} ${s.key === "area_m2" ? "" : s.label.toLowerCase()}`.trim());
  const address = formatPropertyAddress(p);
  const link = propertyPublicUrl(p, origin);
  const { googleMapsUrl } = propertyNavigation(p);
  const status = [p.estagioObra, p.modalidade === "VERANEIO_TEMPORADA" ? "Temporada" : p.modalidade === "AMBOS" ? "Venda e Temporada" : "Venda"]
    .filter(Boolean)
    .join(" · ");

  return [
    `🏢 *${p.nome}*`,
    p.construtora ? `Construtora: ${p.construtora}` : null,
    status ? `Status: ${status}` : null,
    `💰 Valor: ${formatPropertyPrice(p)}`,
    specs.length ? `📐 ${specs.join(" · ")}` : null,
    address ? `📍 ${address}` : null,
    p.diferenciais?.length ? `✨ Diferenciais: ${p.diferenciais.join(", ")}` : null,
    link ? `🔗 Ficha completa: ${link}` : null,
    googleMapsUrl ? `🗺️ Como chegar: ${googleMapsUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Copia texto com fallback para navegadores sem Clipboard API (HTTP/local). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}
