// app/api/metas/route.ts
// Metas e incentivos persistidos em Organization.settings.goals.
// Leitura: qualquer usuário autenticado (progresso calculado de dados reais).
// Escrita (POST/PATCH/DELETE): somente gestores, com registro em audit_logs.

import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { MANAGER_ROLES, isManager, requireSession } from "@/lib/auth/session";
import { getOrgSettings, updateOrgSettings, GoalConfig } from "@/lib/domain/settings/orgSettings";
import { recordAudit } from "@/lib/services/audit-server";
import { validateGoal, withProgress } from "./_lib/goals";

export const dynamic = "force-dynamic";

const describe = (g: GoalConfig) => `${g.objetivo} (${g.metrica}) de ${g.inicio} a ${g.fim}`;

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const settings = await getOrgSettings(session.organizationId);
    const manager = isManager(session.role);
    const goals = await withProgress(session.organizationId, settings.goals || [], {
      userId: session.userId,
      manager,
    });
    return NextResponse.json({ goals, canManage: manager }, { status: 200 });
  } catch (error: any) {
    console.error("[METAS] Falha ao listar metas:", error?.message);
    return NextResponse.json({ error: "Erro ao carregar as metas." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireSession(req, MANAGER_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const body = await req.json().catch(() => null);
    const result = validateGoal(body);
    if (result.error !== undefined) return NextResponse.json({ error: result.error }, { status: 400 });

    const goal: GoalConfig = { id: randomUUID(), ...result.goal };
    const settings = await getOrgSettings(session.organizationId);
    await updateOrgSettings(session.organizationId, { goals: [...(settings.goals || []), goal] });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Cadastro de Meta de Incentivo",
      tipoAcao: "CREATE",
      modulo: "METAS",
      entidade: "Meta",
      entidadeId: goal.id,
      entidadeNome: goal.titulo,
      descricao: `Meta "${goal.titulo}" cadastrada: ${describe(goal)}.`,
      dadosDepois: { ...goal },
    });

    const [item] = await withProgress(session.organizationId, [goal], { userId: session.userId, manager: true });
    return NextResponse.json({ goal: item }, { status: 201 });
  } catch (error: any) {
    console.error("[METAS] Falha ao criar meta:", error?.message);
    return NextResponse.json({ error: "Erro ao salvar a meta." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireSession(req, MANAGER_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const body = await req.json().catch(() => null);
    const id = String(body?.id || "");
    if (!id) return NextResponse.json({ error: "Informe o id da meta." }, { status: 400 });

    const settings = await getOrgSettings(session.organizationId);
    const goals = settings.goals || [];
    const current = goals.find((g) => g.id === id);
    if (!current) return NextResponse.json({ error: "Meta não encontrada." }, { status: 404 });

    const { id: _ignored, ...base } = current;
    const result = validateGoal(body, base);
    if (result.error !== undefined) return NextResponse.json({ error: result.error }, { status: 400 });

    const updated: GoalConfig = { id, ...result.goal };
    await updateOrgSettings(session.organizationId, { goals: goals.map((g) => (g.id === id ? updated : g)) });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Edição de Meta de Incentivo",
      tipoAcao: "UPDATE",
      modulo: "METAS",
      entidade: "Meta",
      entidadeId: id,
      entidadeNome: updated.titulo,
      descricao: `Meta "${updated.titulo}" atualizada: ${describe(updated)}.`,
      dadosAntes: { ...current },
      dadosDepois: { ...updated },
    });

    const [item] = await withProgress(session.organizationId, [updated], { userId: session.userId, manager: true });
    return NextResponse.json({ goal: item }, { status: 200 });
  } catch (error: any) {
    console.error("[METAS] Falha ao atualizar meta:", error?.message);
    return NextResponse.json({ error: "Erro ao atualizar a meta." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireSession(req, MANAGER_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const id = req.nextUrl.searchParams.get("id") || "";
    if (!id) return NextResponse.json({ error: "Informe o id da meta." }, { status: 400 });

    const settings = await getOrgSettings(session.organizationId);
    const goals = settings.goals || [];
    const current = goals.find((g) => g.id === id);
    if (!current) return NextResponse.json({ error: "Meta não encontrada." }, { status: 404 });

    await updateOrgSettings(session.organizationId, { goals: goals.filter((g) => g.id !== id) });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Exclusão de Meta de Incentivo",
      tipoAcao: "DELETE",
      modulo: "METAS",
      entidade: "Meta",
      entidadeId: id,
      entidadeNome: current.titulo,
      descricao: `Meta "${current.titulo}" removida.`,
      dadosAntes: { ...current },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("[METAS] Falha ao excluir meta:", error?.message);
    return NextResponse.json({ error: "Erro ao excluir a meta." }, { status: 500 });
  }
}
