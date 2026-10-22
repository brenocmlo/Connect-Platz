// app/api/webhooks/google-ads/route.ts
// Endpoint para Extensões de Formulário de Lead do Google Ads

import { NextRequest, NextResponse } from "next/server";
import { WebhookIngestorService, pickString, webhookErrorStatus } from "@/lib/services/webhook-ingestor";
import { verifyWebhookKey } from "@/lib/services/webhook-auth";
import { LeadSource } from "@prisma/client";

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "Google Ads Lead Form Webhook Listener",
    endpoint: "/api/webhooks/google-ads",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Google Ads envia a chave configurada no formulário em "google_key"
    const denied = verifyWebhookKey(req, "GOOGLE_ADS_WEBHOOK_KEY", pickString(body?.google_key));
    if (denied) return denied;

    let nome: string | undefined;
    let telefone: string | undefined;
    let email: string | undefined;

    if (Array.isArray(body.user_column_data)) {
      for (const col of body.user_column_data) {
        const value = pickString(col?.string_value);
        if (col?.column_id === "FULL_NAME" || col?.column_name === "Nome completo") nome = value;
        else if (col?.column_id === "PHONE_NUMBER" || col?.column_name === "Telefone") telefone = value;
        else if (col?.column_id === "EMAIL" || col?.column_name === "E-mail") email = value;
      }
    } else {
      nome = pickString(body.nome, body.name);
      telefone = pickString(body.telefone, body.phone);
      email = pickString(body.email);
    }

    // Envio de teste do Google Ads (is_test) não gera lead no funil
    if (body.is_test === true) {
      return NextResponse.json({ status: "test_received" });
    }

    const result = await WebhookIngestorService.ingestLead({
      channelId: "google-ads",
      source: LeadSource.GOOGLE_ADS,
      nome: nome || "",
      telefone,
      email,
      formId: pickString(body.form_id),
      campaignName: body.campaign_id ? `Google Ads #${body.campaign_id}` : "Google Ads Search/Discovery",
      adName: body.form_id ? `Formulário Google #${body.form_id}` : "Extensão de Lead",
      utmSource: "google",
      utmMedium: "cpc",
      utmContent: pickString(body.lead_id),
    });

    return NextResponse.json({
      status: "received",
      leadId: result.lead?.id,
      duplicate: result.isDuplicate,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Google Ads Webhook Error]:", error);
    return NextResponse.json(
      { error: error.message || "Erro no processamento do Google Ads webhook" },
      { status: webhookErrorStatus(error) }
    );
  }
}
