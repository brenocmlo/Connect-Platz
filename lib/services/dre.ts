/**
 * Motor determinístico do DRE Gerencial — Connect Platz CRM.
 * Cada lançamento do Fluxo de Caixa pertence a uma CATEGORIA (plano de contas),
 * que define em qual grupo do DRE ele entra, e a um CENTRO DE CUSTO.
 * Nenhuma IA: apenas somatórios e mapeamentos fixos.
 */

export type DreGroup =
  | "RECEITA_BRUTA"
  | "DEDUCOES"
  | "CUSTO_VARIAVEL"
  | "DESPESA_MARKETING"
  | "DESPESA_FIXA";

export interface ChartAccount {
  categoria: string;
  tipo: "RECEITA" | "DESPESA";
  grupo: DreGroup;
  centroCustoPadrao: string;
}

export const COST_CENTERS = [
  "Comercial — Lançamentos",
  "Comercial — Revenda",
  "Temporada / Veraneio",
  "Marketing",
  "Administrativo / Sede",
] as const;

export const CHART_OF_ACCOUNTS: ChartAccount[] = [
  { categoria: "Comissão Venda", tipo: "RECEITA", grupo: "RECEITA_BRUTA", centroCustoPadrao: "Comercial — Lançamentos" },
  { categoria: "Comissão Revenda", tipo: "RECEITA", grupo: "RECEITA_BRUTA", centroCustoPadrao: "Comercial — Revenda" },
  { categoria: "Aluguel Veraneio", tipo: "RECEITA", grupo: "RECEITA_BRUTA", centroCustoPadrao: "Temporada / Veraneio" },
  { categoria: "Taxa de Limpeza Temporada", tipo: "RECEITA", grupo: "RECEITA_BRUTA", centroCustoPadrao: "Temporada / Veraneio" },
  { categoria: "Outras Receitas", tipo: "RECEITA", grupo: "RECEITA_BRUTA", centroCustoPadrao: "Administrativo / Sede" },
  { categoria: "Impostos (Simples Nacional)", tipo: "DESPESA", grupo: "DEDUCOES", centroCustoPadrao: "Administrativo / Sede" },
  { categoria: "Split Comissão", tipo: "DESPESA", grupo: "CUSTO_VARIAVEL", centroCustoPadrao: "Comercial — Lançamentos" },
  { categoria: "Repasse Proprietário Temporada", tipo: "DESPESA", grupo: "CUSTO_VARIAVEL", centroCustoPadrao: "Temporada / Veraneio" },
  { categoria: "Manutenção & Limpeza Imóvel", tipo: "DESPESA", grupo: "CUSTO_VARIAVEL", centroCustoPadrao: "Temporada / Veraneio" },
  { categoria: "Premiação de Metas", tipo: "DESPESA", grupo: "CUSTO_VARIAVEL", centroCustoPadrao: "Comercial — Lançamentos" },
  { categoria: "Tráfego Pago Meta Ads", tipo: "DESPESA", grupo: "DESPESA_MARKETING", centroCustoPadrao: "Marketing" },
  { categoria: "Tráfego Pago Google Ads", tipo: "DESPESA", grupo: "DESPESA_MARKETING", centroCustoPadrao: "Marketing" },
  { categoria: "Portais Imobiliários", tipo: "DESPESA", grupo: "DESPESA_MARKETING", centroCustoPadrao: "Marketing" },
  { categoria: "Sede & Administrativo", tipo: "DESPESA", grupo: "DESPESA_FIXA", centroCustoPadrao: "Administrativo / Sede" },
  { categoria: "Folha & Pró-labore", tipo: "DESPESA", grupo: "DESPESA_FIXA", centroCustoPadrao: "Administrativo / Sede" },
  { categoria: "Software & Sistemas", tipo: "DESPESA", grupo: "DESPESA_FIXA", centroCustoPadrao: "Administrativo / Sede" },
  { categoria: "Outras Despesas", tipo: "DESPESA", grupo: "DESPESA_FIXA", centroCustoPadrao: "Administrativo / Sede" },
];

/** Alíquota padrão (Simples Nacional) usada quando não há lançamento explícito de imposto. */
export const DEFAULT_TAX_RATE = 0.06;

export interface DreEntry {
  tipo: "RECEITA" | "DESPESA";
  categoria: string;
  valor: number;
  status: "PAGO" | "PENDENTE";
  dataVencimento: string;
  dataLiquidacao?: string;
  centroCusto?: string;
}

export type DreRegime = "CAIXA" | "COMPETENCIA";

export interface DreReport {
  receitaBruta: number;
  deducoes: number;
  deducoesEstimadas: boolean;
  receitaLiquida: number;
  custosVariaveis: number;
  margemContribuicao: number;
  despesasMarketing: number;
  despesasFixas: number;
  resultadoOperacional: number;
  margemLiquidaPct: number;
  porCentroCusto: { centro: string; receitas: number; despesas: number; resultado: number }[];
  porCategoria: { categoria: string; grupo: DreGroup; valor: number }[];
}

export function getAccount(categoria: string, tipo: "RECEITA" | "DESPESA"): ChartAccount {
  return (
    CHART_OF_ACCOUNTS.find((a) => a.categoria === categoria) ||
    CHART_OF_ACCOUNTS.find((a) => a.categoria === (tipo === "RECEITA" ? "Outras Receitas" : "Outras Despesas"))!
  );
}

export function accountsByType(tipo: "RECEITA" | "DESPESA"): ChartAccount[] {
  return CHART_OF_ACCOUNTS.filter((a) => a.tipo === tipo);
}

/** Converte "dd/mm/aaaa" ou "aaaa-mm-dd" em chave "aaaa-mm". */
export function monthKey(date?: string): string | null {
  if (!date) return null;
  if (/^\d{4}-\d{2}/.test(date)) return date.slice(0, 7);
  const m = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}` : null;
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const name = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "long" });
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} / ${y}`;
}

/** Lista de meses (aaaa-mm) presentes nos lançamentos, mais recente primeiro. */
export function availableMonths(entries: DreEntry[]): string[] {
  const set = new Set<string>();
  entries.forEach((e) => {
    const k = monthKey(e.dataVencimento);
    if (k) set.add(k);
    const l = monthKey(e.dataLiquidacao);
    if (l) set.add(l);
  });
  return Array.from(set).sort().reverse();
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Regime de CAIXA: considera apenas o que foi liquidado (PAGO) no mês da liquidação.
 * Regime de COMPETÊNCIA: considera tudo (pago + pendente) pelo mês de vencimento.
 */
export function computeDre(entries: DreEntry[], month: string | "TODOS", regime: DreRegime): DreReport {
  const inScope = entries.filter((e) => {
    if (regime === "CAIXA" && e.status !== "PAGO") return false;
    if (month === "TODOS") return true;
    const ref = regime === "CAIXA" ? monthKey(e.dataLiquidacao) || monthKey(e.dataVencimento) : monthKey(e.dataVencimento);
    return ref === month;
  });

  const sums: Record<DreGroup, number> = {
    RECEITA_BRUTA: 0,
    DEDUCOES: 0,
    CUSTO_VARIAVEL: 0,
    DESPESA_MARKETING: 0,
    DESPESA_FIXA: 0,
  };
  const catMap = new Map<string, { grupo: DreGroup; valor: number }>();
  const ccMap = new Map<string, { receitas: number; despesas: number }>();

  inScope.forEach((e) => {
    const acc = getAccount(e.categoria, e.tipo);
    sums[acc.grupo] += e.valor;
    const cat = catMap.get(acc.categoria) || { grupo: acc.grupo, valor: 0 };
    cat.valor += e.valor;
    catMap.set(acc.categoria, cat);
    const centro = e.centroCusto || acc.centroCustoPadrao;
    const cc = ccMap.get(centro) || { receitas: 0, despesas: 0 };
    if (e.tipo === "RECEITA") cc.receitas += e.valor;
    else cc.despesas += e.valor;
    ccMap.set(centro, cc);
  });

  const deducoesEstimadas = sums.DEDUCOES === 0 && sums.RECEITA_BRUTA > 0;
  const deducoes = deducoesEstimadas ? sums.RECEITA_BRUTA * DEFAULT_TAX_RATE : sums.DEDUCOES;
  const receitaLiquida = sums.RECEITA_BRUTA - deducoes;
  const margemContribuicao = receitaLiquida - sums.CUSTO_VARIAVEL;
  const resultadoOperacional = margemContribuicao - sums.DESPESA_MARKETING - sums.DESPESA_FIXA;

  return {
    receitaBruta: round2(sums.RECEITA_BRUTA),
    deducoes: round2(deducoes),
    deducoesEstimadas,
    receitaLiquida: round2(receitaLiquida),
    custosVariaveis: round2(sums.CUSTO_VARIAVEL),
    margemContribuicao: round2(margemContribuicao),
    despesasMarketing: round2(sums.DESPESA_MARKETING),
    despesasFixas: round2(sums.DESPESA_FIXA),
    resultadoOperacional: round2(resultadoOperacional),
    margemLiquidaPct: sums.RECEITA_BRUTA > 0 ? round2((resultadoOperacional / sums.RECEITA_BRUTA) * 100) : 0,
    porCentroCusto: Array.from(ccMap.entries())
      .map(([centro, v]) => ({ centro, receitas: round2(v.receitas), despesas: round2(v.despesas), resultado: round2(v.receitas - v.despesas) }))
      .sort((a, b) => b.resultado - a.resultado),
    porCategoria: Array.from(catMap.entries())
      .map(([categoria, v]) => ({ categoria, grupo: v.grupo, valor: round2(v.valor) }))
      .sort((a, b) => b.valor - a.valor),
  };
}

/** Análise vertical: % sobre a Receita Bruta. */
export function verticalPct(valor: number, receitaBruta: number): string {
  if (!receitaBruta) return "—";
  return `${((valor / receitaBruta) * 100).toFixed(1)}%`;
}
