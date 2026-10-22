// app/api/webhooks/grupo-olx/route.ts
// Endpoint para recepção de contatos e propostas do Grupo OLX (Zap Imóveis e Viva Real)

import { NextRequest, NextResponse } from "next/server";
import { WebhookIngestorService, pickString, webhookErrorStatus } from "@/lib/services/webhook-ingestor";
import { verifyWebhookKey } from "@/lib/services/webhook-auth";
import { LeadSource } from "@prisma/client";

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "Grupo OLX / Zap / Viva Real Webhook Listener",
    endpoint: "/api/webhooks/grupo-olx",
  });
}

export async function POST(req: NextRequest) {
  try {
    const denied = verifyWebhookKey(req, "PORTAL_WEBHOOK_KEY");
    if (denied) return denied;

    const body = await req.json();
    const portalOrigem = pickString(body.portal, body.origin, body.leadOrigin) || "Zap Imóveis / Viva Real";

    const result = await WebhookIngestorService.ingestLead({
      channelId: "grupo-olx",
      source: LeadSource.PORTAL_IMOBILIARIO,
      nome: pickString(body.nome, body.name, body.client?.name, body.lead?.name) || "",
      telefone: pickString(body.telefone, body.phone, body.ddd && body.phoneNumber ? `${body.ddd}${body.phoneNumber}` : undefined, body.client?.phone, body.lead?.phone),
      email: pickString(body.email, body.client?.email, body.lead?.email),
      campaignName: `Portal ${portalOrigem}`,
      codigoImovel: pickString(body.codigoImovel, body.propertyId, body.reference, body.clientListingId),
      mensagem: pickString(body.mensagem, body.message),
      utmSource: "olx_zap_vivareal",
      utmMedium: "portal",
    });

    return NextResponse.json({
      success: true,
      leadId: result.lead?.id,
      duplicate: result.isDuplicate,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Grupo OLX Webhook Error]:", error);
    return NextResponse.json(
      { error: error.message || "Erro no processamento do webhook Grupo OLX" },
      { status: webhookErrorStatus(error) }
    );
  }
}
