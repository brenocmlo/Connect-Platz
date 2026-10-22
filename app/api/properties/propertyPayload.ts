// app/api/properties/propertyPayload.ts
// Normalização do corpo de criação/edição de imóveis e resolução da organização pública.

import { PriceRange, PropertyModality } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { resolvePropertyCoordinates } from "@/lib/services/location";

export const TIPOS_CADASTRO = ["EMPREENDIMENTO", "AVULSO"] as const;
const MAX_FOTOS = 25;

/** Número ou null, respeitando 0 (nunca troca 0 por um padrão). */
export function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const toText = (value: unknown, max = 300): string | null => {
  if (value === null || value === undefined) return null;
  const s = String(value).trim().slice(0, max);
  return s || null;
};

const cleanCep = (value: unknown): string | null => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length === 8 ? digits : null;
};

/** Mantém apenas números válidos (inclusive 0) e textos curtos nas características. */
function sanitizeCaracteristicas(raw: unknown): Record<string, number | string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, number | string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^[a-zA-Z0-9_]{1,40}$/.test(key)) continue;
    const n = toNumberOrNull(value);
    if (n !== null && n >= 0) out[key] = n;
    else if (typeof value === "string" && value.trim()) out[key] = value.trim().slice(0, 120);
  }
  return out;
}

const toStringArray = (raw: unknown, max: number, maxLen = 1000): string[] =>
  Array.isArray(raw)
    ? raw.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((x) => x.trim().slice(0, maxLen)).slice(0, max)
    : [];

export type ParsedProperty = { data: Record<string, any>; errors: string[] };

/**
 * Converte o corpo da requisição nos campos do Prisma. Em modo parcial (PATCH) só inclui
 * as chaves presentes no corpo; em criação aplica os padrões de cadastro.
 */
export function parsePropertyBody(body: any, partial: boolean): ParsedProperty {
  const errors: string[] = [];
  const data: Record<string, any> = {};
  const has = (key: string) => body && Object.prototype.hasOwnProperty.call(body, key);
  const take = (key: string) => !partial || has(key);

  if (take("nome")) {
    const nome = toText(body?.nome, 160);
    if (!nome) errors.push("O nome é obrigatório.");
    else data.nome = nome;
  }
  if (take("tipoCadastro")) {
    const tipo = body?.tipoCadastro ?? "EMPREENDIMENTO";
    if (!TIPOS_CADASTRO.includes(tipo)) errors.push("Tipo de cadastro inválido.");
    else data.tipoCadastro = tipo;
  }
  if (take("modalidade")) {
    const mod = body?.modalidade ?? PropertyModality.VENDA;
    if (!Object.values(PropertyModality).includes(mod)) errors.push("Modalidade inválida.");
    else data.modalidade = mod;
  }
  if (take("faixaPreco")) {
    const faixa = body?.faixaPreco ?? PriceRange.MEDIO;
    if (!Object.values(PriceRange).includes(faixa)) errors.push("Faixa de preço inválida.");
    else data.faixaPreco = faixa;
  }

  for (const key of ["valorVenda", "valorDiaria", "taxaLimpeza"] as const) {
    if (!take(key)) continue;
    const n = toNumberOrNull(body?.[key]);
    if (n !== null && n < 0) errors.push(`${key} não pode ser negativo.`);
    else data[key] = n;
  }

  for (const key of ["estagioObra", "endereco", "bairro", "cidade", "estado", "zona", "construtora"] as const) {
    if (take(key)) data[key] = toText(body?.[key], key === "endereco" ? 300 : 120);
  }
  if (take("descricao")) data.descricao = toText(body?.descricao, 10000);
  if (take("cep")) {
    const raw = body?.cep;
    const cep = cleanCep(raw);
    if (raw && String(raw).trim() && !cep) errors.push("CEP inválido: informe 8 dígitos.");
    data.cep = cep;
  }

  for (const key of ["latitude", "longitude"] as const) {
    if (!take(key)) continue;
    const n = toNumberOrNull(body?.[key]);
    const limit = key === "latitude" ? 90 : 180;
    if (n !== null && Math.abs(n) > limit) errors.push(`${key} fora do intervalo válido.`);
    else data[key] = n;
  }

  if (take("exibirNaLandingPage")) data.exibirNaLandingPage = body?.exibirNaLandingPage === undefined ? true : Boolean(body.exibirNaLandingPage);
  if (partial && has("isActive")) data.isActive = Boolean(body.isActive);

  // Fotos: array explícito; compatibilidade com fotoCapa/imagemUrl no PATCH
  if (has("fotos")) data.fotos = toStringArray(body.fotos, MAX_FOTOS);
  else if (partial && (body?.fotoCapa || body?.imagemUrl)) data.fotos = [String(body.fotoCapa || body.imagemUrl)];
  else if (!partial) data.fotos = [];

  if (take("caracteristicas")) data.caracteristicas = sanitizeCaracteristicas(body?.caracteristicas);
  if (take("diferenciais")) data.diferenciais = toStringArray(body?.diferenciais, 40, 80);

  if (!partial) {
    data.estagioObra = data.estagioObra || (data.tipoCadastro === "AVULSO" ? "Pronto para Morar" : "Lançamento");
  }
  return { data, errors };
}

const LOCATION_KEYS = ["cep", "endereco", "bairro", "cidade", "estado"];

/**
 * Geocodifica no servidor quando o imóvel tem CEP/endereço mas não tem coordenadas
 * informadas. `current` é o registro atual (PATCH) para combinar com os campos novos.
 */
export async function fillCoordinates(data: Record<string, any>, current?: Record<string, any> | null) {
  const coordsInformadas = data.latitude != null && data.longitude != null;
  if (coordsInformadas) return;

  const changedLocation = !current || LOCATION_KEYS.some((k) => k in data && data[k] !== current[k]);
  const missingCoords = current ? current.latitude == null || current.longitude == null : true;
  if (!changedLocation && !missingCoords) return;

  const merged = { ...(current || {}), ...data };
  const coords = await resolvePropertyCoordinates({
    cep: merged.cep,
    endereco: merged.endereco,
    bairro: merged.bairro,
    cidade: merged.cidade,
    estado: merged.estado,
  }).catch(() => ({} as Awaited<ReturnType<typeof resolvePropertyCoordinates>>));

  if (coords.latitude !== undefined && coords.longitude !== undefined) {
    data.latitude = coords.latitude;
    data.longitude = coords.longitude;
  } else if (changedLocation && current) {
    // Endereço mudou e não foi possível geocodificar: não manter coordenadas antigas
    data.latitude = null;
    data.longitude = null;
  }
  // Completa cidade/bairro/UF a partir do CEP quando vierem vazios
  const cepData = coords.cepData;
  if (cepData) {
    if (!merged.cidade && cepData.cidade) data.cidade = cepData.cidade;
    if (!merged.bairro && cepData.bairro) data.bairro = cepData.bairro;
    if (!merged.estado && cepData.uf) data.estado = cepData.uf;
    if (!merged.endereco && cepData.logradouro) data.endereco = cepData.logradouro;
  }
}

/**
 * Organização exibida no portal público (sem sessão). Configurável por
 * PUBLIC_ORGANIZATION_SLUG; na ausência, a organização mais antiga.
 */
export async function resolvePublicOrganizationId(): Promise<string | null> {
  const slug = process.env.PUBLIC_ORGANIZATION_SLUG || "connect-platz";
  const bySlug = await prisma.organization.findFirst({ where: { slug }, select: { id: true } });
  if (bySlug) return bySlug.id;
  const first = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  return first?.id ?? null;
}

export function generateSlug(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return `${base || "imovel"}-${Date.now().toString(36)}`;
}

/** Campos resumidos para a trilha de auditoria. */
export function auditSnapshot(p: Record<string, any> | null | undefined) {
  if (!p) return null;
  const pick = ["nome", "tipoCadastro", "modalidade", "estagioObra", "valorVenda", "valorDiaria", "cep", "endereco", "bairro", "cidade", "construtora", "exibirNaLandingPage", "isActive", "latitude", "longitude"];
  return Object.fromEntries(pick.filter((k) => k in p).map((k) => [k, p[k] != null ? String(p[k]) : null]));
}
