import type { PortalFilters, PropertyItem } from "./types";

export const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";

export const INITIAL_FILTERS: PortalFilters = {
  modalidade: "TODOS",
  localizacao: "",
  tipoImovel: "TODOS",
  quartosMin: "TODOS",
  faixaPreco: "TODOS",
};

export const PROPERTY_TYPES = [
  { value: "TODOS", label: "Tipo de imóvel" },
  { value: "Apartamento", label: "Apartamento" },
  { value: "Casa", label: "Casa / Villa" },
  { value: "Cobertura", label: "Cobertura" },
  { value: "Beach", label: "Casa de praia" },
  { value: "Chacara", label: "Chácara / Sítio" },
  { value: "Terreno", label: "Terreno / Lote" },
  { value: "Comercial", label: "Comercial / Sala" },
];

export const BEDROOM_OPTIONS = [
  { value: "TODOS", label: "Quartos" },
  { value: "2", label: "2+ quartos" },
  { value: "3", label: "3+ quartos" },
  { value: "4", label: "4+ quartos" },
];

// Faixas no formato "min-max" (max vazio = sem teto). Venda usa valorVenda, temporada usa valorDiaria.
export const PRICE_RANGES = {
  VENDA: [
    { value: "TODOS", label: "Faixa de preço" },
    { value: "0-500000", label: "Até R$ 500 mil" },
    { value: "500000-1000000", label: "R$ 500 mil a 1 mi" },
    { value: "1000000-2000000", label: "R$ 1 mi a 2 mi" },
    { value: "2000000-", label: "Acima de R$ 2 mi" },
  ],
  VERANEIO: [
    { value: "TODOS", label: "Diária" },
    { value: "0-500", label: "Até R$ 500 / noite" },
    { value: "500-1000", label: "R$ 500 a 1.000 / noite" },
    { value: "1000-", label: "Acima de R$ 1.000 / noite" },
  ],
  ALUGUEL: [
    { value: "TODOS", label: "Aluguel mensal" },
    { value: "0-2000", label: "Até R$ 2.000 / mês" },
    { value: "2000-4000", label: "R$ 2.000 a R$ 4.000" },
    { value: "4000-7000", label: "R$ 4.000 a R$ 7.000" },
    { value: "7000-", label: "Acima de R$ 7.000" },
  ],
  REPASSE: [
    { value: "TODOS", label: "Valor do repasse (ágio)" },
    { value: "0-50000", label: "Até R$ 50 mil" },
    { value: "50000-100000", label: "R$ 50 mil a 100 mil" },
    { value: "100000-200000", label: "R$ 100 mil a 200 mil" },
    { value: "200000-", label: "Acima de R$ 200 mil" },
  ],
};

export const ANCHOR_LINKS = [
  { id: "simulador", label: "Financiamento" },
  { id: "diretorio", label: "Bairros" },
  { id: "sobre", label: "Sobre nós" },
];

// "Aquiraz (Porto das Dunas)" -> "Aquiraz", usado como termo de busca.
export const cityLabel = (cidade: string) => cidade.split(" (")[0];

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const brl = (value: number, digits = 2) =>
  `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

export function formatBRL(value: number) {
  return brl(value, 0);
}

export function formatPrice(prop: PropertyItem) {
  if (prop.modalidade === "REPASSE" && prop.valorRepasse) {
    return `Repasse ${brl(prop.valorRepasse, 0)}`;
  }
  if (prop.modalidade === "LOCACAO_ANUAL" && prop.valorAluguel) {
    return `${brl(prop.valorAluguel, 0)} / mês`;
  }
  if (prop.modalidade === "VERANEIO_TEMPORADA" && prop.valorDiaria) {
    return `${brl(prop.valorDiaria, 2)} / noite`;
  }
  if (prop.valorVenda) return brl(prop.valorVenda, 0);
  if (prop.valorAluguel) return `${brl(prop.valorAluguel, 0)} / mês`;
  if (prop.valorDiaria) return `${brl(prop.valorDiaria, 2)} / noite`;
  return "Consulte";
}

export function isTemporada(prop: PropertyItem) {
  return prop.modalidade === "VERANEIO_TEMPORADA";
}

export function isLocacao(prop: PropertyItem) {
  return prop.modalidade === "LOCACAO_ANUAL";
}

export function isRepasse(prop: PropertyItem) {
  return prop.modalidade === "REPASSE";
}

// Infere o tipo de imóvel a partir de um texto do diretório ("Casas à venda em ...").
export function inferPropertyType(text: string) {
  const t = text.toLowerCase();
  if (t.includes("chácara") || t.includes("chacara") || t.includes("sítio") || t.includes("sitio") || t.includes("fazenda")) return "Chacara";
  if (t.includes("cobertura")) return "Cobertura";
  if (t.includes("praia")) return "Beach";
  if (t.includes("casa")) return "Casa";
  if (t.includes("apartamento") || t.includes("studio") || t.includes("flat")) return "Apartamento";
  return "TODOS";
}

function matchesPrice(p: PropertyItem, filters: PortalFilters) {
  if (filters.faixaPreco === "TODOS") return true;
  const [min, max] = filters.faixaPreco.split("-");
  let value: number | null | undefined;
  if (filters.modalidade === "VERANEIO") value = p.valorDiaria;
  else if (filters.modalidade === "ALUGUEL") value = p.valorAluguel;
  else if (filters.modalidade === "REPASSE") value = p.valorRepasse || p.valorVenda;
  else value = p.valorVenda;
  if (!value) return false;
  if (value < Number(min)) return false;
  return max === "" || value <= Number(max);
}

export function matchesFilters(p: PropertyItem, filters: PortalFilters) {
  if (filters.modalidade === "VENDA") {
    if (p.modalidade !== "VENDA" && p.modalidade !== "AMBOS") return false;
  } else if (filters.modalidade === "ALUGUEL") {
    if (p.modalidade !== "LOCACAO_ANUAL" && p.modalidade !== "AMBOS" && !p.valorAluguel) return false;
  } else if (filters.modalidade === "VERANEIO") {
    if (p.modalidade !== "VERANEIO_TEMPORADA" && p.modalidade !== "AMBOS" && !p.valorDiaria) return false;
  } else if (filters.modalidade === "REPASSE") {
    if (p.modalidade !== "REPASSE" && !p.valorRepasse) return false;
  }

  if (filters.tipoImovel !== "TODOS") {
    const termo = filters.tipoImovel.toLowerCase();
    const texto = `${p.nome || ""} ${p.descricao || ""} ${(p.caracteristicas as any)?.tipo || ""}`.toLowerCase();
    if (termo === "chacara") {
      const isChacara =
        texto.includes("chácara") ||
        texto.includes("chacara") ||
        texto.includes("sítio") ||
        texto.includes("sitio") ||
        texto.includes("fazenda");
      if (!isChacara) return false;
    } else if (!texto.includes(termo)) {
      return false;
    }
  }

  if (filters.quartosMin !== "TODOS") {
    if ((p.caracteristicas?.quartos || 0) < parseInt(filters.quartosMin, 10)) return false;
  }

  if (filters.localizacao) {
    const termo = filters.localizacao.toLowerCase();
    const local = `${p.bairro || ""} ${p.cidade || ""} ${p.nome || ""}`.toLowerCase();
    if (!local.includes(termo)) return false;
  }

  return matchesPrice(p, filters);
}

export function hasActiveFilters(filters: PortalFilters) {
  return (Object.keys(INITIAL_FILTERS) as (keyof PortalFilters)[]).some(
    (key) => filters[key] !== INITIAL_FILTERS[key]
  );
}
