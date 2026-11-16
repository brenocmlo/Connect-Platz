import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { prisma } from "@/lib/db/prisma";
import { LeadSource } from "@prisma/client";
import { z } from "zod";
import { getOrganizationTrackingSettings } from "@/lib/tracking/tracking-settings";
import { MetaCapiService } from "@/lib/services/meta-capi";

const PublicLeadSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  telefone: z.string().min(8, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  propertyId: z.string().optional(),
  propertyNome: z.string().optional(),
  mensagem: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
  eventId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = PublicLeadSchema.parse(body);

    const org = await prisma.organization.findFirst({
      where: { slug: "connect-platz" },
      include: {
        funnels: {
          where: { isActive: true },
          include: {
            stages: { orderBy: { posicao: "asc" }, take: 1 },
          },
          orderBy: { isDefault: "desc" },
        },
      },
    });

    if (!org || !org.funnels[0] || !org.funnels[0].stages[0]) {
      return NextResponse.json(
        { error: "Organização ou funil padrão não configurado." },
        { status: 500 }
      );
    }

    // Se o cliente selecionou um imóvel específico (via página do imóvel ou UTM), detecta dados e modalidade (Venda vs Aluguel)
    let targetModality: "VENDA" | "ALUGUEL" = "VENDA";
    let resolvedPropertyNome = data.propertyNome?.trim() || "";
    let resolvedBairros: string[] = [];

    if (data.propertyId || resolvedPropertyNome) {
      const isUuid = Boolean(data.propertyId && /^[0-9a-f-]{36}$/i.test(data.propertyId));
      const prop = await prisma.property.findFirst({
        where: {
          organizationId: org.id,
          ...(isUuid
            ? { id: data.propertyId }
            : data.propertyId
            ? { OR: [{ slug: data.propertyId }, { nome: { equals: data.propertyId, mode: "insensitive" } }] }
            : { nome: { equals: resolvedPropertyNome, mode: "insensitive" } }),
        },
        select: { nome: true, modalidade: true, bairro: true, cidade: true },
      });
      if (prop) {
        resolvedPropertyNome = prop.nome;
        if (prop.modalidade === "VERANEIO_TEMPORADA" || prop.modalidade === "LOCACAO_ANUAL") {
          targetModality = "ALUGUEL";
        }
        resolvedBairros = [prop.bairro, prop.cidade].filter(Boolean) as string[];
      }
    }

    const funnel =
      org.funnels.find((f) => f.modalidade === targetModality && f.stages.length > 0) ||
      org.funnels[0];
    const stage = funnel.stages[0];
    const resolvedModality: "VENDA" | "ALUGUEL" =
      funnel.modalidade === "ALUGUEL" ? "ALUGUEL" : targetModality;

    // Ingestão com Roleta Round-Robin e deduplicação
    const result = await container.ingestLeadUseCase.execute({
      organizationId: org.id,
      funnelId: funnel.id,
      stageId: stage.id,
      modalidade: resolvedModality,
      operatingStart: org.operatingStart,
      operatingEnd: org.operatingEnd,
      slaMinutes: stage.slaMinutes || 20,
      nome: data.nome,
      telefone: data.telefone,
      email: data.email,
      source: LeadSource.CATALOGO_SITE,
      campaignName: data.utmCampaign || (resolvedPropertyNome ? `Interesse: ${resolvedPropertyNome}` : "Formulário Landing Page"),
      adName: resolvedPropertyNome
        ? `Interesse: ${resolvedPropertyNome}`
        : data.utmContent || "Portal Connect Platz Oficial",
      utmSource: data.utmSource || "site_direto",
      utmMedium: data.utmMedium || "landing_page",
      utmCampaign: data.utmCampaign,
      utmContent: data.utmContent,
      utmTerm: data.utmTerm,
      fbp: data.fbp,
      fbc: data.fbc,
      eventId: data.eventId,
      bairrosInteresse: resolvedBairros.length > 0 ? resolvedBairros : undefined,
      mensagem: [data.mensagem, resolvedPropertyNome ? `Imóvel de interesse: ${resolvedPropertyNome}` : null]
        .filter(Boolean)
        .join(" — ") || undefined,
    });

    // Disparo Server-Side CAPI para Meta (não bloqueante)
    const tracking = await getOrganizationTrackingSettings(org.id).catch(() => null);
    const pixelId = tracking?.sitePixelId || tracking?.crmPixelId;

    if (tracking?.capiToken && pixelId && (tracking?.sitePixelActive || tracking?.crmPixelActive)) {
      const nameParts = data.nome.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

      const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip");
      const userAgent = req.headers.get("user-agent");

      // Executa de forma assíncrona para não atrasar a resposta ao usuário
      MetaCapiService.sendEvent({
        pixelId,
        token: tracking.capiToken,
        testEventCode: tracking.capiTestEventCode,
        eventName: "Lead",
        eventId: data.eventId,
        actionSource: "website",
        userData: {
          email: data.email || undefined,
          phone: data.telefone,
          firstName,
          lastName,
          clientIpAddress: clientIp,
          clientUserAgent: userAgent,
          fbp: data.fbp,
          fbc: data.fbc,
        },
        customData: {
          contentName: data.propertyNome || "Interesse no Catálogo",
          contentCategory: "Imóvel",
        },
      }).catch((err) => {
        console.warn("[Meta CAPI] Falha ao enviar evento Lead:", err?.message);
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Obrigado pelo seu contato! Seu interesse foi registrado e um de nossos corretores credenciados entrará em contato em instantes.",
        assignedCorretor: result.lead.corretor?.nome || "Equipe de Plantão",
        assignedCorretorPhone: result.lead.corretor?.telefone || "85999990001",
        leadId: result.lead.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao registrar solicitação." },
      { status: 400 }
    );
  }
}
