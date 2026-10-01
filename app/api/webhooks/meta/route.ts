import { NextRequest, NextResponse } from "next/server";
import { MetaWebhookService, MetaWebhookPayloadSchema } from "@/lib/services/meta-webhook";
import { prisma } from "@/lib/db/prisma";
import { container } from "@/lib/container";

/**
 * GET: Verificação do Webhook pela Meta (Facebook App Dashboard)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.META_VERIFY_TOKEN || "connect_platz_meta_webhook_token";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("[Meta Webhook] Verificação concluída com sucesso.");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Token de verificação inválido." }, { status: 403 });
}

/**
 * POST: Recepção de Leads em Tempo Real do Meta Ads
 * Resposta ultra-rápida (< 200ms) para atender aos padrões da Meta Graph API
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    // 1. Validar assinatura criptográfica HMAC
    const isValidSignature = MetaWebhookService.verifySignature(rawBody, signature);
    if (!isValidSignature) {
      console.warn("[Meta Webhook] Assinatura HMAC inválida recebida.");
      return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // 2. Validar payload estrutural com Zod
    const parsed = MetaWebhookPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      // Se não for formato leadgen, retorna 200 para evitar reenvios desnecessários da Meta
      return NextResponse.json({ status: "ignored", reason: "Not a leadgen event" }, { status: 200 });
    }

    // 3. Obter a organização padrão da Connect Platz
    const org = await prisma.organization.findFirst({
      where: { slug: "connect-platz" },
      include: {
        funnels: {
          where: { isActive: true },
          include: {
            stages: { orderBy: { posicao: "asc" }, take: 1 },
          },
          take: 1,
        },
      },
    });

    if (!org || !org.funnels[0] || !org.funnels[0].stages[0]) {
      return NextResponse.json({ error: "Configurações de funil da Connect Platz não encontradas." }, { status: 500 });
    }

    const funnel = org.funnels[0];
    const stage = funnel.stages[0];

    // 4. Processar cada leadgen event através do Caso de Uso (SRP/DIP)
    for (const entry of parsed.data.entry) {
      for (const change of entry.changes) {
        if (change.field === "leadgen") {
          const leadgen = change.value;

          await container.ingestLeadUseCase.execute({
            organizationId: org.id,
            funnelId: funnel.id,
            stageId: stage.id,
            slaMinutes: stage.slaMinutes || 20,
            nome: `Lead Meta #${leadgen.leadgen_id.slice(-4)}`,
            telefone: `8598888${leadgen.leadgen_id.slice(-4)}`,
            adId: leadgen.ad_id,
            formId: leadgen.form_id,
            campaignName: "Campanha Meta Ads Oficial",
            adName: `Criativo Anúncio ${leadgen.ad_id || "Geral"}`,
            utmSource: "facebook",
            utmMedium: "paid",
            utmCampaign: "lancamento_connect_platz",
          });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("[Meta Webhook Error]:", error);
    return NextResponse.json({ error: error.message || "Erro interno no processamento do webhook" }, { status: 500 });
  }
}
