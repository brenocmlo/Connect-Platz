// app/api/webhooks/custom/route.ts
// Endpoint RESTful genérico para automações externas (n8n, Make, Zapier, construtoras)

import { NextRequest, NextResponse } from "next/server";
import { WebhookIngestorService } from "@/lib/services/webhook-ingestor";
import { LeadSource } from "@prisma/client";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "online",
    service: "Connect Platz Custom API & Webhook Ingestor",
    endpoint: "/api/webhooks/custom",
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
    const authHeader = req.headers.get("authorization");
    const apiKeyHeader = req.headers.get("x-api-key");

    // Validação opcional de chave de API em produção
    const validApiKey = process.env.CONNECT_PLATZ_API_KEY || "connect_platz_custom_api_token";
    const providedKey = apiKeyHeader || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

    if (process.env.NODE_ENV === "production" && providedKey && providedKey !== validApiKey) {
      return NextResponse.json({ error: "Token de autorização inválido." }, { status: 401 });
    }

    const body = await req.json();

    const nome = body.nome || body.name || "Novo Contato Externo";
    const telefone = body.telefone || body.phone || "85999990000";
    const email = body.email || undefined;
    const campanha = body.campanha || body.campaign || "API Externa Customizada";
    const codigoImovel = body.codigoImovel || body.ref || undefined;
    const mensagem = body.mensagem || body.message || undefined;

    const result = await WebhookIngestorService.ingestLead({
      channelId: "api-webhooks",
      source: LeadSource.MANUAL_CORRETOR,
      nome,
      telefone,
      email,
      campaignName: campanha,
      codigoImovel,
      mensagem,
      utmSource: body.origem || "api_custom",
      utmMedium: "automation",
    });

    return NextResponse.json({
      success: true,
      leadId: result.lead?.id,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Custom Webhook Error]:", error);
    return NextResponse.json(
      { error: error.message || "Erro no processamento da API Customizada" },
      { status: 500 }
    );
  }
}
