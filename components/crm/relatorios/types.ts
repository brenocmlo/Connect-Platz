export type BiMetricType = "vgv" | "funil" | "roi" | "conversao" | "comissoes";

export type BiPeriodType = "7d" | "30d" | "trimestre" | "ano";

export type BiGranularityType = "diario" | "semanal" | "mensal";

export type BiChartVisualType = "area" | "barras" | "comparativo";

export interface BiMetricSummary {
  id: BiMetricType;
  title: string;
  shortLabel: string;
  value: number;
  formattedValue?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  changePercent: number;
  changePositive: boolean;
  sublabel: string;
  category: string;
  iconName: string;
}

export interface BiTimeSeriesPoint {
  label: string;
  realizado: number;
  anterior?: number;
  meta?: number;
  auxiliar?: number;
}

export interface BiFunnelStageMetric {
  etapa: string;
  tempoHoras: number;
  slaHoras: number;
  status: "normal" | "alerta" | "critico";
  leadsEntraram: number;
  taxaPassagem: number; // %
}

export interface BiChannelRoiMetric {
  canal: string;
  leads: number;
  investimento: number;
  vgv: number;
  ticketMedio: number;
  roi: string;
  roiMultiplicador: number;
  cpl: number;
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
