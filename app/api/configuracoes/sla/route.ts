// app/api/configuracoes/sla/route.ts
// Motor de SLA: prazos por etapa do funil ativo + parâmetros do Bolsão. Restrito à gestão.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession, ADMIN_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";

export const dynamic = "force-dynamic";

const ACTIONS = ["transbordo", "bolsao", "notificar"] as const;

const SlaSchema = z.object({
  bolsaoEnabled: z.boolean(),
  bolsaoTimeoutMin: z
    .number()
    .int("O tempo do bolsão deve ser um número inteiro.")
    .min(1, "O tempo do bolsão deve ser de pelo menos 1 minuto.")
    .max(1440, "O tempo do bolsão não pode passar de 1440 minutos."),
  stages: z
    .array(
      z.object({
        id: z.string().uuid(),
        slaMinutes: z
          .number()
          .int("O SLA deve ser um número inteiro de minutos.")
          .min(1, "O SLA deve ser de pelo menos 1 minuto.")
          .max(43200, "O SLA não pode passar de 30 dias (43200 min).")
          .nullable(),
        actionOnExpire: z.enum(ACTIONS),
      })
    )
    .max(50),
});

async function loadActiveFunnel(organizationId: string) {
  return prisma.funnel.findFirst({
    where: { organizationId, isActive: true },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      nome: true,
      stages: {
        orderBy: { posicao: "asc" },
        select: { id: true, nome: true, posicao: true, cor: true, slaMinutes: true, actionOnExpire: true },
      },
    },
  });
}

async function loadSlaState(organizationId: string) {
  const [org, funnel] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { bolsaoEnabled: true, bolsaoTimeoutMin: true, operatingStart: true, operatingEnd: true },
    }),
    loadActiveFunnel(organizationId),
  ]);
  if (!org) return null;
  return {
    ...org,
    funnel: funnel ? { id: funnel.id, nome: funnel.nome } : null,
    stages: funnel?.stages || [],
  };
}

export async function GET(req: NextRequest) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const state = await loadSlaState(session.organizationId);
    if (!state) {
      return NextResponse.json({ error: "Organização não encontrada." }, { status: 404 });
    }
    return NextResponse.json(state);
  } catch (err) {
    console.error("[CONFIG/SLA] GET:", err);
    return NextResponse.json({ error: "Erro ao carregar as regras de SLA." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = SlaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  try {
    const before = await loadSlaState(session.organizationId);
    if (!before) {
      return NextResponse.json({ error: "Organização não encontrada." }, { status: 404 });
    }

    // Só aceita etapas do funil ativo desta organização
    const allowedIds = new Set(before.stages.map((s) => s.id));
    const foreign = data.stages.find((s) => !allowedIds.has(s.id));
    if (foreign) {
      return NextResponse.json(
        { error: "Etapa informada não pertence ao funil ativo da organização." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.organization.update({
        where: { id: session.organizationId },
        data: { bolsaoEnabled: data.bolsaoEnabled, bolsaoTimeoutMin: data.bolsaoTimeoutMin },
      }),
      ...data.stages.map((s) =>
        prisma.funnelStage.update({
          where: { id: s.id },
          data: { slaMinutes: s.slaMinutes, actionOnExpire: s.actionOnExpire },
        })
      ),
    ]);

    const after = await loadSlaState(session.organizationId);

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Atualização das Regras de SLA",
      tipoAcao: "UPDATE",
      modulo: "CONFIGURACOES",
      entidade: "Funnel",
      entidadeId: before.funnel?.id || null,
      entidadeNome: before.funnel?.nome || "Motor de SLA",
      descricao: `Bolsão ${data.bolsaoEnabled ? "ativo" : "inativo"} (${data.bolsaoTimeoutMin} min); ${data.stages.length} etapa(s) com SLA atualizado.`,
      dadosAntes: {
        bolsaoEnabled: before.bolsaoEnabled,
        bolsaoTimeoutMin: before.bolsaoTimeoutMin,
        stages: before.stages.map((s) => ({ nome: s.nome, slaMinutes: s.slaMinutes, actionOnExpire: s.actionOnExpire })),
      },
      dadosDepois: {
        bolsaoEnabled: after?.bolsaoEnabled,
        bolsaoTimeoutMin: after?.bolsaoTimeoutMin,
        stages: (after?.stages || []).map((s) => ({ nome: s.nome, slaMinutes: s.slaMinutes, actionOnExpire: s.actionOnExpire })),
      },
    });

    return NextResponse.json(after);
  } catch (err) {
    console.error("[CONFIG/SLA] PATCH:", err);
    return NextResponse.json({ error: "Erro ao salvar as regras de SLA." }, { status: 500 });
  }
}
