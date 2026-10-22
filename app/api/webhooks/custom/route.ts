// app/api/webhooks/custom/route.ts
// Endpoint RESTful genérico para automações externas (n8n, Make, Zapier, construtoras)

import { NextRequest, NextResponse } from "next/server";
import { WebhookIngestorService, pickString, webhookErrorStatus } from "@/lib/services/webhook-ingestor";
import { verifyWebhookKey } from "@/lib/services/webhook-auth";
import { LeadSource } from "@prisma/client";

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "Connect Platz Custom API & Webhook Ingestor",
    endpoint: "/api/webhooks/custom",
    auth: "Envie a chave em 'x-api-key', 'Authorization: Bearer <chave>' ou '?token=<chave>'.",
    examplePayload: {
      nome: "Cliente Interessado",
      telefone: "85999998888",
      email: "cliente@exemplo.com.br",
      origem: "n8n_automacao",
      campanha: "Lançamento Q4",
      codigoImovel: "REF-104",
      mensagem: "Tenho interesse na unidade com vista mar.",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const denied = verifyWebhookKey(req, "CONNECT_PLATZ_API_KEY");
    if (denied) return denied;

    const body = await req.json();

    const result = await WebhookIngestorService.ingestLead({
      channelId: "api-webhooks",
      source: LeadSource.API_EXTERNA,
      nome: pickString(body.nome, body.name) || "",
      telefone: pickString(body.telefone, body.phone),
      email: pickString(body.email),
      campaignName: pickString(body.campanha, body.campaign) || "API Externa",
      codigoImovel: pickString(body.codigoImovel, body.ref),
      mensagem: pickString(body.mensagem, body.message),
      utmSource: pickString(body.origem) || "api_custom",
      utmMedium: "automation",
    });

    return NextResponse.json({
      success: true,
      leadId: result.lead?.id,
      duplicate: result.isDuplicate,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Custom Webhook Error]:", error);
    return NextResponse.json(
      { error: error.message || "Erro no processamento da API Customizada" },
      { status: webhookErrorStatus(error) }
    );
  }
}
