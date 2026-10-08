export type Modalidade = "TODOS" | "VENDA" | "VERANEIO";

export interface PropertyItem {
  id: string;
  nome: string;
  slug: string;
  modalidade: "VENDA" | "VERANEIO_TEMPORADA" | "AMBOS";
  faixaPreco?: string;
  valorVenda?: number | null;
  valorDiaria?: number | null;
  cidade: string;
  estado: string;
  bairro: string;
  endereco?: string | null;
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

export interface DirectoryCity {
  cidade: string;
  estado: string;
  comprar: string[];
  alugar: string[];
}

export interface PortalFilters {
  modalidade: Modalidade;
  localizacao: string;
  tipoImovel: string;
  quartosMin: string;
  faixaPreco: string;
}

export type NavigateFn = (modalidade: "VENDA" | "VERANEIO", cidade?: string) => void;
