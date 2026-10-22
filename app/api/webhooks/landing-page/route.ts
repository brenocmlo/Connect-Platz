// app/api/webhooks/landing-page/route.ts
// Endpoint para recepção de conversões de Landing Pages (Elementor, WPForms, Contact Form 7)
// Autenticação: LANDING_PAGE_WEBHOOK_KEY via header ou "?token=" na URL configurada no formulário.

import { NextRequest, NextResponse } from "next/server";
import { WebhookIngestorService, pickString, webhookErrorStatus } from "@/lib/services/webhook-ingestor";
import { verifyWebhookKey } from "@/lib/services/webhook-auth";
import { LeadSource } from "@prisma/client";

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "Landing Page & Elementor Webhook Listener",
    endpoint: "/api/webhooks/landing-page",
  });
}

interface LandingFields {
  nome?: string;
  telefone?: string;
  email?: string;
  campanha?: string;
  empreendimento?: string;
  mensagem?: string;
}

async function readFields(req: NextRequest): Promise<LandingFields> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const json = await req.json();
    return {
      nome: pickString(json.nome, json.name, json.fields?.name?.value, json.fields?.nome?.value),
      telefone: pickString(json.telefone, json.phone, json.fields?.phone?.value, json.fields?.telefone?.value),
      email: pickString(json.email, json.fields?.email?.value),
      campanha: pickString(json.campanha, json.campaign, json.form_name),
      empreendimento: pickString(json.empreendimento, json.imovel),
      mensagem: pickString(json.mensagem, json.message, json.fields?.message?.value),
    };
  }

  if (contentType.includes("form-data") || contentType.includes("x-www-form-urlencoded")) {
    const fd = await req.formData();
    const get = (...keys: string[]) => pickString(...keys.map((k) => fd.get(k)));
    // Elementor envia form_fields[nome] / form_fields[name]
    return {
      nome: get("form_fields[nome]", "form_fields[name]", "nome", "name"),
      telefone: get("form_fields[telefone]", "form_fields[phone]", "telefone", "phone"),
      email: get("form_fields[email]", "email"),
      campanha: get("form_name", "campanha"),
      empreendimento: get("form_fields[empreendimento]", "empreendimento"),
      mensagem: get("form_fields[mensagem]", "form_fields[message]", "mensagem", "message"),
    };
  }

  return {};
}

export async function POST(req: NextRequest) {
  try {
    const denied = verifyWebhookKey(req, "LANDING_PAGE_WEBHOOK_KEY");
    if (denied) return denied;

    const fields = await readFields(req);

    const result = await WebhookIngestorService.ingestLead({
      channelId: "landing-page",
      source: LeadSource.CATALOGO_SITE,
      nome: fields.nome || "",
      telefone: fields.telefone,
      email: fields.email,
      campaignName: fields.campanha || "Landing Page Oficial",
      adName: fields.empreendimento ? `Interesse: ${fields.empreendimento}` : undefined,
      mensagem: fields.mensagem,
      utmSource: "site_oficial",
      utmMedium: "landing_page",
    });

    return NextResponse.json({
      success: true,
      leadId: result.lead?.id,
      duplicate: result.isDuplicate,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Landing Page Webhook Error]:", error);
    return NextResponse.json(
      { error: error.message || "Erro no processamento do webhook Landing Page" },
      { status: webhookErrorStatus(error) }
    );
  }
}
