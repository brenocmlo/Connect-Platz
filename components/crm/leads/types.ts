export interface LeadSale {
  id: string;
  codigoVenda: string;
  valorVendaVGV: number;
  valorComissaoTotal: number;
  percentualComissao: number;
  status: string;
  statusComissao: string;
  dataVenda: string;
  property?: { id: string; nome: string } | null;
  corretorTitular?: { id: string; nome: string } | null;
}

export interface LeadDetail {
  id: string;
  nome: string;
  telefone: string;
  email?: string | null;
  cpf?: string | null;
  rg?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  estadoCivil?: string | null;
  regimeCasamento?: string | null;
  profissao?: string | null;
  temperatura: "FRIO" | "MORNO" | "QUENTE";
  source: string;
  adId?: string | null;
  formId?: string | null;
  campaignName?: string | null;
  adName?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  stageId: string;
  stage?: { id: string; nome: string; cor?: string } | null;
  statusLabel?: string | null;
  slaDueAt?: string | null;
  slaBreached?: boolean;
  isBolsao?: boolean;
  isNightQueue?: boolean;
  tipoOcupacaoCredito?: "CLT" | "AUTONOMO" | "EMPRESARIO" | "OUTRO" | null;
  rendaDeclarada?: number | null;
  rendaEspecificaAutonomo?: number | null;
  faixaRenda?: string | null;
  bairrosInteresse?: string[];
  corretor?: { id: string; nome: string } | null;
  opportunityValue?: number | null;
  empreendimentoInteresse?: string | null;
  cidadeInteresse?: string | null;
  compromissosCount?: number | null;
  tags?: string[];
  createdAt?: string | null;
  score?: number | null;
  observacoes?: string | null;
  corretorId?: string | null;
  funnelId?: string | null;
  firstContactAt?: string | null;
  sourceLabel?: string | null;
  isClosed?: boolean;
  documentsCount?: number | null;
  salesCount?: number | null;
  sales?: LeadSale[];
  modalidade?: "VENDA" | "ALUGUEL" | null;
  financialApprovalStatus?: "PENDENTE" | "APROVADO" | "REJEITADO" | null;
}

export interface FunnelColumn {
  id: string;
  nome: string;
  posicao: number;
  cor: string;
  slaMinutes: number | null;
}
