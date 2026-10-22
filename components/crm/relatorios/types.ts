// components/crm/relatorios/types.ts
// Contrato de GET /api/relatorios?period= (compartilhado entre API e UI de Relatórios BI).

export type BiMetricType = "vgv" | "funil" | "roi" | "conversao" | "comissoes";

export type BiGranularityType = "diario" | "semanal" | "mensal";

export type BiChartVisualType = "area" | "barras" | "comparativo";

export interface BiMetricSummary {
  id: BiMetricType;
  title: string;
  shortLabel: string;
  /** null quando o indicador não pode ser calculado (ex.: ROI sem investimento lançado) */
  value: number | null;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Variação vs. período anterior (null = sem base de comparação) */
  changePercent: number | null;
  /** Sufixo da variação ("%" ou " p.p.") */
  changeSuffix?: string;
  /** true quando a variação é favorável (ex.: tempo de funil menor é positivo) */
  changePositive: boolean;
  sublabel: string;
  category: string;
  iconName: string;
}

export interface BiTimeSeriesPoint {
  label: string;
  realizado: number;
  anterior?: number;
  auxiliar?: number;
}

export interface BiFunnelStageMetric {
  etapa: string;
  cor: string;
  /** Tempo médio (h) dos leads abertos na etapa atual */
  tempoHoras: number;
  slaHoras: number | null;
  status: "normal" | "alerta" | "critico";
  leadsAbertos: number;
  leadsEntraram: number;
  /** % que avançou para a próxima etapa (null na última etapa) */
  taxaPassagem: number | null;
}

export interface BiChannelRoiMetric {
  canal: string;
  leads: number;
  vendas: number;
  /** Despesas de mídia lançadas no Fluxo de Caixa (null = não disponível/sem lançamento) */
  investimento: number | null;
  vgv: number;
  ticketMedio: number;
  roiMultiplicador: number | null;
  cpl: number | null;
  taxaConversao: number; // %
  cor: string;
}

export interface BiLgpdClosedLead {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  motivo: string;
  dataEncerramento: string;
  interesse: string;
  corretorUltimo: string;
  diasInativo: number;
}

export interface BiReportData {
  period: { key: string; label: string };
  scope: "organizacao" | "corretor";
  /** Investimento em mídia só é calculado para a Diretoria (dado financeiro corporativo) */
  investmentAvailable: boolean;
  summaries: BiMetricSummary[];
  vgvSeries: Record<BiGranularityType, BiTimeSeriesPoint[]>;
  conversionSeries: BiTimeSeriesPoint[];
  commissionSeries: BiTimeSeriesPoint[];
  funnelVelocity: { funil: string | null; stages: BiFunnelStageMetric[] };
  channels: BiChannelRoiMetric[];
  campaigns: BiChannelRoiMetric[];
  closedLeads: BiLgpdClosedLead[];
}
