// app/api/webhooks/google-ads/route.ts
// Endpoint para Extensões de Formulário de Lead do Google Ads

import { NextRequest, NextResponse } from "next/server";
import { WebhookIngestorService } from "@/lib/services/webhook-ingestor";
import { LeadSource } from "@prisma/client";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "online",
    service: "Google Ads Lead Form Webhook Listener",
    endpoint: "/api/webhooks/google-ads",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validação da chave do Google Ads (Google Key)
    const expectedKey = process.env.GOOGLE_ADS_WEBHOOK_KEY || "connect_platz_google_ads_key";
    if (body.google_key && body.google_key !== expectedKey) {
      return NextResponse.json({ error: "Google Key inválida." }, { status: 401 });
    }

    // Google Ads envia 'user_column_data': array de { column_id: 'FULL_NAME', string_value: '...' }
    let nome = "Lead Google Ads";
    let telefone = "";
    let email = "";

    if (Array.isArray(body.user_column_data)) {
      for (const col of body.user_column_data) {
        if (col.column_id === "FULL_NAME" || col.column_name === "Nome completo") {
          nome = col.string_value || nome;
        } else if (col.column_id === "PHONE_NUMBER" || col.column_name === "Telefone") {
          telefone = col.string_value || telefone;
        } else if (col.column_id === "EMAIL" || col.column_name === "E-mail") {
          email = col.string_value || email;
        }
      }
    } else {
      // Fallback para envio JSON direto
      nome = body.nome || body.name || nome;
      telefone = body.telefone || body.phone || "";
      email = body.email || "";
    }

    if (!telefone) {
      telefone = "85999990000"; // fallback se for teste de envio do Google
    }

    const result = await WebhookIngestorService.ingestLead({
      channelId: "google-ads",
      source: LeadSource.GOOGLE_ADS,
      nome,
      telefone,
      email: email || undefined,
      campaignName: body.campaign_id ? `Google Ads #${body.campaign_id}` : "Google Ads Search/Discovery",
      adName: body.form_id ? `Formulário Google #${body.form_id}` : "Extensão de Lead",
      utmSource: "google",
      utmMedium: "cpc",
    });

    return NextResponse.json({
      status: "received",
      leadId: result.lead?.id,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Google Ads Webhook Error]:", error);
    return NextResponse.json(
      { error: error.message || "Erro no processamento do Google Ads webhook" },
      { status: 500 }
    );
  }
}
