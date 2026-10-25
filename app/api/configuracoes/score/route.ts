// app/api/configuracoes/score/route.ts
// Régua determinística de score (settings.scoreRules). Ao salvar, recalcula os leads abertos da organização.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession, ADMIN_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { DEFAULT_SCORE_RULES, ScoreRulesConfig } from "@/lib/domain/scoring/leadScore";
import { getOrgScoreRules, updateOrgSettings } from "@/lib/domain/settings/orgSettings";
import { refreshLeadScore } from "@/lib/services/lead-score";

export const dynamic = "force-dynamic";

const RECALC_BATCH = 25;

const points = z.number().int("Use apenas pontos inteiros.").min(0, "Pontos não podem ser negativos.").max(100, "Máximo de 100 pontos por critério.");

const ScoreRulesSchema = z
  .object({
    phonePoints: points,
    emailPoints: points,
    propertyPoints: points,
    incomePoints: points,
    fastResponsePoints: points,
    docPoints: points,
    visitPoints: points,
    proposalPoints: points,
    highIncomeMin: z.number().min(0, "Renda mínima inválida.").max(10_000_000, "Renda mínima muito alta."),
    hotThreshold: z.number().int().min(1).max(100),
    warmThreshold: z.number().int().min(0).max(99),
  })
  .refine((r) => r.warmThreshold < r.hotThreshold, {
    message: "O limiar de Lead Morno deve ser menor que o de Lead Quente.",
  });

export async function GET(req: NextRequest) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const rules = await getOrgScoreRules(session.organizationId);
    return NextResponse.json({ rules, defaults: DEFAULT_SCORE_RULES });
  } catch (err) {
    console.error("[CONFIG/SCORE] GET:", err);
    return NextResponse.json({ error: "Erro ao carregar a régua de score." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = ScoreRulesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Parâmetros de score inválidos." },
      { status: 400 }
    );
  }
  const rules: ScoreRulesConfig = parsed.data;

  try {
    const before = await getOrgScoreRules(session.organizationId);
    await updateOrgSettings(session.organizationId, { scoreRules: rules });

    // Recalcula score + temperatura dos leads abertos em lotes
    const openLeads = await prisma.lead.findMany({
      where: { organizationId: session.organizationId, isClosed: false },
      select: { id: true },
    });
    let recalculados = 0;
    for (let i = 0; i < openLeads.length; i += RECALC_BATCH) {
      const batch = openLeads.slice(i, i + RECALC_BATCH);
      const results = await Promise.allSettled(batch.map((l) => refreshLeadScore(l.id)));
      recalculados += results.filter((r) => r.status === "fulfilled" && r.value).length;
    }

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Atualização da Régua de Score",
      tipoAcao: "UPDATE",
      modulo: "CONFIGURACOES",
      entidade: "Organization",
      entidadeId: session.organizationId,
      entidadeNome: "Régua Determinística de Score",
      descricao: `Régua de score calibrada (Quente ≥ ${rules.hotThreshold}, Morno ≥ ${rules.warmThreshold}). ${recalculados} de ${openLeads.length} lead(s) aberto(s) recalculado(s).`,
      dadosAntes: { ...before },
      dadosDepois: { ...rules },
    });

    return NextResponse.json({ rules, recalculados, totalAbertos: openLeads.length });
  } catch (err) {
    console.error("[CONFIG/SCORE] PUT:", err);
    return NextResponse.json({ error: "Erro ao salvar a régua de score." }, { status: 500 });
  }
}
