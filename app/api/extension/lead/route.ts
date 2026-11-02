import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getRequestSession, requireSession, isAdmin } from "@/lib/auth/session";
import { buildLeadRLSWhere } from "@/lib/db/rls";
import { normalizeBrPhone } from "@/lib/utils/phone";
import { BusinessModality, Role } from "@prisma/client";
import { getExtensionLeadAuxData } from "@/lib/extension/lead-service";

const CreateLeadExtensionSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório."),
  telefone: z.string().min(8, "Telefone é obrigatório."),
  modalidade: z.enum(["VENDA", "ALUGUEL"]).optional(),
  observacoes: z.string().optional(),
  corretorId: z.string().optional(),
  propertyInteresse: z.string().optional(),
});

const UpdateLeadExtensionSchema = z.object({
  leadId: z.string().uuid("ID de lead inválido."),
  stageId: z.string().uuid("ID de etapa inválido.").optional(),
  modalidade: z.enum(["VENDA", "ALUGUEL"]).optional(),
  corretorId: z.string().uuid("ID de corretor inválido.").optional(),
  propertyInteresse: z.string().optional(),
  observacoes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = getRequestSession(req);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const rawPhone = searchParams.get("phone");
  const rawName = searchParams.get("name");

  if (!rawPhone && !rawName) {
    return NextResponse.json({ error: "Informe phone ou name para busca." }, { status: 400 });
  }

  const normalized = rawPhone ? normalizeBrPhone(rawPhone) : "";
  const last8 = normalized ? normalized.slice(-8) : "";

  const searchOr: Array<Record<string, unknown>> = [];
  if (normalized && normalized.length >= 8) {
    searchOr.push({ telefone: normalized }, { telefone: { contains: last8 } });
  }

  if (rawName && rawName.trim().length >= 2) {
    const clean = rawName.trim();
    searchOr.push({ nome: { contains: clean, mode: "insensitive" } });
    const first = clean.split(/\s+/)[0];
    if (first.length >= 3 && first !== clean) {
      searchOr.push({ nome: { contains: first, mode: "insensitive" } });
    }
  }

  const rlsWhere = buildLeadRLSWhere({
    userId: session.userId,
    organizationId: session.organizationId,
    role: session.role,
  });

  const [lead, auxData] = await Promise.all([
    prisma.lead.findFirst({
      where: { ...rlsWhere, isClosed: false, OR: searchOr.length > 0 ? (searchOr as any) : undefined },
      include: {
        funnel: {
          include: { stages: { orderBy: { posicao: "asc" }, select: { id: true, nome: true, cor: true, posicao: true } } },
        },
        stage: { select: { id: true, nome: true, cor: true } },
        corretor: { select: { id: true, nome: true, email: true } },
        timeline: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, tipo: true, conteudo: true, createdAt: true, metadata: true, user: { select: { nome: true } } },
        },
        sales: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, codigoVenda: true, valorVendaVGV: true, status: true, property: { select: { nome: true } } },
        },
        bookings: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, checkInDate: true, checkOutDate: true, valorTotal: true, status: true, property: { select: { nome: true } } },
        },
      },
    }),
    getExtensionLeadAuxData(session.organizationId, session.role),
  ]);

  if (!lead) {
    return NextResponse.json({
      found: false,
      phone: normalized || null,
      name: rawName || null,
      userRole: session.role,
      availableBrokers: auxData.brokersList,
      availableFunnels: auxData.funnelsList,
      availableProperties: auxData.propertiesList,
    });
  }

  const historicoMapeado = lead.timeline.map((item) => ({
    id: item.id,
    tipo: item.tipo,
    conteudo: item.conteudo,
    createdAt: item.createdAt,
    autorNome: item.user?.nome || (item.metadata as any)?.autorNome || "Sistema",
  }));

  const propertyTag = lead.tags.find((t) => t.startsWith("Imóvel: "))?.replace("Imóvel: ", "") || null;

  return NextResponse.json({
    found: true,
    userRole: session.role,
    availableBrokers: auxData.brokersList,
    availableFunnels: auxData.funnelsList,
    availableProperties: auxData.propertiesList,
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
      propertyInteresse: propertyTag,
      observacoes: lead.observacoes,
      slaDueAt: lead.slaDueAt,
      firstContactAt: lead.firstContactAt,
      slaBreached: lead.slaBreached,
      isBolsao: lead.isBolsao,
      etapaAtual: lead.stage,
      funil: {
        id: lead.funnel.id,
        nome: lead.funnel.nome,
        modalidade: lead.funnel.modalidade,
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
  });
}

export async function POST(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const session = auth.session;

  try {
    const body = await req.json();
    const parsed = CreateLeadExtensionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Dados inválidos." }, { status: 400 });
    }

    const normalizedPhone = normalizeBrPhone(parsed.data.telefone);
    if (!normalizedPhone || normalizedPhone.length < 10) {
      return NextResponse.json({ error: "Telefone inválido (mínimo DDD + número)." }, { status: 400 });
    }

    let modalidade: BusinessModality = "VENDA";
    let corretorId: string | null = session.userId;

    if (session.role === Role.CORRETOR_ALUGUEL || session.role === Role.FINANCEIRO_ALUGUEL) {
      modalidade = "ALUGUEL";
    } else if (session.role === Role.CORRETOR_VENDA || session.role === Role.FINANCEIRO_VENDA) {
      modalidade = "VENDA";
    } else if (isAdmin(session.role)) {
      modalidade = parsed.data.modalidade || "VENDA";
      if (parsed.data.corretorId) corretorId = parsed.data.corretorId;
    }

    const funnel = await prisma.funnel.findFirst({
      where: { organizationId: session.organizationId, isActive: true, modalidade },
      include: { stages: { orderBy: { posicao: "asc" } } },
    });

    if (!funnel || funnel.stages.length === 0) {
      return NextResponse.json({ error: "Nenhum funil ativo encontrado para esta modalidade." }, { status: 400 });
    }

    // Prevenção de duplicidade: verifica se já existe na organização pelo telefone
    const existingLead = await prisma.lead.findFirst({
      where: {
        organizationId: session.organizationId,
        isClosed: false,
        OR: [{ telefone: normalizedPhone }, { telefone: { contains: normalizedPhone.slice(-8) } }],
      },
    });

    if (existingLead) {
      const updateData: Record<string, unknown> = {};
      if (parsed.data.nome && parsed.data.nome.trim().length > existingLead.nome.trim().length) {
        updateData.nome = parsed.data.nome.trim();
      }
      if (parsed.data.propertyInteresse) {
        const curTags = Array.isArray(existingLead.tags) ? existingLead.tags : [];
        const tag = `Imóvel: ${parsed.data.propertyInteresse}`;
        if (!curTags.includes(tag)) updateData.tags = [...curTags, tag];
      }
      if (Object.keys(updateData).length > 0) {
        await prisma.lead.update({ where: { id: existingLead.id }, data: updateData });
      }
      return NextResponse.json({
        success: true,
        leadId: existingLead.id,
        nome: existingLead.nome,
        telefone: existingLead.telefone,
        isExisting: true,
      });
    }

    const tags: string[] = [];
    if (parsed.data.propertyInteresse) tags.push(`Imóvel: ${parsed.data.propertyInteresse}`);

    const created = await prisma.lead.create({
      data: {
        organizationId: session.organizationId,
        funnelId: funnel.id,
        stageId: funnel.stages[0].id,
        corretorId,
        nome: parsed.data.nome,
        telefone: normalizedPhone,
        modalidade,
        tags,
        source: "MANUAL_CORRETOR",
        score: 60,
        temperatura: "MORNO",
        slaDueAt: new Date(Date.now() + 30 * 60 * 1000),
        observacoes: parsed.data.observacoes || "Criado via Extensão WhatsApp Web Connect Platz",
        timeline: {
          create: {
            tipo: "nota",
            conteudo: `Lead cadastrado via WhatsApp Web por ${session.nome}.`,
            userId: session.userId,
            metadata: { autorNome: session.nome },
          },
        },
      },
    });

    return NextResponse.json({ success: true, leadId: created.id, nome: created.nome, telefone: created.telefone });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao cadastrar lead.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const session = auth.session;

  try {
    const body = await req.json();
    const parsed = UpdateLeadExtensionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Dados inválidos." }, { status: 400 });
    }

    const rlsWhere = buildLeadRLSWhere({ userId: session.userId, organizationId: session.organizationId, role: session.role });
    const lead = await prisma.lead.findFirst({ where: { id: parsed.data.leadId, ...rlsWhere } });
    if (!lead) return NextResponse.json({ error: "Lead não encontrado ou acesso restrito." }, { status: 404 });

    const updateData: Record<string, unknown> = {};

    // 1. Mudança de Modalidade (Venda vs Locação)
    if (parsed.data.modalidade && parsed.data.modalidade !== lead.modalidade) {
      const targetFunnel = await prisma.funnel.findFirst({
        where: { organizationId: session.organizationId, modalidade: parsed.data.modalidade, isActive: true },
        include: { stages: { orderBy: { posicao: "asc" } } },
      });

      if (targetFunnel && targetFunnel.stages.length > 0) {
        updateData.modalidade = parsed.data.modalidade;
        updateData.funnelId = targetFunnel.id;
        updateData.stageId = targetFunnel.stages[0].id;
        await prisma.leadTimeline.create({
          data: {
            leadId: lead.id,
            tipo: "status_change",
            conteudo: `Modalidade alterada para ${parsed.data.modalidade === "VENDA" ? "Vendas" : "Locação / Temporada"} por ${session.nome}.`,
            userId: session.userId,
            metadata: { autorNome: session.nome },
          },
        });
      }
    }

    // 2. Mudança de Etapa
    if (parsed.data.stageId && parsed.data.stageId !== lead.stageId) {
      const stage = await prisma.funnelStage.findUnique({ where: { id: parsed.data.stageId } });
      if (stage) {
        updateData.stageId = stage.id;
        await prisma.leadTimeline.create({
          data: {
            leadId: lead.id,
            tipo: "status_change",
            conteudo: `Etapa alterada para "${stage.nome}" por ${session.nome}.`,
            userId: session.userId,
            metadata: { autorNome: session.nome },
          },
        });
      }
    }

    // 3. Reatribuição de Corretor
    if (parsed.data.corretorId && parsed.data.corretorId !== lead.corretorId && isAdmin(session.role)) {
      const broker = await prisma.user.findFirst({ where: { id: parsed.data.corretorId, organizationId: session.organizationId, isActive: true } });
      if (broker) {
        updateData.corretorId = broker.id;
        await prisma.leadTimeline.create({
          data: {
            leadId: lead.id,
            tipo: "transbordo",
            conteudo: `Lead reatribuído para "${broker.nome}" por ${session.nome}.`,
            userId: session.userId,
            metadata: { autorNome: session.nome },
          },
        });
      }
    }

    // 4. Imóvel de Interesse
    if (parsed.data.propertyInteresse) {
      const currentTags = Array.isArray(lead.tags) ? [...lead.tags] : [];
      const newTag = `Imóvel: ${parsed.data.propertyInteresse}`;
      updateData.tags = [...currentTags.filter((t) => !t.startsWith("Imóvel:")), newTag];
      await prisma.leadTimeline.create({
        data: {
          leadId: lead.id,
          tipo: "nota",
          conteudo: `Interesse registrado no empreendimento: "${parsed.data.propertyInteresse}" por ${session.nome}.`,
          userId: session.userId,
          metadata: { autorNome: session.nome },
        },
      });
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.lead.update({ where: { id: lead.id }, data: updateData });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao atualizar lead.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
