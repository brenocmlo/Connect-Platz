// app/api/webhooks/grupo-olx/route.ts
// Endpoint para recepção de contatos e propostas do Grupo OLX (Zap Imóveis e Viva Real)

import { NextRequest, NextResponse } from "next/server";
import { WebhookIngestorService } from "@/lib/services/webhook-ingestor";
import { LeadSource } from "@prisma/client";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "online",
    service: "Grupo OLX / Zap / Viva Real Webhook Listener",
    endpoint: "/api/webhooks/grupo-olx",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mapeamento dos campos dos padrões LeadZap / VivaReal / OLX
    const nome =
      body.nome ||
      body.name ||
      body.client?.name ||
      body.lead?.name ||
      "Interessado Portal OLX";

    const telefone =
      body.telefone ||
      body.phone ||
      body.client?.phone ||
      body.lead?.phone ||
      "85988880000";

    const email =
      body.email ||
      body.client?.email ||
      body.lead?.email ||
      undefined;

    const portalOrigem = body.portal || body.origin || "Zap Imóveis / Viva Real";
    const codigoImovel = body.codigoImovel || body.propertyId || body.reference || undefined;
    const mensagem = body.mensagem || body.message || undefined;

    const result = await WebhookIngestorService.ingestLead({
      channelId: "grupo-olx",
      source: LeadSource.PORTAL_IMOBILIARIO,
      nome,
      telefone,
      email,
      campaignName: `Portal ${portalOrigem}`,
      codigoImovel,
      mensagem,
      utmSource: "olx_zap_vivareal",
      utmMedium: "portal",
    });

    return NextResponse.json({
      success: true,
      leadId: result.lead?.id,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Grupo OLX Webhook Error]:", error);
    return NextResponse.json(
      { error: error.message || "Erro no processamento do webhook Grupo OLX" },
      { status: 500 }
    );
  }
}
