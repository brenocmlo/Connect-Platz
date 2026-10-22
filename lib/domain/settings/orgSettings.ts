// lib/domain/settings/orgSettings.ts
// Configurações persistidas em Organization.settings (JSON).

import { prisma } from "@/lib/db/prisma";
import { ScoreRulesConfig, mergeScoreRules } from "@/lib/domain/scoring/leadScore";

export interface GoalConfig {
  id: string;
  titulo: string;
  descricao?: string;
  premio?: string;
  imagemUrl?: string;
  metrica: "VENDAS" | "VGV" | "VISITAS" | "CAPTACOES";
  objetivo: number;
  inicio: string; // ISO date
  fim: string; // ISO date
}

export interface EmpresaConfig {
  telefone?: string;
  email?: string;
  endereco?: string;
  site?: string;
}

export interface OrgSettings {
  scoreRules?: Partial<ScoreRulesConfig>;
  goals?: GoalConfig[];
  empresa?: EmpresaConfig;
}

export async function getOrgSettings(organizationId: string): Promise<OrgSettings> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { settings: true },
  });
  return ((org?.settings as OrgSettings | null) || {}) as OrgSettings;
}

export async function updateOrgSettings(
  organizationId: string,
  patch: Partial<OrgSettings>
): Promise<OrgSettings> {
  const current = await getOrgSettings(organizationId);
  const next: OrgSettings = { ...current, ...patch };
  await prisma.organization.update({
    where: { id: organizationId },
    data: { settings: next as any },
  });
  return next;
}

export async function getOrgScoreRules(organizationId: string): Promise<ScoreRulesConfig> {
  const settings = await getOrgSettings(organizationId);
  return mergeScoreRules(settings.scoreRules);
}
