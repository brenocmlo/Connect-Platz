export type Modalidade = "TODOS" | "VENDA" | "ALUGUEL" | "VERANEIO" | "REPASSE";

export interface PropertyItem {
  id: string;
  nome: string;
  slug: string;
  modalidade: "VENDA" | "VERANEIO_TEMPORADA" | "LOCACAO_ANUAL" | "AMBOS" | "REPASSE" | string;
  faixaPreco?: string;
  valorVenda?: number | null;
  valorDiaria?: number | null;
  valorAluguel?: number | null;
  valorCondominio?: number | null;
  valorIptu?: number | null;
  valorRepasse?: number | null;
  entradaRepasse?: number | null;
  parcelasRepasse?: number | null;
  valorParcelaRepasse?: number | null;
  saldoDevedor?: number | null;
  parcelaMensal?: number | null;
  titularOriginario?: string | null;
  clausulaRepasse?: string | null;
  cidade: string;
  estado: string;
  bairro: string;
  endereco?: string | null;
  cep?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  construtora?: string | null;
  descricao?: string | null;
  caracteristicas?: {
    area_m2?: number;
    quartos?: number;
    suites?: number;
    vagas?: number;
    [key: string]: any;
  };
  diferenciais?: string[];
  fotos?: string[];
}

export interface DirectoryNeighborhood {
  nome: string;
  total: number;
  modalidades: string[];
}

export interface DirectoryCity {
  cidade: string;
  estado: string;
  comprar: string[];
  alugar: string[];
  bairros: DirectoryNeighborhood[];
}

export interface PortalFilters {
  modalidade: Modalidade;
  localizacao: string;
  tipoImovel: string;
  quartosMin: string;
  faixaPreco: string;
}

export type NavigateFn = (modalidade: Modalidade, cidade?: string) => void;
