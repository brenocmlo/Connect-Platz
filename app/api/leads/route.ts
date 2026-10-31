import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { buildLeadRLSWhere } from "@/lib/db/rls";
import { requireSession, isAdmin, getUserModality } from "@/lib/auth/session";
import { Role, BusinessModality } from "@prisma/client";
import { recordAudit } from "@/lib/services/audit-server";
import { refreshLeadScore } from "@/lib/services/lead-score";
import { resolveLeadSource, sourceLabel } from "@/components/crm/leads/leadSource";
import {
  leadInclude,
  serializeLead,
  toRlsContext,
  loadSerializedLead,
  isUuid,
  badRequest,
  INTERESSE_PREFIX,
} from "./_lib/leadAccess";
import { CreateLeadSchema, parsePhone, parseDate, zodMessage, mergeBairros } from "./_lib/leadPayload";

export const dynamic = "force-dynamic";

const NO_FUNNEL_MESSAGE =
  "Nenhum funil de vendas ativo com etapas configurado para a organização. Cadastre um funil antes de gerenciar leads.";

/** Funil ativo da organização (o informado, senão o padrão da modalidade, senão o mais antigo). */
async function findActiveFunnel(organizationId: string, funnelId?: string | null, modality?: BusinessModality) {
  return prisma.funnel.findFirst({
    where: {
      organizationId,
      isActive: true,
      ...(funnelId && isUuid(funnelId) ? { id: funnelId } : {}),
      ...(modality ? { modalidade: modality } : {}),
    },
    include: { stages: { orderBy: { posicao: "asc" } } },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

/**
 * GET: Listagem de leads com Row Level Security (corretor vê só os dele + bolsão)
 * e mascaramento LGPD de contatos de terceiros.
 */
export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;
  const ctx = toRlsContext(session);
  const modality = getUserModality(session.role);
  const reqModality = modality === "AMBOS" ? undefined : (modality as BusinessModality);

  try {
    const { searchParams } = new URL(req.url);
    const isBolsao = searchParams.get("bolsao") === "true";
    const isClosed = searchParams.get("closed") === "true";

    const funnel = await findActiveFunnel(session.organizationId, searchParams.get("funnelId"), reqModality);
    if (!funnel || funnel.stages.length === 0) {
      return NextResponse.json({ error: NO_FUNNEL_MESSAGE, code: "NO_FUNNEL" }, { status: 500 });
    }

    const [leads, funnels] = await Promise.all([
      prisma.lead.findMany({
        where: {
          ...buildLeadRLSWhere(ctx),
          funnelId: funnel.id,
          ...(isBolsao ? { isBolsao: true } : {}),
          isClosed,
        },
        include: leadInclude,
        orderBy: { createdAt: "desc" },
        take: 200, // Paginação até 200 por vez conforme especificação
      }),
      prisma.funnel.findMany({
        where: {
          organizationId: session.organizationId,
          isActive: true,
          ...(reqModality ? { modalidade: reqModality } : {}),
        },
        select: { id: true, nome: true, modalidade: true },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      }),
    ]);

    return NextResponse.json(
      {
        leads: leads.map((lead) => serializeLead(lead, ctx)),
        stages: funnel.stages,
        funnel: { id: funnel.id, nome: funnel.nome },
        funnels,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API /api/leads GET error:", error?.message);
    return NextResponse.json({ error: "Erro ao carregar leads." }, { status: 500 });
  }
}

/**
 * POST: Cadastro manual de lead. Aceita os aliases do plano de testes
 * (renda, origem, etapaId, corretorId, observacoes, tags, empreendimentoInteresse).
 */
export async function POST(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;
  const ctx = toRlsContext(session);

  let data;
  try {
    data = CreateLeadSchema.parse(await req.json());
  } catch (err) {
    return badRequest(err instanceof z.ZodError ? zodMessage(err) : "JSON inválido.");
  }

  try {
    const telefone = parsePhone(data.telefone);
    if (!telefone) return badRequest("Telefone inválido. Informe DDD + número (10 ou 11 dígitos).");

    const modality = getUserModality(session.role);
    const reqModality = modality === "AMBOS" ? undefined : (modality as BusinessModality);
    const funnel = await findActiveFunnel(session.organizationId, data.funnelId, reqModality);
    if (!funnel || funnel.stages.length === 0) {
      return NextResponse.json({ error: NO_FUNNEL_MESSAGE, code: "NO_FUNNEL" }, { status: 500 });
    }

    // Etapa informada só vale se pertencer ao funil da organização; senão, 1ª etapa
    const requestedStageId = data.etapaId || data.stageId;
    const stage = funnel.stages.find((s) => s.id === requestedStageId) || funnel.stages[0];

    // Atribuição: gestor pode atribuir a outro usuário ativo da org; corretor sempre a si mesmo
    let corretorId = session.userId;
    if (data.corretorId && data.corretorId !== session.userId && isAdmin(session.role)) {
      const target = isUuid(data.corretorId)
        ? await prisma.user.findFirst({
            where: { id: data.corretorId, organizationId: session.organizationId, isActive: true },
            select: { id: true },
          })
        : null;
      if (!target) return badRequest("Corretor informado não pertence à sua organização.");
      corretorId = target.id;
    }

    const { source, utmSource } = resolveLeadSource(data.origem || data.source);
    const renda = data.rendaDeclarada ?? data.renda;
    const observacoes = data.observacoes?.trim() || null;

    const created = await prisma.lead.create({
      data: {
        organizationId: session.organizationId,
        funnelId: funnel.id,
        stageId: stage.id,
        corretorId,
        modalidade: funnel.modalidade || (reqModality ?? "VENDA"),
        nome: data.nome,
        telefone,
        email: data.email || null,
        cpf: data.cpf || null,
        rg: data.rg || null,
        profissao: data.profissao || null,
        estadoCivil: data.estadoCivil || null,
        dataNascimento: parseDate(data.dataNascimento) ?? null,
        source,
        utmSource,
        campaignName: data.campaignName || null,
        adName: data.empreendimentoInteresse ? `${INTERESSE_PREFIX}${data.empreendimentoInteresse}` : null,
        rendaDeclarada: renda,
        rendaInformal: data.rendaInformal,
        faixaRenda: data.faixaRenda || null,
        tipoOcupacaoCredito: data.tipoOcupacaoCredito || null,
        rendaEspecificaAutonomo: data.rendaEspecificaAutonomo,
        bairrosInteresse: mergeBairros(data.bairrosInteresse, data.bairro, data.cidade) || [],
        tags: data.tags || [],
        observacoes,
        slaDueAt: new Date(Date.now() + (stage.slaMinutes || 120) * 60 * 1000),
      },
    });

    const label = sourceLabel(source, utmSource);
    await prisma.leadTimeline.create({
      data: {
        leadId: created.id,
        userId: session.userId,
        tipo: "created",
        conteudo: `Lead cadastrado manualmente por ${session.nome} (origem: ${label}) na etapa "${stage.nome}".`,
      },
    });
    if (observacoes) {
      await prisma.leadTimeline.create({
        data: { leadId: created.id, userId: session.userId, tipo: "nota", conteudo: observacoes },
      });
    }

    await refreshLeadScore(created.id);

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "LEAD_CRIADO",
      tipoAcao: "CREATE",
      modulo: "LEADS",
      entidade: "Lead",
      entidadeId: created.id,
      entidadeNome: created.nome,
      descricao: `Lead "${created.nome}" cadastrado manualmente (origem: ${label}).`,
      dadosDepois: { nome: created.nome, telefone, etapa: stage.nome, corretorId, source, tags: created.tags },
    });

    const lead = await loadSerializedLead(created.id, ctx);
    return NextResponse.json({ lead }, { status: 201 });
  } catch (error: any) {
    console.error("API /api/leads POST error:", error?.message);
    return NextResponse.json({ error: "Erro ao cadastrar lead." }, { status: 500 });
  }
}
