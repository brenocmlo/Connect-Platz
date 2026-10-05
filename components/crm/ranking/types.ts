export interface BrokerRankItem {
  id: string;
  posicao: number;
  nome: string;
  avatar: string;
  cargo: string;
  vgv: number;
  vendas: number;
  visitas: number;
  documentos: number;
  captacoes: number;
  compromissos: number;
  taxaConversao: number; // %
  leads: number;
  aderenciaSla: number;
}

export interface HighlightItem {
  titulo: string;
  icone: string;
  nome: string;
  avatar: string;
  metrica: string;
  rotuloMetrica: string;
}

export interface GoalIncentive {
  id?: string;
  titulo: string;
  premio: string;
  descricao: string;
  objetivoMeta: number;
  progressoAtual: number;
  unidade: string;
  periodoValidade: string;
  publicoAlvo?: string;
  tipoMeta?: "vendas" | "vgv" | "captacoes" | "visitas";
  imagemPremioUrl?: string;
}
