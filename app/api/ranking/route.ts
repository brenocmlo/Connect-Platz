import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { RLSUserContext } from "@/lib/db/rls";

function getSessionContext(req: NextRequest): RLSUserContext | null {
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("connect_platz_token")?.value;
  const token = authHeader?.replace("Bearer ", "") || cookieToken;

  if (!token) return null;
  const session = verifySessionToken(token);
  if (!session) return null;

  return {
    userId: session.userId,
    organizationId: session.organizationId,
    role: session.role,
  };
}

export async function GET(req: NextRequest) {
  try {
    const context = getSessionContext(req);
    if (!context) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month"; // week, month, year

    const startDate = new Date();
    if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Buscar todos os corretores da organização
    const corretores = await prisma.user.findMany({
      where: {
        organizationId: context.organizationId,
        isActive: true,
        role: "CORRETOR",
      },
      select: {
        id: true,
        nome: true,
        email: true,
        photoUrl: true,
        salesAsTitular: {
          where: { dataVenda: { gte: startDate }, status: "ativa" },
          select: { valorVendaVGV: true },
        },
        bookings: {
          where: { createdAt: { gte: startDate }, status: "CONFIRMADA" },
          select: { valorTotal: true },
        },
        leads: {
          where: { createdAt: { gte: startDate } },
          select: { slaBreached: true, firstContactAt: true },
        },
        appointments: {
          where: { dataInicio: { gte: startDate }, status: "CONCLUIDO" },
          select: { id: true },
        },
      },
    });

    const ranking = corretores.map((c) => {
      const totalVgv = c.salesAsTitular.reduce(
        (acc, s) => acc + Number(s.valorVendaVGV),
        0
      );
      const totalLocacoesVeraneio = c.bookings.length;
      const totalValorVeraneio = c.bookings.reduce(
        (acc, b) => acc + Number(b.valorTotal),
        0
      );
      const totalVisitasConcluidas = c.appointments.length;
      const totalLeadsRecebidos = c.leads.length;
      const leadsNoSla = c.leads.filter((l) => !l.slaBreached && l.firstContactAt).length;
      const taxaSla = totalLeadsRecebidos > 0 ? (leadsNoSla / totalLeadsRecebidos) * 100 : 100;

      // Score de gamificação ponderado
      const gamificationScore =
        totalVgv * 0.001 +
        totalLocacoesVeraneio * 500 +
        totalVisitasConcluidas * 100 +
        taxaSla * 5;

      return {
        id: c.id,
        nome: c.nome,
        photoUrl: c.photoUrl,
        totalVgv,
        totalVendas: c.salesAsTitular.length,
        totalLocacoesVeraneio,
        totalValorVeraneio,
        totalVisitasConcluidas,
        taxaSla: Math.round(taxaSla),
        gamificationScore: Math.round(gamificationScore),
      };
    });

    // Ordenar pelo Score de Gamificação / VGV
    ranking.sort((a, b) => b.gamificationScore - a.gamificationScore);

    // Separar Pódio (Top 3) e Lista
    const podium = ranking.slice(0, 3);

    return NextResponse.json({ period, podium, fullRanking: ranking }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao consultar ranking." },
      { status: 500 }
    );
  }
}
