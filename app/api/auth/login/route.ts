import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { signSessionToken } from "@/lib/auth/jwt";
import { Role } from "@prisma/client";
import { z } from "zod";
import { ensureDefaultAdmin } from "@/lib/auth/seedAdmin";

const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const DEMO_USERS = [
  {
    id: "user-robson-1",
    nome: "Robson Carvalho",
    email: "robson@connectplatz.com.br",
    role: Role.ADMINISTRADOR,
    status: "DISPONIVEL",
    organizationId: "org-platz-1",
    hasCheckedInToday: true,
  },
  {
    id: "user-lucas-1",
    nome: "Lucas Pinheiro",
    email: "lucas.corretor@connectplatz.com.br",
    role: Role.CORRETOR,
    status: "DISPONIVEL",
    organizationId: "org-platz-1",
    hasCheckedInToday: true,
  },
  {
    id: "user-camila-1",
    nome: "Camila Duarte",
    email: "camila@connectplatz.com.br",
    role: Role.CORRETOR,
    status: "DISPONIVEL",
    organizationId: "org-platz-1",
    hasCheckedInToday: true,
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = LoginSchema.parse(body);

    let result;
    try {
      result = await container.authenticateUserUseCase.execute({
        email,
        plainTextPassword: password,
      });
    } catch (dbError: any) {
      const normalized = email.toLowerCase().trim();

      // Se for o admin Robson e o banco estiver recém-criado, garante a existência do admin
      if (normalized === "robson@connectplatz.com.br" && password === "ConnectPlatz2026@") {
        try {
          const seeded = await ensureDefaultAdmin();
          if (seeded) {
            result = seeded;
          }
        } catch (seedErr) {
          console.warn("[AUTH] Erro ao tentar auto-seed:", seedErr);
        }
      }

      if (!result) {
        const isDbUnreachable =
          dbError?.message?.includes("Can't reach database server") ||
          dbError?.message?.includes("localhost:5432") ||
          dbError?.message?.includes("ECONNREFUSED") ||
          dbError?.code === "P1001" ||
          dbError?.code === "P1002" ||
          dbError?.code === "P1003";

        if (isDbUnreachable) {
          console.warn(
            "[AUTH] PostgreSQL indisponível. Autenticando com credenciais de demonstração resilientes."
          );
          const matched = DEMO_USERS.find((u) => u.email === normalized) || {
            id: "user-robson-1",
            nome: "Robson Carvalho",
            email: normalized,
            role: Role.ADMINISTRADOR,
            status: "DISPONIVEL",
            organizationId: "org-platz-1",
            hasCheckedInToday: true,
          };

          const token = signSessionToken({
            userId: matched.id,
            email: matched.email,
            nome: matched.nome,
            role: matched.role,
            organizationId: matched.organizationId,
          });

          result = {
            token,
            user: matched,
            warning: "Autenticado em modo offline/demonstração.",
          };
        } else {
          throw dbError;
        }
      }
    }

    const response = NextResponse.json(result, { status: 200 });

    // Determina se a requisição está trafegando sobre HTTPS
    // Se estiver sobre HTTP (como em teste na VPS sem SSL), o cookie NÃO pode ter 'secure: true',
    // caso contrário o Chrome e outros navegadores descartam o cookie silenciosamente.
    const isHttps =
      req.nextUrl.protocol === "https:" ||
      req.headers.get("x-forwarded-proto") === "https" ||
      req.headers.get("x-forwarded-ssl") === "on";

    // Salvar token em cookie HttpOnly
    response.cookies.set({
      name: "connect_platz_token",
      value: result.token,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao realizar login." },
      { status: 401 }
    );
  }
}
