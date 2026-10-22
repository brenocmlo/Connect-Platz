// app/api/webhooks/dream-casa/route.ts
// Endpoint para recepção de leads do portal Dream Casa

import { NextRequest, NextResponse } from "next/server";
import { WebhookIngestorService, pickString, webhookErrorStatus } from "@/lib/services/webhook-ingestor";
import { verifyWebhookKey } from "@/lib/services/webhook-auth";
import { LeadSource } from "@prisma/client";

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "Dream Casa Webhook Listener",
    endpoint: "/api/webhooks/dream-casa",
  });
}

export async function POST(req: NextRequest) {
  try {
    const denied = verifyWebhookKey(req, "PORTAL_WEBHOOK_KEY");
    if (denied) return denied;

    const body = await req.json();

    const result = await WebhookIngestorService.ingestLead({
      channelId: "dream-casa",
      source: LeadSource.PORTAL_IMOBILIARIO,
      nome: pickString(body.nome, body.name) || "",
      telefone: pickString(body.telefone, body.phone, body.celular),
      email: pickString(body.email),
      campaignName: "Portal Dream Casa",
      codigoImovel: pickString(body.codigoImovel, body.ref),
      mensagem: pickString(body.mensagem, body.message),
      utmSource: "dreamcasa",
      utmMedium: "portal",
    });

    return NextResponse.json({
      success: true,
      leadId: result.lead?.id,
      duplicate: result.isDuplicate,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Dream Casa Webhook Error]:", error);
    return NextResponse.json(
      { error: error.message || "Erro no processamento do webhook Dream Casa" },
      { status: webhookErrorStatus(error) }
    );
  }
}
