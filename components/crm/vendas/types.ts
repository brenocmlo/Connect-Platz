export interface SplitItem {
  id: string;
  beneficiario: string;
  categoria: string;
  percentual: number;
  valor: number;
  status: "PAGO" | "PENDENTE";
  pix?: string;
  dataPagamento?: string;
}

export interface SaleParticipant {
  cargo: "Corretor 1" | "Corretor 2" | "Gerente" | "Gestor" | "Captador";
  nome: string;
  percentual: number;
  valor: number;
  desconto?: number;
  bonus?: number;
  avatarUrl?: string;
}

export interface SaleItem {
  id: string;
  codigoVenda: string;
  imovelNome: string;
  construtora?: string;
  unidadeNumero: string;
  compradorNome: string;
  corretorTitular: string;
  segundoCorretor?: string;
  gerente?: string;
  gestor?: string;
  captador?: string;
  dataVenda: string;
  vgv: number;
  valorAvaliacao?: number;
  comissaoTotal: number;
  impostoValor?: number;
  impostoPercentual?: number;
  proximoPagamento?: string;
  meioPagamento: string;
  status: "APROVADA" | "EM_ANALISE" | "PAGA" | "CANCELADA";
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
