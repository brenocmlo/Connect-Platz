import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthService } from "@/lib/auth/service";
import { getRequestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const ExtensionLoginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(1, "Senha é obrigatória."),
});

/**
 * POST /api/extension/auth
 * Autentica o usuário na extensão Chrome e retorna o Bearer Token e dados do perfil.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ExtensionLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const result = await AuthService.login(parsed.data.email, parsed.data.password);

    // Buscar informações adicionais da organização para a extensão
    const org = await prisma.organization.findUnique({
      where: { id: result.user.organizationId },
      select: { nome: true, cnpj: true },
    });

    return NextResponse.json({
      success: true,
      token: result.token,
      user: {
        id: result.user.id,
        nome: result.user.nome,
        email: result.user.email,
        role: result.user.role,
        organizationId: result.user.organizationId,
        organizationNome: org?.nome || "Connect Platz Imobiliária",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro na autenticação da extensão.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

/**
 * GET /api/extension/auth
 * Valida o token atual e retorna os dados do perfil autenticado.
 */
export async function GET(req: NextRequest) {
  const session = getRequestSession(req);
  if (!session) {
    return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { organization: { select: { nome: true } } },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Usuário inativo ou não encontrado." }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationNome: user.organization?.nome || "Connect Platz",
    },
  });
}
