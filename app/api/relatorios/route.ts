// app/api/relatorios/route.ts
// Relatórios BI com agregações reais (sem constantes). Corretor vê apenas os próprios dados;
// investimento/ROI de mídia (despesas do Fluxo de Caixa) apenas para a Diretoria.

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import type { BiReportData } from "@/components/crm/relatorios/types";
import { parsePeriod, rangeFilter, resolvePeriod } from "@/app/api/dashboard/_lib/period";
import { buildScope } from "@/app/api/dashboard/_lib/scope";
import { loadBiDataset } from "./_lib/dataset";
import { buildCampaigns, buildChannels, loadMediaInvestment } from "./_lib/channels";
import { buildCommissionSeries, buildConversionSeries, buildVgvSeries } from "./_lib/series";
import { buildFunnelVelocity } from "./_lib/funnelVelocity";
import { buildSummaries, loadClosedLeads } from "./_lib/summaries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const period = resolvePeriod(parsePeriod(req.nextUrl.searchParams.get("period")));
    const scope = buildScope(session);

    const [dataset, investment, funnelVelocity, closedLeads] = await Promise.all([
      loadBiDataset(scope, period),
      scope.director ? loadMediaInvestment(scope.organizationId, period) : Promise.resolve(null),
      buildFunnelVelocity(scope.organizationId, { ...scope.lead, createdAt: rangeFilter(period.current) }),
      loadClosedLeads(scope),
    ]);

    const channels = buildChannels(dataset, period, investment);

    const body: BiReportData = {
      period: { key: period.key, label: period.label },
      scope: scope.manager ? "organizacao" : "corretor",
      investmentAvailable: Boolean(investment),
      summaries: buildSummaries(dataset, period, scope, channels, funnelVelocity.stages),
      vgvSeries: buildVgvSeries(dataset),
      conversionSeries: buildConversionSeries(dataset),
      commissionSeries: buildCommissionSeries(dataset, scope.manager),
      funnelVelocity,
      channels,
      campaigns: buildCampaigns(dataset, period),
      closedLeads,
    };

    return NextResponse.json(body, { status: 200 });
  } catch (err: any) {
    console.error("[RELATORIOS] Falha ao gerar BI:", err?.message);
    return NextResponse.json({ error: "Erro ao gerar os relatórios de BI." }, { status: 500 });
  }
}
