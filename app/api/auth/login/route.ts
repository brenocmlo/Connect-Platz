import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { z } from "zod";
import { recordAudit } from "@/lib/services/audit-server";
import { ensureInitialSeed } from "@/lib/db/autoSeed";

const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || "Dados inválidos." }, { status: 400 });
  }

  let result;
  try {
    // Auto-seed de contingência: garante que Robson e a estrutura básica existam em bancos novos
    if (parsed.data.email === "robson@connectplatz.com.br") {
      await ensureInitialSeed().catch((err) => {
        console.warn("[Login Auto-Seed Error]:", err);
      });
    }

    result = await container.authenticateUserUseCase.execute({
      email: parsed.data.email,
      plainTextPassword: parsed.data.password,
    });
  } catch (error: any) {
    const isDbDown =
      error?.code === "P1001" ||
      error?.code === "P1002" ||
      error?.message?.includes("Can't reach database server");
    if (isDbDown) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível. Tente novamente em instantes." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error?.message || "Credenciais inválidas." }, { status: 401 });
  }

  // O token trafega apenas no cookie HttpOnly — nunca no corpo da resposta.
  const response = NextResponse.json({ user: result.user }, { status: 200 });

  const isHttps =
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https" ||
    req.headers.get("x-forwarded-ssl") === "on";

  response.cookies.set({
    name: "connect_platz_token",
    value: result.token,
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  // Registra auditoria de login
  await recordAudit({
    req,
    organizationId: result.user.organizationId,
    userId: result.user.id,
    acao: "Login de Usuário",
    tipoAcao: "LOGIN",
    modulo: "AUTENTICACAO",
    entidade: "User",
    entidadeId: result.user.id,
    entidadeNome: result.user.nome,
    descricao: `Usuário ${result.user.nome} (${result.user.email}) realizou login no sistema.`,
    dadosDepois: { email: result.user.email, role: result.user.role },
  });

  return response;
}
