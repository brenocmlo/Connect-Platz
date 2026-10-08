// app/api/webhooks/landing-page/route.ts
// Endpoint para recepção de conversões de Landing Pages (Elementor, WPForms, Contact Form 7)

import { NextRequest, NextResponse } from "next/server";
import { WebhookIngestorService } from "@/lib/services/webhook-ingestor";
import { LeadSource } from "@prisma/client";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "online",
    service: "Landing Page & Elementor Webhook Listener",
    endpoint: "/api/webhooks/landing-page",
  });
}

export async function POST(req: NextRequest) {
  try {
    let nome = "Lead Landing Page";
    let telefone = "";
    let email = "";
    let campaign = "Landing Page Oficial";
    let empreendimento = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await req.json();
      nome = json.nome || json.name || json.fields?.name?.value || nome;
      telefone = json.telefone || json.phone || json.fields?.phone?.value || "";
      email = json.email || json.fields?.email?.value || "";
      campaign = json.campanha || json.campaign || campaign;
      empreendimento = json.empreendimento || json.imovel || "";
    } else if (contentType.includes("form-data") || contentType.includes("x-www-form-urlencoded")) {
      const formData = await req.formData();
      // Elementor envia form_fields[nome] ou form_fields[name]
      nome =
        (formData.get("form_fields[nome]") as string) ||
        (formData.get("form_fields[name]") as string) ||
        (formData.get("nome") as string) ||
        (formData.get("name") as string) ||
        nome;

      telefone =
        (formData.get("form_fields[telefone]") as string) ||
        (formData.get("form_fields[phone]") as string) ||
        (formData.get("telefone") as string) ||
        (formData.get("phone") as string) ||
        "";

      email =
        (formData.get("form_fields[email]") as string) ||
        (formData.get("email") as string) ||
        "";

      campaign =
        (formData.get("form_name") as string) ||
        (formData.get("campanha") as string) ||
        campaign;
    }

    if (!telefone) {
      telefone = "85988880000";
    }

    const result = await WebhookIngestorService.ingestLead({
      channelId: "landing-page",
      source: LeadSource.CATALOGO_SITE,
      nome,
      telefone,
      email: email || undefined,
      campaignName: campaign,
      adName: empreendimento ? `Interesse: ${empreendimento}` : undefined,
      utmSource: "site_oficial",
      utmMedium: "landing_page",
    });

    return NextResponse.json({
      success: true,
      leadId: result.lead?.id,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Landing Page Webhook Error]:", error);
    return NextResponse.json(
      { error: error.message || "Erro no processamento do webhook Landing Page" },
      { status: 500 }
    );
  }
}
