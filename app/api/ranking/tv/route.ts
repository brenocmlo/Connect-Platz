// app/api/ranking/tv/route.ts
// Endpoint dedicado ao Modo TV / Painel de Sala de Vendas do Connect Platz.

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import type { OrgSettings } from "@/lib/domain/settings/orgSettings";
import { resolveTvPeriod } from "./tvPeriodHelper";
import { computeTvDashboard } from "./tvMetricsCalculator";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const rawPeriod = req.nextUrl.searchParams.get("period");
    const period = resolveTvPeriod(rawPeriod);

    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: {
        nome: true,
        logoUrl: true,
        logoDarkUrl: true,
        settings: true,
      },
    });

    const settings = ((org?.settings as OrgSettings | null) || {}) as OrgSettings;
    const orgName = org?.nome || "Connect Platz";
    const orgLogoUrl = org?.logoDarkUrl || org?.logoUrl || null;

    const data = await computeTvDashboard(
      session.organizationId,
      period,
      settings.tvSettings,
      orgName,
      orgLogoUrl
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[TV_RANKING] Erro ao carregar dados do Modo TV:", error?.message);
    return NextResponse.json(
      { error: "Falha ao carregar dados do painel de TV." },
      { status: 500 }
    );
  }
}
