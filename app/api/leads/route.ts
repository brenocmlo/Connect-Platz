import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { buildLeadRLSWhere, maskLeadSensitiveData, RLSUserContext } from "@/lib/db/rls";
import { LeadSource, LeadTemperature } from "@prisma/client";
import { z } from "zod";

const ManualLeadSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  telefone: z.string().min(8, "Telefone é obrigatório"),
  email: z.string().email().optional().or(z.literal("")),
  rendaDeclarada: z.number().optional(),
  faixaRenda: z.string().optional(),
  tipoOcupacaoCredito: z.enum(["CLT", "AUTONOMO", "EMPRESARIO", "APOSENTADO_PENSIONISTA", "OUTRO"]).optional(),
  rendaEspecificaAutonomo: z.number().optional(),
  bairrosInteresse: z.array(z.string()).optional(),
  observacoes: z.string().optional(),
});

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

/**
 * GET: Listagem de leads com aplicação rigorosa de Row Level Security (RLS)
 * e Mascaramento de Contatos LGPD
 */
export async function GET(req: NextRequest) {
  try {
    const context = getSessionContext(req);
    if (!context) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const funnelId = searchParams.get("funnelId");
    const isBolsao = searchParams.get("bolsao") === "true";
    const isClosed = searchParams.get("closed") === "true";

    // Constrói filtro RLS estrito (corretores só enxergam seus próprios leads ou bolsão)
    const rlsWhere = buildLeadRLSWhere(context);

    const leads = await prisma.lead.findMany({
      where: {
        ...rlsWhere,
        ...(funnelId ? { funnelId } : {}),
        ...(isBolsao ? { isBolsao: true, isClosed: false } : {}),
        ...(isClosed ? { isClosed: true } : { isClosed: false }),
      },
      include: {
        stage: true,
        corretor: {
          select: { id: true, nome: true, email: true, photoUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200, // Paginação até 200 por vez conforme especificação
    });

    // Aplica máscara de privacidade para números de telefone (Regra de Ouro)
    const protectedLeads = leads.map((lead) => maskLeadSensitiveData(lead, context));

    return NextResponse.json({ leads: protectedLeads }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao consultar leads." },
      { status: 500 }
    );
  }
}

/**
 * POST: Cadastro manual de lead pelo próprio corretor (source: MANUAL_CORRETOR)
 */
export async function POST(req: NextRequest) {
  try {
    const context = getSessionContext(req);
    if (!context) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const data = ManualLeadSchema.parse(body);

    // Buscar funil padrão e primeira etapa
    const defaultFunnel = await prisma.funnel.findFirst({
      where: { organizationId: context.organizationId, isActive: true },
      include: { stages: { orderBy: { posicao: "asc" }, take: 1 } },
    });

    if (!defaultFunnel || defaultFunnel.stages.length === 0) {
      return NextResponse.json({ error: "Nenhum funil ativo encontrado." }, { status: 400 });
    }

    const stage = defaultFunnel.stages[0];
    const cleanPhone = data.telefone.replace(/\D/g, "");

    const newLead = await prisma.lead.create({
      data: {
        organizationId: context.organizationId,
        funnelId: defaultFunnel.id,
        stageId: stage.id,
        corretorId: context.userId, // Atribuído diretamente ao corretor criador
        nome: data.nome,
        telefone: cleanPhone,
        email: data.email || null,
        source: LeadSource.MANUAL_CORRETOR,
        temperatura: LeadTemperature.MORNO,
        rendaDeclarada: data.rendaDeclarada,
        faixaRenda: data.faixaRenda,
        tipoOcupacaoCredito: data.tipoOcupacaoCredito,
        rendaEspecificaAutonomo: data.rendaEspecificaAutonomo,
        bairrosInteresse: data.bairrosInteresse || [],
        slaDueAt: new Date(Date.now() + 120 * 60 * 1000), // SLA de contato próprio
      },
      include: {
        stage: true,
        corretor: true,
      },
    });

    // Registra na timeline
    await prisma.leadTimeline.create({
      data: {
        leadId: newLead.id,
        userId: context.userId,
        tipo: "nota",
        conteudo: `Lead cadastrado manualmente pelo corretor com origem MANUAL_CORRETOR. ${data.observacoes || ""}`,
      },
    });

    return NextResponse.json({ lead: newLead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao cadastrar lead." },
      { status: 400 }
    );
  }
}
