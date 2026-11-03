import { NextRequest, NextResponse } from "next/server";
import { requireSession, ADMIN_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import {
  TrackingSettingsSchema,
  getOrganizationTrackingSettings,
  saveOrganizationTrackingSettings,
} from "@/lib/tracking/tracking-settings";

export const dynamic = "force-dynamic";

/** GET /api/integracoes/tracking: apenas administradores */
export async function GET(req: NextRequest) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const settings = await getOrganizationTrackingSettings(session.organizationId);
    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error: any) {
    console.error("[TRACKING] Erro ao carregar configurações:", error?.message);
    return NextResponse.json({ error: "Erro ao carregar configurações de rastreamento." }, { status: 500 });
  }
}

/** POST /api/integracoes/tracking: salvar configurações e registrar auditoria */
export async function POST(req: NextRequest) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = TrackingSettingsSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message || "Dados de rastreamento inválidos." },
      { status: 400 }
    );
  }

  try {
    const before = await getOrganizationTrackingSettings(session.organizationId);
    const updated = await saveOrganizationTrackingSettings(session.organizationId, parsed.data);

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Atualizou configurações de Meta Pixel, CAPI e GA4",
      tipoAcao: "UPDATE",
      modulo: "INTEGRACOES",
      entidade: "TrackingSettings",
      entidadeId: session.organizationId,
      descricao: `Configurações de Meta Pixel, CAPI e GA4 atualizadas por ${session.nome}.`,
      dadosAntes: {
        sitePixelId: before.sitePixelId,
        sitePixelActive: before.sitePixelActive,
        crmPixelId: before.crmPixelId,
        crmPixelActive: before.crmPixelActive,
        hasCapiToken: Boolean(before.capiToken),
        capiTestEventCode: before.capiTestEventCode,
        ga4MeasurementId: before.ga4MeasurementId,
        ga4Active: before.ga4Active,
      },
      dadosDepois: {
        sitePixelId: updated.sitePixelId,
        sitePixelActive: updated.sitePixelActive,
        crmPixelId: updated.crmPixelId,
        crmPixelActive: updated.crmPixelActive,
        hasCapiToken: Boolean(updated.capiToken),
        capiTestEventCode: updated.capiTestEventCode,
        ga4MeasurementId: updated.ga4MeasurementId,
        ga4Active: updated.ga4Active,
      },
    });

    return NextResponse.json({ success: true, settings: updated }, { status: 200 });
  } catch (error: any) {
    console.error("[TRACKING] Erro ao salvar configurações:", error?.message);
    return NextResponse.json({ error: "Erro ao salvar configurações de rastreamento." }, { status: 500 });
  }
}
