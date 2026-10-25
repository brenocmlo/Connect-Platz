// components/crm/ranking/types.ts
// Contratos de GET /api/ranking?period= e /api/metas (compartilhados entre API e UI).

export interface BrokerRankItem {
  id: string;
  posicao: number;
  nome: string;
  /** Iniciais (fallback quando não há foto) */
  avatar: string;
  photoUrl: string | null;
  cargo: string;
  vgv: number;
  vendas: number;
  visitas: number;
  documentos: number;
  captacoes: number;
  compromissos: number;
  taxaConversao: number; // %
  leads: number;
  /** % de leads atendidos dentro do SLA (null = sem leads no período) */
  aderenciaSla: number | null;
  /** true quando tem resultado (venda/VGV) no período — elegível a pódio/coroa */
  noPodio: boolean;
}

export type HighlightKey = "leads" | "visitas" | "documentos" | "captacoes" | "taxa" | "compromissos";

export interface HighlightItem {
  titulo: string;
  icone: HighlightKey;
  /** null = ninguém pontuou nessa categoria no período */
  nome: string | null;
  avatar: string;
  metrica: string;
  rotuloMetrica: string;
}

export interface RankingResponse {
  period: { key: string; label: string };
  podium: BrokerRankItem[];
  fullRanking: BrokerRankItem[];
  highlights: HighlightItem[];
  /** Corretor do Mês = 1º colocado com resultado real (null se ninguém vendeu) */
  leader: BrokerRankItem | null;
  currentUserId: string;
}

export type GoalMetric = "VENDAS" | "VGV" | "VISITAS" | "CAPTACOES";

/** Dados editáveis de uma meta (persistida em Organization.settings.goals). */
export interface GoalInput {
  titulo: string;
  descricao?: string;
  premio?: string;
  imagemUrl?: string;
  metrica: GoalMetric;
  objetivo: number;
  inicio: string; // YYYY-MM-DD
  fim: string; // YYYY-MM-DD
}

export interface GoalIncentive extends GoalInput {
  id: string;
  /** Progresso calculado de dados reais (vendas/VGV/visitas/captações no intervalo da meta) */
  progressoAtual: number;
  /** individual = progresso do próprio usuário; equipe = soma da organização (administradores) */
  progressScope: "individual" | "equipe";
  status: "ativa" | "agendada" | "encerrada";
}

export const GOAL_METRIC_LABELS: Record<GoalMetric, { label: string; unidade: string }> = {
  VENDAS: { label: "Vendas", unidade: "vendas" },
  VGV: { label: "VGV (R$)", unidade: "de VGV" },
  VISITAS: { label: "Visitas realizadas", unidade: "visitas" },
  CAPTACOES: { label: "Captações", unidade: "captações" },
};
