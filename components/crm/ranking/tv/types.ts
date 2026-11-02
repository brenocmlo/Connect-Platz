// components/crm/ranking/tv/types.ts
// Tipos para o Modo TV / Painel War Room de Sala de Vendas (Habitus CRM Style).

export type TvPeriodKey = "sem_1" | "sem_2" | "sem_3" | "sem_4" | "sem_5" | "mes";

export interface TvPeriodOption {
  key: TvPeriodKey;
  label: string;
}

export interface TvHeaderKpis {
  vgvTotal: number;
  ticketMedio: number;
  analisesTotal: number;
  aprovacoesTotal: number;
  taxaConversaoAnaliseAprovacao: number; // Ex: 42.4 (%)
  vendasTotal: number;
  taxaConversaoAprovacaoVenda: number; // Ex: 30.0 (%)
  ipc: number; // Ex: 0.97
  totalCorretoresAtivos: number;
  corretoresProdutivosPct: number; // Ex: 67.6 (%)
  corretoresProdutivosQtd: number;
}

export interface TvBrokerActivityItem {
  posicao: number;
  corretorId: string;
  corretorNome: string;
  avatar: string;
  hoje: number;
  mes: number;
  valor: number;
}

export interface TvBrokerSalesItem {
  posicao: number;
  corretorId: string;
  corretorNome: string;
  avatar: string;
  vd: number;
  vgv: number;
}

export interface TvDataResponse {
  organization: {
    nome: string;
    logoUrl: string | null;
    slogan: string;
  };
  quote: {
    frase: string;
    autor: string;
  };
  period: {
    key: TvPeriodKey;
    label: string;
    semanaNumero: number;
  };
  kpis: TvHeaderKpis;
  brokers: {
    analises: {
      items: TvBrokerActivityItem[];
      totalHoje: number;
      totalMes: number;
      total: number;
    };
    aprovacoes: {
      items: TvBrokerActivityItem[];
      totalHoje: number;
      totalMes: number;
      total: number;
    };
    vendas: {
      items: TvBrokerSalesItem[];
      totalVd: number;
      totalVgv: number;
    };
  };
  updatedAt: string;
}
