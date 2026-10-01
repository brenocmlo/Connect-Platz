import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { maskLeadSensitiveData, RLSUserContext } from "@/lib/db/rls";
import { z } from "zod";

function getSessionContext(req: NextRequest): RLSUserContext | null {
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("connect_platz_token")?.value;
  const token = authHeader?.replace("Bearer ", "") || cookieToken;

  if (!token) return null;
  const session = verifySessionToken(token);
  if (!session) return null;

  return {
    userId: session.userId,
    organizationId: session.organizationId,
    role: session.role,
  };
}

const UpdateLeadSchema = z.object({
  stageId: z.string().uuid().optional(),
  action: z.enum(["ASSUMIR_BOLSAO", "ATUALIZAR_CREDITO", "REGISTRAR_CONTATO", "MUDAR_ETAPA"]).optional(),
  // Campos de crédito
  tipoOcupacaoCredito: z.enum(["CLT", "AUTONOMO", "EMPRESARIO", "APOSENTADO_PENSIONISTA", "OUTRO"]).optional(),
  rendaDeclarada: z.number().optional(),
  rendaEspecificaAutonomo: z.number().optional(),
  faixaRenda: z.string().optional(),
  statusCredito: z.enum(["NAO_INICIADA", "EM_ANALISE", "DOCUMENTACAO_PENDENTE", "APROVADO", "REPROVADO", "CONDICIONADO"]).optional(),
  temperatura: z.enum(["FRIO", "MORNO", "QUENTE"]).optional(),
  observacoes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = getSessionContext(req);
    if (!context) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        stage: true,
        funnel: true,
        corretor: {
          select: { id: true, nome: true, email: true, telefone: true },
        },
        timeline: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, nome: true } },
          },
        },
        documents: true,
      },
    });

    if (!lead || lead.organizationId !== context.organizationId) {
      return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    }

    // Validação de RLS estrita
    if (context.role === "CORRETOR") {
      const isOwner = lead.corretorId === context.userId;
      const isAvailableInBolsao = lead.isBolsao && !lead.isClosed;
      if (!isOwner && !isAvailableInBolsao) {
        return NextResponse.json({ error: "Acesso não autorizado a este registro." }, { status: 403 });
      }
    }

    const protectedLead = maskLeadSensitiveData(lead, context);
    return NextResponse.json({ lead: protectedLead }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao carregar lead." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = getSessionContext(req);
    if (!context) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const data = UpdateLeadSchema.parse(body);

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: { stage: true },
    });

    if (!lead || lead.organizationId !== context.organizationId) {
      return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    }

    // 1. AÇÃO: ASSUMIR LEAD DO BOLSÃO
    if (data.action === "ASSUMIR_BOLSAO") {
      if (!lead.isBolsao) {
        return NextResponse.json({ error: "Este lead não está disponível no bolsão." }, { status: 400 });
      }

      const updated = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          corretorId: context.userId,
          isBolsao: false,
          bolsaoEnteredAt: null,
          slaDueAt: new Date(Date.now() + 20 * 60 * 1000), // Dispara SLA obrigatório de 20 min
        },
      });

      await prisma.leadTimeline.create({
        data: {
          leadId: lead.id,
          userId: context.userId,
          tipo: "transbordo",
          conteudo: "Lead resgatado do Bolsão Compartilhado pelo corretor.",
        },
      });

      return NextResponse.json({ success: true, lead: updated }, { status: 200 });
    }

    // 2. AÇÃO: ATUALIZAR ETAPA (KANBAN DRAG-AND-DROP)
    if (data.stageId && data.stageId !== lead.stageId) {
      const nextStage = await prisma.funnelStage.findUnique({
        where: { id: data.stageId },
      });

      const updated = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          stageId: data.stageId,
          slaDueAt: nextStage?.slaMinutes
            ? new Date(Date.now() + nextStage.slaMinutes * 60 * 1000)
            : null,
        },
      });

      await prisma.leadTimeline.create({
        data: {
          leadId: lead.id,
          userId: context.userId,
          tipo: "status_change",
          conteudo: `Etapa alterada de "${lead.stage.nome}" para "${nextStage?.nome}".`,
        },
      });

      return NextResponse.json({ success: true, lead: updated }, { status: 200 });
    }

    // 3. AÇÃO: REGISTRAR PRIMEIRO CONTATO
    if (data.action === "REGISTRAR_CONTATO") {
      const updated = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          firstContactAt: lead.firstContactAt || new Date(),
        },
      });

      await prisma.leadTimeline.create({
        data: {
          leadId: lead.id,
          userId: context.userId,
          tipo: "nota",
          conteudo: `Primeiro contato registrado com sucesso. ${data.observacoes || ""}`,
        },
      });

      return NextResponse.json({ success: true, lead: updated }, { status: 200 });
    }

    // 4. ATUALIZAR ESTEIRA DE CRÉDITO
    const updated = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        tipoOcupacaoCredito: data.tipoOcupacaoCredito || lead.tipoOcupacaoCredito,
        rendaDeclarada: data.rendaDeclarada ?? lead.rendaDeclarada,
        rendaEspecificaAutonomo: data.rendaEspecificaAutonomo ?? lead.rendaEspecificaAutonomo,
        faixaRenda: data.faixaRenda || lead.faixaRenda,
        statusCredito: data.statusCredito || lead.statusCredito,
        temperatura: data.temperatura || lead.temperatura,
      },
    });

    if (data.observacoes) {
      await prisma.leadTimeline.create({
        data: {
          leadId: lead.id,
          userId: context.userId,
          tipo: "nota",
          conteudo: `Atualização de qualificação/crédito: ${data.observacoes}`,
        },
      });
    }

    return NextResponse.json({ success: true, lead: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao atualizar lead." }, { status: 500 });
  }
}
