import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { refreshLeadScore } from "@/lib/services/lead-score";
import {
  leadInclude,
  serializeLead,
  toRlsContext,
  canViewLead,
  canModifyLead,
  findOrgLead,
  loadSerializedLead,
  badRequest,
  forbidden,
} from "../_lib/leadAccess";
import { zodMessage } from "../_lib/leadPayload";
import { UpdateLeadSchema, buildLeadUpdate, summarizeChanges, LeadUpdateError } from "../_lib/leadUpdate";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

/** GET: prontuário completo do lead (timeline, documentos e compromissos agendados). */
export async function GET(req: NextRequest, { params }: Params) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;
  const ctx = toRlsContext(session);

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        ...leadInclude,
        funnel: { select: { id: true, nome: true } },
        timeline: {
          orderBy: { createdAt: "desc" },
          take: 200,
          include: { user: { select: { id: true, nome: true } } },
        },
        documents: { orderBy: { createdAt: "desc" } },
        appointments: {
          where: { status: "AGENDADO" },
          orderBy: { dataInicio: "asc" },
          take: 20,
          select: { id: true, tipo: true, titulo: true, dataInicio: true, dataFim: true, status: true },
        },
      },
    });

    if (!lead || lead.organizationId !== session.organizationId) {
      return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    }
    if (!canViewLead(lead, session)) {
      return NextResponse.json({ error: "Acesso não autorizado a este registro." }, { status: 403 });
    }

    const { timeline, documents, appointments, funnel, ...base } = lead;
    return NextResponse.json(
      { lead: { ...serializeLead(base, ctx), funnel, timeline, documents, appointments } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API /api/leads/[id] GET error:", error?.message);
    return NextResponse.json({ error: "Erro ao carregar lead." }, { status: 500 });
  }
}

/** PATCH: etapa, bolsão, primeiro contato, etiquetas e edição de dados (com checagem de dono). */
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;
  const ctx = toRlsContext(session);

  let input;
  try {
    input = UpdateLeadSchema.parse(await req.json());
  } catch (err) {
    return badRequest(err instanceof z.ZodError ? zodMessage(err) : "JSON inválido.");
  }

  try {
    const found = await findOrgLead(params.id, session);
    if (found.error) return found.error;
    const { lead } = found;

    if (!canModifyLead(lead, session, input.action)) return forbidden();

    const plan = await buildLeadUpdate(lead, input, session);
    if (plan.changed.length === 0) {
      // Nada a alterar (ex.: primeiro contato já registrado) — resposta idempotente
      return NextResponse.json(
        { success: true, unchanged: true, lead: await loadSerializedLead(lead.id, ctx) },
        { status: 200 }
      );
    }

    await prisma.lead.update({ where: { id: lead.id }, data: plan.data });
    if (plan.events.length > 0) {
      await prisma.leadTimeline.createMany({
        data: plan.events.map((ev) => ({
          leadId: lead.id,
          userId: session.userId,
          tipo: ev.tipo,
          conteudo: ev.conteudo,
          metadata: ev.metadata,
        })),
      });
    }

    await refreshLeadScore(lead.id);

    const { antes, depois } = summarizeChanges(lead, plan);
    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: input.action ? `LEAD_${input.action}` : plan.isStageChange ? "LEAD_MUDAR_ETAPA" : "LEAD_ATUALIZADO",
      tipoAcao: plan.isStageChange ? "STATUS_CHANGE" : "UPDATE",
      modulo: "LEADS",
      entidade: "Lead",
      entidadeId: lead.id,
      entidadeNome: lead.nome,
      descricao: plan.events.map((e) => e.conteudo).join(" ") || `Lead "${lead.nome}" atualizado.`,
      dadosAntes: antes,
      dadosDepois: depois,
    });

    const updated = await loadSerializedLead(lead.id, ctx);
    return NextResponse.json({ success: true, lead: updated }, { status: 200 });
  } catch (error: any) {
    if (error instanceof LeadUpdateError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("API /api/leads/[id] PATCH error:", error?.message);
    return NextResponse.json({ error: "Erro ao atualizar lead." }, { status: 500 });
  }
}

/** DELETE: gestor ou dono. Leads com vendas/reservas vinculadas não podem ser excluídos (409). */
export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const found = await findOrgLead(params.id, session);
    if (found.error) return found.error;
    const { lead } = found;

    if (!canModifyLead(lead, session)) return forbidden("Você não tem permissão para excluir este lead.");

    // Sale e SeasonBooking usam onDelete: Restrict — bloqueia com mensagem clara
    const [salesCount, bookingsCount] = await Promise.all([
      prisma.sale.count({ where: { leadId: lead.id } }),
      prisma.seasonBooking.count({ where: { leadId: lead.id } }),
    ]);
    if (salesCount > 0 || bookingsCount > 0) {
      const motivo = salesCount > 0 ? `${salesCount} venda(s)` : `${bookingsCount} reserva(s) de temporada`;
      return NextResponse.json(
        { error: `Este lead possui ${motivo} vinculada(s) e não pode ser excluído. Encerre a oportunidade em vez de excluir.` },
        { status: 409 }
      );
    }

    // Timeline e documentos são removidos em cascata; compromissos ficam com leadId nulo (SetNull)
    await prisma.lead.delete({ where: { id: lead.id } });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "LEAD_EXCLUIDO",
      tipoAcao: "DELETE",
      modulo: "LEADS",
      entidade: "Lead",
      entidadeId: lead.id,
      entidadeNome: lead.nome,
      descricao: `Lead "${lead.nome}" excluído por ${session.nome}.`,
      dadosAntes: {
        nome: lead.nome,
        telefone: lead.telefone,
        email: lead.email,
        etapa: lead.stage.nome,
        corretorId: lead.corretorId,
        source: lead.source,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("API /api/leads/[id] DELETE error:", error?.message);
    return NextResponse.json({ error: "Erro ao excluir lead." }, { status: 500 });
  }
}
