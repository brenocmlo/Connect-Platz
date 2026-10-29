// app/api/equipes/route.ts
// Quadro de colaboradores da organização (gestão). Sem fallbacks: banco vazio => lista vazia.

import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role, CorretorStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession, ADMIN_ROLES, FINANCE_ROLES, isAdmin } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { hashPassword } from "@/lib/auth/password";
import { normalizeBrPhone } from "@/lib/utils/phone";
import {
  InviteCollaboratorSchema,
  UpdateMemberSchema,
  startOfToday,
} from "./equipesSchemas";
import { handleRemoveMember } from "./equipesDeleteHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireSession(req, FINANCE_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const today = startOfToday();
    const userRole = session.role;
    const roleFilter =
      userRole === Role.FINANCEIRO_VENDA
        ? { in: [Role.CORRETOR_VENDA, Role.ADMINISTRADOR, Role.FINANCEIRO_VENDA] }
        : userRole === Role.FINANCEIRO_ALUGUEL
        ? { in: [Role.CORRETOR_ALUGUEL, Role.ADMINISTRADOR, Role.FINANCEIRO_ALUGUEL] }
        : undefined;

    const users = await prisma.user.findMany({
      where: {
        organizationId: session.organizationId,
        isActive: true,
        ...(roleFilter ? { role: roleFilter } : {}),
      },
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
  const auth = requireSession(req, FINANCE_ROLES);
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

  const targetRole = data.role;

  if (session.role === Role.FINANCEIRO_VENDA && targetRole !== Role.CORRETOR_VENDA) {
    return NextResponse.json(
      { error: "O Financeiro de Vendas só pode cadastrar corretores de venda para o seu time." },
      { status: 403 }
    );
  }
  if (session.role === Role.FINANCEIRO_ALUGUEL && targetRole !== Role.CORRETOR_ALUGUEL) {
    return NextResponse.json(
      { error: "O Financeiro de Aluguel só pode cadastrar corretores de aluguel para o seu time." },
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
        role: targetRole,
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

/** Altera dados cadastrais, cargo ou status operacional de um colaborador da organização. */
export async function PATCH(req: NextRequest) {
  const auth = requireSession(req, FINANCE_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = UpdateMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }
  const { userId, nome, email, telefone, creci, status, role } = parsed.data;

  try {
    const target = await prisma.user.findFirst({
      where: { id: userId, organizationId: session.organizationId, isActive: true },
      select: { id: true, nome: true, email: true, telefone: true, creci: true, status: true, role: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Colaborador não encontrado." }, { status: 404 });
    }

    const isSessionAdmin = isAdmin(session.role);
    const isSessionFinVenda = session.role === Role.FINANCEIRO_VENDA;
    const isSessionFinAluguel = session.role === Role.FINANCEIRO_ALUGUEL;

    // Regras de autorização por perfil:
    // Admin: pode editar corretores e financeiro (e outros administradores).
    // Financeiro Venda: pode editar corretores de venda.
    // Financeiro Aluguel: pode editar corretores de aluguel.
    if (!isSessionAdmin) {
      if (isSessionFinVenda && target.role !== Role.CORRETOR_VENDA) {
        return NextResponse.json(
          { error: "Gestor de Vendas só pode editar corretores do time de Vendas." },
          { status: 403 }
        );
      }
      if (isSessionFinAluguel && target.role !== Role.CORRETOR_ALUGUEL) {
        return NextResponse.json(
          { error: "Gestor de Aluguel só pode editar corretores do time de Aluguel." },
          { status: 403 }
        );
      }
      if (role && role !== target.role) {
        return NextResponse.json(
          { error: "Apenas o Administrador pode alterar o tipo ou cargo do colaborador." },
          { status: 403 }
        );
      }
    }

    // Se email foi alterado, checar se já está em uso
    if (email && email !== target.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== target.id) {
        return NextResponse.json(
          { error: "Este e-mail já está em uso por outro usuário." },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (nome) updateData.nome = nome;
    if (email) updateData.email = email;
    if (telefone !== undefined) updateData.telefone = telefone ? normalizeBrPhone(telefone) : null;
    if (creci !== undefined) updateData.creci = creci || null;
    if (status) updateData.status = status;
    if (role && isSessionAdmin) updateData.role = role;

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: updateData,
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
      },
    });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: role && role !== target.role ? "Alteração de Cargo do Colaborador" : "Edição de Colaborador",
      tipoAcao: "UPDATE",
      modulo: "EQUIPES",
      entidade: "User",
      entidadeId: updated.id,
      entidadeNome: updated.nome,
      descricao: `Colaborador ${updated.nome} atualizado por ${session.nome}.`,
      dadosAntes: {
        nome: target.nome,
        email: target.email,
        telefone: target.telefone,
        creci: target.creci,
        status: target.status,
        role: target.role,
      },
      dadosDepois: {
        nome: updated.nome,
        email: updated.email,
        telefone: updated.telefone,
        creci: updated.creci,
        status: updated.status,
        role: updated.role,
      },
    });

    return NextResponse.json({ member: updated });
  } catch (err) {
    console.error("[EQUIPES] PATCH:", err);
    return NextResponse.json({ error: "Erro ao atualizar o colaborador." }, { status: 500 });
  }
}

/** Remove um colaborador da organização (gestão). */
export async function DELETE(req: NextRequest) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  return handleRemoveMember(req, auth.session);
}

