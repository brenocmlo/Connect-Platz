import { businessDay } from "@/lib/utils/businessDay";
import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getRequestSession(req);
    if (!session) {
      return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 });
    }

    // Busca o estado mais recente do usuário no PostgreSQL
    try {
      const today = businessDay();

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
          isActive: true,
          photoUrl: true,
          checkIns: {
            where: { date: today },
            select: { id: true },
            take: 1,
          },
        },
      });

      if (dbUser && dbUser.isActive) {
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
    } catch (dbErr: any) {
      return NextResponse.json({ error: "Serviço temporariamente indisponível." }, { status: 503 });
    }

    return NextResponse.json({ error: "Usuário não encontrado ou inativo." }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro ao recuperar sessão." },
      { status: 500 }
    );
  }
}
