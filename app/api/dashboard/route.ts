// app/api/dashboard/route.ts
// Métricas reais da Dashboard (sem valores de exemplo). Escopo por perfil:
// - Corretor: somente as próprias vendas, comissões, leads e agenda; sem fluxo de caixa corporativo.
// - Administradores: organização inteira, incluindo o fluxo de caixa.

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import type { DashboardData } from "@/components/crm/dashboard/types";
import { parsePeriod, rangeFilter, resolvePeriod } from "./_lib/period";
import { buildScope } from "./_lib/scope";
import { buildFunnelReports } from "./_lib/funnel";
import { loadCashFlow, loadFinancial, loadOperational, loadSalesSeries } from "./_lib/dashboardMetrics";
import { loadActivities, loadAppointments, loadHotLeads, loadTeam } from "./_lib/dashboardLists";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const period = resolvePeriod(parsePeriod(req.nextUrl.searchParams.get("period")));
    const scope = buildScope(session);

    const [financial, cashFlow, operational, salesSeries, funnels, hotLeads, appointments, team, activities] =
      await Promise.all([
        loadFinancial(scope, period),
        loadCashFlow(scope, period),
        loadOperational(scope, period),
        loadSalesSeries(scope),
        buildFunnelReports(scope.organizationId, {
          ...scope.lead,
          createdAt: rangeFilter(period.current),
        }),
        loadHotLeads(scope),
        loadAppointments(scope),
        loadTeam(scope, period),
        loadActivities(scope),
      ]);

    const body: DashboardData = {
      period: { key: period.key, label: period.label },
      scope: scope.manager ? "organizacao" : "corretor",
      financial,
      cashFlow,
      operational,
      salesSeries,
      funnels,
      hotLeads,
      appointments,
      team,
      activities,
    };

    return NextResponse.json(body, { status: 200 });
  } catch (err: any) {
    console.error("[DASHBOARD] Falha ao consultar métricas:", err?.message);
    return NextResponse.json({ error: "Erro ao consultar métricas da dashboard." }, { status: 500 });
  }
}
