export interface SplitItem {
  id: string;
  beneficiario: string;
  /** Rótulo amigável (Corretor 1, Gerente, Imobiliária...) */
  categoria: string;
  /** CommissionBeneficiaryType persistido */
  tipo?: string;
  userId?: string | null;
  percentual: number;
  valor: number;
  status: "PAGO" | "PENDENTE" | "CANCELADO";
  pix?: string;
  dataVencimento?: string;
  dataPagamento?: string | null;
}

export interface SaleItem {
  id: string;
  codigoVenda: string;
  imovelNome: string;
  construtora?: string | null;
  unidadeNumero?: string | null;
  compradorNome: string;
  corretorId?: string;
  corretorTitular: string;
  segundoCorretor?: string;
  gerente?: string;
  gestor?: string;
  captador?: string;
  /** dd/mm/aaaa (exibição) */
  dataVenda: string;
  /** aaaa-mm-dd (cálculos de período) */
  dataVendaIso: string;
  vgv: number;
  valorAvaliacao?: number | null;
  comissaoTotal: number;
  percentualComissao?: number;
  impostoValor: number;
  impostoPercentual: number;
  proximoPagamento?: string | null;
  meioPagamento: string;
  /** "ativa" | "cancelada" (Sale.status) */
  status: string;
  /** "pendente" | "parcial" | "paga" (Sale.statusComissao) */
  statusComissao: string;
  splits: SplitItem[];
}

export interface VendasFilterState {
  corretor: string;
  gerente: string;
  captador: string;
  gestor: string;
  equipe: string;
  construtora: string;
  vgvMin: string;
  vgvMax: string;
  codigoVenda: string;
  status: string;
  ordenarPor: "recente" | "vgv_desc" | "vgv_asc";
}
