// components/crm/dashboard/types.ts
// Contrato da resposta de GET /api/dashboard?period= (compartilhado entre API e UI).

export type DashboardScope = "organizacao" | "corretor";

export interface SalesSeriesPoint {
  label: string;
  vgv: number;
  vendas: number;
}

export interface FunnelStageReport {
  id: string;
  nome: string;
  cor: string;
  slaMinutes: number | null;
  count: number;
  reached: number;
  sharePct: number;
  conversionPct: number;
}

export interface FunnelReport {
  id: string;
  nome: string;
  totalLeads: number;
  stages: FunnelStageReport[];
}

export interface HotLeadItem {
  id: string;
  nome: string;
  telefone: string;
  score: number;
  temperatura: "FRIO" | "MORNO" | "QUENTE";
  etapa: string;
  corretor: string | null;
  atualizadoEm: string;
}

export interface AppointmentItem {
  id: string;
  tipo: string;
  titulo: string;
  status: string;
  inicio: string;
  fim: string;
  cliente: string | null;
  responsavel: string;
  empreendimento: string | null;
}

export interface TeamMemberItem {
  id: string;
  nome: string;
  photoUrl: string | null;
  vendas: number;
  vgv: number;
}

export interface ActivityItem {
  id: string;
  origem: "timeline" | "auditoria";
  tipo: string;
  titulo: string;
  descricao: string;
  autor: string | null;
  criadoEm: string;
}

export interface DashboardData {
  period: { key: string; label: string };
  scope: DashboardScope;
  financial: {
    vgvTotal: number;
    totalSales: number;
    averageTicket: number;
    commissionReceived: number;
    /** null para corretor (repasses da empresa não se aplicam) */
    commissionPaid: number | null;
    commissionPending: number;
    trends: {
      vgvTotal: number | null;
      totalSales: number | null;
      averageTicket: number | null;
      commissionReceived: number | null;
      commissionPaid: number | null;
      commissionPending: number | null;
    };
  };
  /** Fluxo de caixa corporativo: apenas Diretoria/Administração */
  cashFlow: { balance: number; inflow: number; outflow: number; balanceTrend: number | null } | null;
  operational: {
    docs: { total: number; emAnalise: number; aprovadas: number; reprovadas: number };
    visits: { total: number; agendadas: number; realizadas: number; trend: number | null };
    brokers: { disponiveis: number; ativos: number };
    leads: { captados: number; hoje: number; trend: number | null };
    conversion: { rate: number; trendPoints: number | null };
  };
  salesSeries: { anual: SalesSeriesPoint[]; mensal: SalesSeriesPoint[]; semanal: SalesSeriesPoint[] };
  funnels: FunnelReport[];
  hotLeads: HotLeadItem[];
  appointments: AppointmentItem[];
  team: { corretores: TeamMemberItem[]; gerentes: TeamMemberItem[] } | null;
  activities: ActivityItem[];
}
