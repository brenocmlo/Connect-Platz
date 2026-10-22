// app/api/webhooks/chaves-na-mao/route.ts
// Endpoint para recepção de leads do portal Chaves na Mão

import { NextRequest, NextResponse } from "next/server";
import { WebhookIngestorService, pickString, webhookErrorStatus } from "@/lib/services/webhook-ingestor";
import { verifyWebhookKey } from "@/lib/services/webhook-auth";
import { LeadSource } from "@prisma/client";

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "Chaves na Mão Webhook Listener",
    endpoint: "/api/webhooks/chaves-na-mao",
  });
}

export async function POST(req: NextRequest) {
  try {
    const denied = verifyWebhookKey(req, "PORTAL_WEBHOOK_KEY");
    if (denied) return denied;

    const body = await req.json();

    const result = await WebhookIngestorService.ingestLead({
      channelId: "chaves-na-mao",
      source: LeadSource.PORTAL_IMOBILIARIO,
      nome: pickString(body.nome, body.name) || "",
      telefone: pickString(body.telefone, body.phone, body.celular),
      email: pickString(body.email),
      campaignName: "Portal Chaves na Mão",
      codigoImovel: pickString(body.codigoImovel, body.referencia),
      mensagem: pickString(body.mensagem, body.message),
      utmSource: "chavesnamao",
      utmMedium: "portal",
    });

    return NextResponse.json({
      success: true,
      leadId: result.lead?.id,
      duplicate: result.isDuplicate,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Chaves na Mão Webhook Error]:", error);
    return NextResponse.json(
      { error: error.message || "Erro no processamento do webhook Chaves na Mão" },
      { status: webhookErrorStatus(error) }
    );
  }
}
