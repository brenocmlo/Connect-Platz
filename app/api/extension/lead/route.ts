import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getRequestSession, requireSession, isAdmin } from "@/lib/auth/session";
import { buildLeadRLSWhere } from "@/lib/db/rls";
import { normalizeBrPhone } from "@/lib/utils/phone";
import { BusinessModality, Role } from "@prisma/client";

const CreateLeadExtensionSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório."),
  telefone: z.string().min(8, "Telefone é obrigatório."),
  modalidade: z.enum(["VENDA", "ALUGUEL"]).optional(),
  observacoes: z.string().optional(),
  corretorId: z.string().optional(),
});

const UpdateLeadExtensionSchema = z.object({
  leadId: z.string().uuid("ID de lead inválido."),
  stageId: z.string().uuid("ID de etapa inválido.").optional(),
  corretorId: z.string().uuid("ID de corretor inválido.").optional(),
  observacoes: z.string().optional(),
});

/**
 * GET /api/extension/lead?phone=...
 * Busca o lead pelo telefone com base no perfil do usuário e no RLS do sistema.
 */
export async function GET(req: NextRequest) {
  const session = getRequestSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rawPhone = searchParams.get("phone");
  if (!rawPhone) {
    return NextResponse.json({ error: "Parâmetro phone é obrigatório." }, { status: 400 });
  }

  const normalized = normalizeBrPhone(rawPhone);
  const last8 = normalized.slice(-8);

  const rlsWhere = buildLeadRLSWhere({
    userId: session.userId,
    organizationId: session.organizationId,
    role: session.role,
  });

  // Busca por telefone exato ou correspondência de final do número
  const lead = await prisma.lead.findFirst({
    where: {
      ...rlsWhere,
      isClosed: false,
      OR: [
        { telefone: normalized },
        { telefone: { contains: last8 } },
      ],
    },
    include: {
      funnel: {
        include: {
          stages: {
            orderBy: { posicao: "asc" },
            select: { id: true, nome: true, cor: true, posicao: true },
          },
        },
      },
      stage: { select: { id: true, nome: true, cor: true } },
      corretor: { select: { id: true, nome: true, email: true } },
      timeline: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          tipo: true,
          conteudo: true,
          createdAt: true,
          metadata: true,
          user: { select: { nome: true } },
        },
      },
      sales: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          codigoVenda: true,
          valorVendaVGV: true,
          status: true,
          statusComissao: true,
          property: { select: { nome: true } },
        },
      },
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          checkInDate: true,
          checkOutDate: true,
          valorTotal: true,
          status: true,
          property: { select: { nome: true } },
        },
      },
    },
  });

  // Se não encontrar o lead
  if (!lead) {
    let brokersList: Array<{ id: string; nome: string }> = [];
    if (isAdmin(session.role)) {
      brokersList = await prisma.user.findMany({
        where: { organizationId: session.organizationId, isActive: true },
        select: { id: true, nome: true },
        orderBy: { nome: "asc" },
      });
    }

    return NextResponse.json({
      found: false,
      phone: normalized,
      userRole: session.role,
      availableBrokers: brokersList,
    });
  }

  // Lista de corretores disponíveis para reatribuição se o usuário for ADMINISTRADOR
  let brokersList: Array<{ id: string; nome: string }> = [];
  if (isAdmin(session.role)) {
    brokersList = await prisma.user.findMany({
      where: { organizationId: session.organizationId, isActive: true },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    });
  }

  const historicoMapeado = lead.timeline.map((item) => ({
    id: item.id,
    tipo: item.tipo,
    conteudo: item.conteudo,
    createdAt: item.createdAt,
    autorNome: item.user?.nome || (item.metadata as any)?.autorNome || "Sistema",
  }));

  return NextResponse.json({
    found: true,
    userRole: session.role,
    lead: {
      id: lead.id,
      nome: lead.nome,
      telefone: lead.telefone,
      email: lead.email,
      score: lead.score ?? 50,
      temperatura: lead.temperatura,
      modalidade: lead.modalidade,
      rendaDeclarada: lead.rendaDeclarada ? Number(lead.rendaDeclarada) : null,
      statusCredito: lead.statusCredito,
      financialApprovalStatus: lead.financialApprovalStatus,
      tags: lead.tags,
      observacoes: lead.observacoes,
      slaDueAt: lead.slaDueAt,
      firstContactAt: lead.firstContactAt,
      slaBreached: lead.slaBreached,
      isBolsao: lead.isBolsao,
      etapaAtual: lead.stage,
      funil: {
        id: lead.funnel.id,
        nome: lead.funnel.nome,
        stages: lead.funnel.stages,
      },
      corretor: lead.corretor,
      vendaRecente: lead.sales[0]
        ? {
            id: lead.sales[0].id,
            codigoVenda: lead.sales[0].codigoVenda,
            vgv: Number(lead.sales[0].valorVendaVGV),
            status: lead.sales[0].status,
            imovelNome: lead.sales[0].property?.nome || "Imóvel",
          }
        : null,
      reservaRecente: lead.bookings[0]
        ? {
            id: lead.bookings[0].id,
            checkIn: lead.bookings[0].checkInDate,
            checkOut: lead.bookings[0].checkOutDate,
            valorTotal: Number(lead.bookings[0].valorTotal),
            status: lead.bookings[0].status,
            imovelNome: lead.bookings[0].property?.nome || "Temporada",
          }
        : null,
      historicoRecente: historicoMapeado,
    },
    availableBrokers: brokersList,
  });
}

/**
 * POST /api/extension/lead
 * Cadastra um novo lead a partir do contato do WhatsApp Web.
 */
export async function POST(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const session = auth.session;

  try {
    const body = await req.json();
    const parsed = CreateLeadExtensionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeBrPhone(parsed.data.telefone);
    if (!normalizedPhone || normalizedPhone.length < 10) {
      return NextResponse.json({ error: "Telefone inválido (mínimo DDD + número)." }, { status: 400 });
    }

    // Modalidade e Corretor conforme o perfil do usuário
    let modalidade: BusinessModality = "VENDA";
    let corretorId: string | null = session.userId;

    if (session.role === Role.CORRETOR_ALUGUEL || session.role === Role.FINANCEIRO_ALUGUEL) {
      modalidade = "ALUGUEL";
    } else if (session.role === Role.CORRETOR_VENDA || session.role === Role.FINANCEIRO_VENDA) {
      modalidade = "VENDA";
    } else if (isAdmin(session.role)) {
      modalidade = parsed.data.modalidade || "VENDA";
      if (parsed.data.corretorId) {
        corretorId = parsed.data.corretorId;
      }
    }

    // Busca o funil ativo compatível com a modalidade
    const funnel = await prisma.funnel.findFirst({
      where: {
        organizationId: session.organizationId,
        isActive: true,
        modalidade,
      },
      include: {
        stages: { orderBy: { posicao: "asc" } },
      },
    });

    if (!funnel || funnel.stages.length === 0) {
      return NextResponse.json(
        { error: "Nenhum funil ativo encontrado para esta modalidade." },
        { status: 400 }
      );
    }

    const firstStage = funnel.stages[0];

    // SLA inicial de 1º contato (30 minutos a partir de agora)
    const slaDueAt = new Date(Date.now() + 30 * 60 * 1000);

    const created = await prisma.lead.create({
      data: {
        organizationId: session.organizationId,
        funnelId: funnel.id,
        stageId: firstStage.id,
        corretorId,
        nome: parsed.data.nome,
        telefone: normalizedPhone,
        modalidade,
        source: "MANUAL_CORRETOR",
        score: 60,
        temperatura: "MORNO",
        slaDueAt,
        observacoes: parsed.data.observacoes || "Criado via Extensão WhatsApp Web Connect Platz",
        timeline: {
          create: {
            tipo: "nota",
            conteudo: `Lead cadastrado diretamente via Extensão WhatsApp Web por ${session.nome}.`,
            userId: session.userId,
            metadata: { autorNome: session.nome },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      leadId: created.id,
      nome: created.nome,
      telefone: created.telefone,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao cadastrar lead.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/extension/lead
 * Atualiza etapa do funil ou corretor responsável.
 */
export async function PATCH(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const session = auth.session;

  try {
    const body = await req.json();
    const parsed = UpdateLeadExtensionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const rlsWhere = buildLeadRLSWhere({
      userId: session.userId,
      organizationId: session.organizationId,
      role: session.role,
    });

    const lead = await prisma.lead.findFirst({
      where: { id: parsed.data.leadId, ...rlsWhere },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado ou acesso restrito." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    // Alteração de Etapa do Funil
    if (parsed.data.stageId && parsed.data.stageId !== lead.stageId) {
      const stage = await prisma.funnelStage.findUnique({
        where: { id: parsed.data.stageId },
      });
      if (stage) {
        updateData.stageId = stage.id;
        await prisma.leadTimeline.create({
          data: {
            leadId: lead.id,
            tipo: "status_change",
            conteudo: `Etapa alterada para "${stage.nome}" via WhatsApp Web por ${session.nome}.`,
            userId: session.userId,
            metadata: { autorNome: session.nome },
          },
        });
      }
    }

    // Reatribuição de Corretor (apenas para ADMINISTRADOR)
    if (parsed.data.corretorId && parsed.data.corretorId !== lead.corretorId && isAdmin(session.role)) {
      const newBroker = await prisma.user.findFirst({
        where: { id: parsed.data.corretorId, organizationId: session.organizationId, isActive: true },
      });
      if (newBroker) {
        updateData.corretorId = newBroker.id;
        await prisma.leadTimeline.create({
          data: {
            leadId: lead.id,
            tipo: "transbordo",
            conteudo: `Lead reatribuído para "${newBroker.nome}" por ${session.nome}.`,
            userId: session.userId,
            metadata: { autorNome: session.nome },
          },
        });
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao atualizar lead.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
