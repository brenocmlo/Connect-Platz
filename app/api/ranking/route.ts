// app/api/ranking/route.ts
// Ranking e gamificação com dados reais do período (?period=). Sem fallback fictício:
// organização sem colaboradores/resultados ⇒ listas vazias e leader = null.

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { parsePeriod, resolvePeriod } from "@/app/api/dashboard/_lib/period";
import { computeUserMetrics } from "@/app/api/dashboard/_lib/userMetrics";
import type { RankingResponse } from "@/components/crm/ranking/types";
import { buildHighlights, buildRanking } from "./_lib/rankItems";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const period = resolvePeriod(parsePeriod(req.nextUrl.searchParams.get("period")));

    const [users, metrics] = await Promise.all([
      prisma.user.findMany({
        where: { organizationId: session.organizationId, isActive: true, role: { in: ["CORRETOR", "GERENTE"] } },
        select: { id: true, nome: true, role: true, photoUrl: true },
        orderBy: { nome: "asc" },
      }),
      computeUserMetrics(session.organizationId, period.current),
    ]);

    const fullRanking = buildRanking(users.filter((u) => u.role === "CORRETOR"), metrics);
    const gerentes = buildRanking(users.filter((u) => u.role === "GERENTE"), metrics, true);
    const podium = fullRanking.filter((b) => b.noPodio).slice(0, 3);

    const body: RankingResponse = {
      period: { key: period.key, label: period.label },
      podium,
      fullRanking,
      gerentes,
      highlights: buildHighlights(fullRanking),
      leader: podium[0] || null,
      currentUserId: session.userId,
    };
    return NextResponse.json(body, { status: 200 });
  } catch (error: any) {
    console.error("[RANKING] Falha ao calcular ranking:", error?.message);
    return NextResponse.json({ error: "Erro ao calcular o ranking." }, { status: 500 });
  }
}
