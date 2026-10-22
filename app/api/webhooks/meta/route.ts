import { NextRequest, NextResponse } from "next/server";
import { MetaWebhookService, MetaWebhookPayloadSchema } from "@/lib/services/meta-webhook";
import { prisma } from "@/lib/db/prisma";
import { container } from "@/lib/container";
import { recordAudit } from "@/lib/services/audit-server";
import { LeadSource } from "@prisma/client";

/**
 * GET: Verificação do Webhook pela Meta (Facebook App Dashboard)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.META_VERIFY_TOKEN;
  if (!expectedToken) {
    return NextResponse.json({ error: "META_VERIFY_TOKEN não configurado." }, { status: 503 });
  }

  if (mode === "subscribe" && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Token de verificação inválido." }, { status: 403 });
}

/**
 * POST: Recepção de Leads em Tempo Real do Meta Ads
 * Valida HMAC, busca os dados reais do formulário na Graph API e distribui na roleta.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    if (!MetaWebhookService.verifySignature(rawBody, signature)) {
      console.warn("[Meta Webhook] Assinatura HMAC ausente ou inválida.");
      return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
    }

    const parsed = MetaWebhookPayloadSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      // Não é leadgen: 200 para evitar reenvios desnecessários da Meta
      return NextResponse.json({ status: "ignored", reason: "Not a leadgen event" }, { status: 200 });
    }

    const org = await prisma.organization.findFirst({
      where: { slug: "connect-platz" },
      include: {
        funnels: {
          where: { isActive: true },
          include: { stages: { orderBy: { posicao: "asc" }, take: 1 } },
          take: 1,
        },
      },
    });

    if (!org || !org.funnels[0] || !org.funnels[0].stages[0]) {
      return NextResponse.json({ error: "Configurações de funil da Connect Platz não encontradas." }, { status: 500 });
    }

    const funnel = org.funnels[0];
    const stage = funnel.stages[0];
    const leadIds: string[] = [];

    for (const entry of parsed.data.entry) {
      for (const change of entry.changes) {
        if (change.field !== "leadgen") continue;
        const leadgen = change.value;
        const data = await MetaWebhookService.fetchLeadData(leadgen.leadgen_id);
        const pending = !data || (!data.telefone && !data.email);

        const result = await container.ingestLeadUseCase.execute({
          organizationId: org.id,
          funnelId: funnel.id,
          stageId: stage.id,
          slaMinutes: stage.slaMinutes || 20,
          nome: data?.nome || `Lead Meta Ads #${leadgen.leadgen_id.slice(-6)} (contato pendente)`,
          telefone: data?.telefone || "",
          email: data?.email || null,
          source: LeadSource.META_ADS,
          adId: leadgen.ad_id,
          formId: leadgen.form_id,
          campaignName: data?.campaignName || "Meta Ads Lead Form",
          adName: data?.adName || (leadgen.ad_id ? `Anúncio ${leadgen.ad_id}` : undefined),
          utmSource: "facebook",
          utmMedium: "paid",
          utmContent: leadgen.leadgen_id,
          allowMissingContact: true,
          mensagem: pending
            ? `Dados de contato não obtidos da Graph API (leadgen_id ${leadgen.leadgen_id}). Verifique META_PAGE_ACCESS_TOKEN ou baixe o lead na Central de Leads da Meta.`
            : undefined,
        });
        leadIds.push(result.lead.id);

        await recordAudit({
          organizationId: org.id,
          userId: null,
          ator: "Integração: meta-ads",
          acao: "Entrada de Lead (meta-ads)",
          tipoAcao: "CREATE",
          modulo: "INTEGRACOES",
          entidade: "Lead",
          entidadeId: result.lead.id,
          entidadeNome: result.lead.nome,
          descricao: `Lead Meta (leadgen ${leadgen.leadgen_id}) recebido${pending ? " com contato pendente" : ""}. ${result.message}`,
        });
      }
    }

    return NextResponse.json({ received: true, leadIds }, { status: 200 });
  } catch (error: any) {
    console.error("[Meta Webhook Error]:", error);
    return NextResponse.json({ error: error.message || "Erro interno no processamento do webhook" }, { status: 500 });
  }
}
