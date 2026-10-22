// app/api/configuracoes/senha/route.ts
// Troca de senha do próprio usuário, com verificação obrigatória da senha atual.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export const dynamic = "force-dynamic";

const ChangePasswordSchema = z.object({
  senhaAtual: z.string().min(1, "Informe a senha atual."),
  novaSenha: z
    .string()
    .min(8, "A nova senha deve ter no mínimo 8 caracteres.")
    .max(128, "A nova senha é muito longa."),
});

export async function POST(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = ChangePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }
  const { senhaAtual, novaSenha } = parsed.data;

  if (senhaAtual === novaSenha) {
    return NextResponse.json(
      { error: "A nova senha deve ser diferente da senha atual." },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: { id: session.userId, organizationId: session.organizationId, isActive: true },
      select: { id: true, nome: true, passwordHash: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const matches = await verifyPassword(senhaAtual, user.passwordHash);
    if (!matches) {
      // 400 (e não 401) para não ser confundido com sessão expirada no front
      return NextResponse.json({ error: "A senha atual está incorreta." }, { status: 400 });
    }

    const passwordHash = await hashPassword(novaSenha);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Alteração de Senha",
      tipoAcao: "UPDATE",
      modulo: "AUTENTICACAO",
      entidade: "User",
      entidadeId: user.id,
      entidadeNome: user.nome,
      descricao: "Senha de acesso alterada pelo próprio usuário (senha atual verificada).",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CONFIG/SENHA] POST:", err);
    return NextResponse.json({ error: "Erro ao alterar a senha." }, { status: 500 });
  }
}
