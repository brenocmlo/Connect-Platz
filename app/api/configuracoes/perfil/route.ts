// app/api/configuracoes/perfil/route.ts
// Perfil profissional do próprio usuário logado (Minha Conta). E-mail é somente leitura.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { normalizeBrPhone } from "@/lib/utils/phone";

export const dynamic = "force-dynamic";

const profileSelect = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  creci: true,
  bio: true,
  photoUrl: true,
  role: true,
} as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => (v ? v : null));

const ProfileSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome completo.").max(120),
  telefone: optionalText(30),
  creci: optionalText(30),
  bio: optionalText(1000),
  photoUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || v.startsWith("/") || v.startsWith("https://"), "URL da foto inválida.")
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
});

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const user = await prisma.user.findFirst({
      where: { id: session.userId, organizationId: session.organizationId },
      select: profileSelect,
    });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ profile: user });
  } catch (err) {
    console.error("[CONFIG/PERFIL] GET:", err);
    return NextResponse.json({ error: "Erro ao carregar o perfil." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const telefone = data.telefone ? normalizeBrPhone(data.telefone) : null;
  if (telefone && telefone.length !== 10 && telefone.length !== 11) {
    return NextResponse.json(
      { error: "Telefone inválido: informe DDD + número (10 ou 11 dígitos)." },
      { status: 400 }
    );
  }

  try {
    const before = await prisma.user.findFirst({
      where: { id: session.userId, organizationId: session.organizationId },
      select: profileSelect,
    });
    if (!before) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        nome: data.nome,
        telefone,
        creci: data.creci,
        bio: data.bio,
        photoUrl: data.photoUrl,
      },
      select: profileSelect,
    });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Atualização de Perfil",
      tipoAcao: "UPDATE",
      modulo: "CONFIGURACOES",
      entidade: "User",
      entidadeId: session.userId,
      entidadeNome: updated.nome,
      descricao: "Dados do perfil profissional atualizados pelo próprio usuário.",
      dadosAntes: {
        nome: before.nome,
        telefone: before.telefone,
        creci: before.creci,
        bio: before.bio,
        photoUrl: before.photoUrl,
      },
      dadosDepois: {
        nome: updated.nome,
        telefone: updated.telefone,
        creci: updated.creci,
        bio: updated.bio,
        photoUrl: updated.photoUrl,
      },
    });

    return NextResponse.json({ profile: updated });
  } catch (err) {
    console.error("[CONFIG/PERFIL] PATCH:", err);
    return NextResponse.json({ error: "Erro ao salvar o perfil." }, { status: 500 });
  }
}
