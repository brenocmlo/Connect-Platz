import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("connect_platz_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado: Cookie de sessão ausente." },
        { status: 401 }
      );
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json(
        { error: "Sessão inválida ou expirada." },
        { status: 401 }
      );
    }

    // Busca o estado mais recente do usuário no PostgreSQL
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dbUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          status: true,
          organizationId: true,
          creci: true,
          photoUrl: true,
          checkIns: {
            where: { date: today },
            select: { id: true },
            take: 1,
          },
        },
      });

      if (dbUser) {
        return NextResponse.json(
          {
            user: {
              id: dbUser.id,
              nome: dbUser.nome,
              email: dbUser.email,
              role: dbUser.role,
              status: dbUser.status,
              organizationId: dbUser.organizationId,
              creci: dbUser.creci || undefined,
              photoUrl: dbUser.photoUrl || undefined,
              hasCheckedInToday: dbUser.checkIns.length > 0,
            },
          },
          { status: 200 }
        );
      }
    } catch {
      // Fallback gracioso com os dados validados criptograficamente da sessão JWT
    }

    // Retorna a sessão segura validada pelo JWT
    return NextResponse.json(
      {
        user: {
          id: session.userId,
          nome: session.nome,
          email: session.email,
          role: session.role,
          status: "DISPONIVEL",
          organizationId: session.organizationId,
          hasCheckedInToday: true,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro ao recuperar sessão." },
      { status: 500 }
    );
  }
}
