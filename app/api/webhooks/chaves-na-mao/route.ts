// app/api/webhooks/chaves-na-mao/route.ts
// Endpoint para recepção de leads do portal Chaves na Mão

import { NextRequest, NextResponse } from "next/server";
import { WebhookIngestorService } from "@/lib/services/webhook-ingestor";
import { LeadSource } from "@prisma/client";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "online",
    service: "Chaves na Mão Webhook Listener",
    endpoint: "/api/webhooks/chaves-na-mao",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const nome = body.nome || body.name || "Interessado Chaves na Mão";
    const telefone = body.telefone || body.phone || "85988880000";
    const email = body.email || undefined;
    const codigoImovel = body.codigoImovel || body.referencia || undefined;

    const result = await WebhookIngestorService.ingestLead({
      channelId: "chaves-na-mao",
      source: LeadSource.PORTAL_IMOBILIARIO,
      nome,
      telefone,
      email,
      campaignName: "Portal Chaves na Mão",
      codigoImovel,
      utmSource: "chavesnamao",
      utmMedium: "portal",
    });

    return NextResponse.json({
      success: true,
      leadId: result.lead?.id,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Chaves na Mão Webhook Error]:", error);
    return NextResponse.json(
      { error: error.message || "Erro no processamento do webhook Chaves na Mão" },
      { status: 500 }
    );
  }
}
