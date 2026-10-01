import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { prisma } from "@/lib/db/prisma";
import { LeadSource } from "@prisma/client";
import { z } from "zod";

const PublicLeadSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  telefone: z.string().min(8, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  propertyId: z.string().optional(),
  propertyNome: z.string().optional(),
  mensagem: z.string().optional(),
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
          take: 1,
        },
      },
    });

    if (!org || !org.funnels[0] || !org.funnels[0].stages[0]) {
      return NextResponse.json(
        { error: "Organização ou funil padrão não configurado." },
        { status: 500 }
      );
    }

    const funnel = org.funnels[0];
    const stage = funnel.stages[0];

    // Ingestão através do Caso de Uso SOLID (com Roleta Round-Robin e deduplicação)
    const result = await container.ingestLeadUseCase.execute({
      organizationId: org.id,
      funnelId: funnel.id,
      stageId: stage.id,
      slaMinutes: stage.slaMinutes || 20,
      nome: data.nome,
      telefone: data.telefone,
      email: data.email,
      source: LeadSource.CATALOGO_SITE,
      campaignName: data.propertyNome ? `Interesse: ${data.propertyNome}` : "Formulário Landing Page",
      adName: "Portal Connect Platz Oficial",
      utmSource: "site_direto",
      utmMedium: "landing_page",
    });

    // Se houver mensagem específica ou imóvel, registra na timeline do lead
    if (data.mensagem || data.propertyNome) {
      await container.leadRepository.addTimeline({
        leadId: result.lead.id,
        tipo: "nota",
        conteudo: `MENSAGEM DO CLIENTE NO PORTAL: "${data.mensagem || "Sem mensagem"}". Imóvel de interesse: ${data.propertyNome || "Não especificado"}.`,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Obrigado pelo seu contato! Seu interesse foi registrado e um de nossos corretores credenciados entrará em contato em instantes.",
        assignedCorretor: result.lead.corretor?.nome || "Equipe de Plantão",
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
