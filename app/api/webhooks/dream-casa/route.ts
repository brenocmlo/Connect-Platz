// app/api/webhooks/dream-casa/route.ts
// Endpoint para recepção de leads do portal Dream Casa

import { NextRequest, NextResponse } from "next/server";
import { WebhookIngestorService } from "@/lib/services/webhook-ingestor";
import { LeadSource } from "@prisma/client";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "online",
    service: "Dream Casa Webhook Listener",
    endpoint: "/api/webhooks/dream-casa",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const nome = body.nome || body.name || "Interessado Dream Casa";
    const telefone = body.telefone || body.phone || body.celular || "85988880000";
    const email = body.email || undefined;
    const codigoImovel = body.codigoImovel || body.ref || undefined;

    const result = await WebhookIngestorService.ingestLead({
      channelId: "dream-casa",
      source: LeadSource.PORTAL_IMOBILIARIO,
      nome,
      telefone,
      email,
      campaignName: "Portal Dream Casa",
      codigoImovel,
      utmSource: "dreamcasa",
      utmMedium: "portal",
    });

    return NextResponse.json({
      success: true,
      leadId: result.lead?.id,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Dream Casa Webhook Error]:", error);
    return NextResponse.json(
      { error: error.message || "Erro no processamento do webhook Dream Casa" },
      { status: 500 }
    );
  }
}
