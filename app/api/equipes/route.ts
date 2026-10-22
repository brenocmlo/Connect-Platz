// app/api/equipes/route.ts
// Quadro de colaboradores da organização (gestão). Sem fallbacks: banco vazio => lista vazia.

import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role, CorretorStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession, isDirector, MANAGER_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { hashPassword } from "@/lib/auth/password";
import { normalizeBrPhone } from "@/lib/utils/phone";

export const dynamic = "force-dynamic";

const InviteCollaboratorSchema = z.object({
  nome: z.string().trim().min(2, "Nome é obrigatório.").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  telefone: z.string().trim().max(30).optional().nullable(),
  creci: z.string().trim().max(30).optional().nullable(),
  role: z.enum(["DIRETOR", "GERENTE", "CORRETOR"]),
  senhaTemporaria: z
    .string()
    .min(8, "A senha provisória deve ter no mínimo 8 caracteres.")
    .max(128),
});

const StatusSchema = z.object({
  userId: z.string().uuid("Colaborador inválido."),
  status: z.nativeEnum(CorretorStatus),
});

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: NextRequest) {
  const auth = requireSession(req, MANAGER_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const today = startOfToday();
    const users = await prisma.user.findMany({
      where: { organizationId: session.organizationId, isActive: true },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        creci: true,
        photoUrl: true,
        role: true,
        status: true,
        lastLeadAssignedAt: true,
        checkIns: { where: { date: today }, select: { id: true }, take: 1 },
        _count: { select: { leads: { where: { isClosed: false } } } },
      },
      orderBy: { nome: "asc" },
    });

    const members = users.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      telefone: u.telefone,
      creci: u.creci,
      photoUrl: u.photoUrl,
      role: u.role,
      status: u.status,
      leadsAtivos: u._count.leads,
      hasCheckedInToday: u.checkIns.length > 0,
      lastLeadAssignedAt: u.lastLeadAssignedAt?.toISOString() || null,
    }));

    return NextResponse.json({ members });
  } catch (err) {
    console.error("[EQUIPES] GET:", err);
    return NextResponse.json({ error: "Erro ao consultar a equipe." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireSession(req, MANAGER_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = InviteCollaboratorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Gerente só cadastra corretores; cargos de gestão exigem Administrador/Diretor
  if (data.role !== "CORRETOR" && !isDirector(session.role)) {
    return NextResponse.json(
      { error: "Somente Administradores e Diretores podem cadastrar gestores." },
      { status: 403 }
    );
  }

  const telefone = data.telefone ? normalizeBrPhone(data.telefone) : null;
  if (telefone && telefone.length !== 10 && telefone.length !== 11) {
    return NextResponse.json({ error: "Telefone inválido: informe DDD + número." }, { status: 400 });
  }

  try {
    const passwordHash = await hashPassword(data.senhaTemporaria);
    const newUser = await prisma.user.create({
      data: {
        organizationId: session.organizationId,
        nome: data.nome,
        email: data.email,
        telefone,
        creci: data.creci || null,
        role: data.role as Role,
        status: CorretorStatus.OFFLINE,
        passwordHash,
      },
      select: { id: true, nome: true, email: true, telefone: true, creci: true, photoUrl: true, role: true, status: true },
    });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Cadastro de Colaborador",
      tipoAcao: "CREATE",
      modulo: "EQUIPES",
      entidade: "User",
      entidadeId: newUser.id,
      entidadeNome: newUser.nome,
      descricao: `Colaborador ${newUser.nome} (${newUser.email}) cadastrado com perfil ${newUser.role} e senha provisória.`,
      dadosDepois: { nome: newUser.nome, email: newUser.email, role: newUser.role, telefone: newUser.telefone },
    });

    return NextResponse.json(
      {
        member: {
          ...newUser,
          leadsAtivos: 0,
          hasCheckedInToday: false,
          lastLeadAssignedAt: null,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Já existe um usuário com este e-mail." }, { status: 409 });
    }
    console.error("[EQUIPES] POST:", err);
    return NextResponse.json({ error: "Erro ao cadastrar colaborador." }, { status: 500 });
  }
}

/** Altera o status operacional (roleta) de um colaborador da organização. */
export async function PATCH(req: NextRequest) {
  const auth = requireSession(req, MANAGER_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }
  const { userId, status } = parsed.data;

  try {
    const target = await prisma.user.findFirst({
      where: { id: userId, organizationId: session.organizationId, isActive: true },
      select: { id: true, nome: true, status: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Colaborador não encontrado." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { status },
      select: { id: true, nome: true, status: true },
    });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Alteração de Status na Roleta",
      tipoAcao: "STATUS_CHANGE",
      modulo: "EQUIPES",
      entidade: "User",
      entidadeId: updated.id,
      entidadeNome: updated.nome,
      descricao: `Status de ${updated.nome} alterado de ${target.status} para ${updated.status} pela gestão.`,
      dadosAntes: { status: target.status },
      dadosDepois: { status: updated.status },
    });

    return NextResponse.json({ member: updated });
  } catch (err) {
    console.error("[EQUIPES] PATCH:", err);
    return NextResponse.json({ error: "Erro ao alterar o status do colaborador." }, { status: 500 });
  }
}
