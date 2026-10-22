// lib/domain/scoring/leadScore.ts
// Score determinístico de leads (0–100). Sem IA: soma de critérios objetivos calibráveis.

export interface ScoreRulesConfig {
  phonePoints: number;
  emailPoints: number;
  propertyPoints: number;
  incomePoints: number;
  fastResponsePoints: number;
  docPoints: number;
  visitPoints: number;
  proposalPoints: number;
  highIncomeMin: number; // renda (R$) a partir da qual o lead recebe a pontuação cheia de renda
  hotThreshold: number; // >= hot => Lead Quente
  warmThreshold: number; // >= warm => Lead Morno
}

export const DEFAULT_SCORE_RULES: ScoreRulesConfig = {
  phonePoints: 10,
  emailPoints: 5,
  propertyPoints: 10,
  incomePoints: 15,
  fastResponsePoints: 15,
  docPoints: 10,
  visitPoints: 15,
  proposalPoints: 20,
  highIncomeMin: 10000,
  hotThreshold: 75,
  warmThreshold: 40,
};

export interface LeadScoreInput {
  telefone?: string | null;
  email?: string | null;
  hasPropertyInterest?: boolean;
  rendaDeclarada?: number | null;
  createdAt?: Date | string | null;
  firstContactAt?: Date | string | null;
  documentsCount?: number;
  stagePosition?: number | null; // 1 = Novo Lead, 3 = Visita Agendada, 4 = Proposta…
}

export type LeadTemperatureLabel = "FRIO" | "MORNO" | "QUENTE";

export function mergeScoreRules(partial?: Partial<ScoreRulesConfig> | null): ScoreRulesConfig {
  return { ...DEFAULT_SCORE_RULES, ...(partial || {}) };
}

export function computeLeadScore(input: LeadScoreInput, rules: ScoreRulesConfig = DEFAULT_SCORE_RULES): number {
  let score = 0;
  const phoneDigits = String(input.telefone || "").replace(/\D/g, "");
  if (phoneDigits.length >= 10) score += rules.phonePoints;
  if (input.email && input.email.includes("@")) score += rules.emailPoints;
  if (input.hasPropertyInterest) score += rules.propertyPoints;

  const renda = Number(input.rendaDeclarada || 0);
  if (renda >= rules.highIncomeMin) score += rules.incomePoints;
  else if (renda > 0) score += Math.round(rules.incomePoints / 2);

  if (input.createdAt && input.firstContactAt) {
    const diffMin =
      (new Date(input.firstContactAt).getTime() - new Date(input.createdAt).getTime()) / 60000;
    if (diffMin >= 0 && diffMin <= 5) score += rules.fastResponsePoints;
    else if (diffMin > 5 && diffMin <= 30) score += Math.round(rules.fastResponsePoints / 2);
  }

  if ((input.documentsCount || 0) > 0) score += rules.docPoints;
  const pos = input.stagePosition || 1;
  if (pos >= 3) score += rules.visitPoints;
  if (pos >= 4) score += rules.proposalPoints;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function temperatureFromScore(score: number, rules: ScoreRulesConfig = DEFAULT_SCORE_RULES): LeadTemperatureLabel {
  if (score >= rules.hotThreshold) return "QUENTE";
  if (score >= rules.warmThreshold) return "MORNO";
  return "FRIO";
}
