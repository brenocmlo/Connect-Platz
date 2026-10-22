import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { refreshLeadScore } from "@/lib/services/lead-score";
import { canViewLead, canModifyLead, findOrgLead, badRequest, forbidden } from "../../_lib/leadAccess";
import { zodMessage } from "../../_lib/leadPayload";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

/** Canais que caracterizam contato efetivo com o cliente (registram o primeiro contato). */
const CONTACT_CHANNELS = ["whatsapp", "ligacao", "reuniao", "email"];

const TimelineEntrySchema = z.object({
  tipo: z.enum(["nota", "abordagem", "descarte"]).default("nota"),
  conteudo: z.string().trim().min(1, "Descreva a anotação.").max(5000),
  canal: z.enum(["whatsapp", "ligacao", "reuniao", "email", "anotacao"]).optional(),
  desfecho: z.enum(["respondeu", "sem_resposta", "reagendou", "sem_interesse"]).optional(),
  motivo: z.string().trim().max(120).optional(),
});

/** GET: histórico do lead, mais recente primeiro. */
export async function GET(req: NextRequest, { params }: Params) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const found = await findOrgLead(params.id, session);
    if (found.error) return found.error;
    if (!canViewLead(found.lead, session)) {
      return NextResponse.json({ error: "Acesso não autorizado a este registro." }, { status: 403 });
    }

    const timeline = await prisma.leadTimeline.findMany({
      where: { leadId: params.id },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { id: true, nome: true } } },
    });
    return NextResponse.json({ timeline }, { status: 200 });
  } catch (error: any) {
    console.error("API /api/leads/[id]/timeline GET error:", error?.message);
    return NextResponse.json({ error: "Erro ao carregar histórico." }, { status: 500 });
  }
}

/** POST: registra abordagem/observação na timeline do lead. */
export async function POST(req: NextRequest, { params }: Params) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  let input;
  try {
    input = TimelineEntrySchema.parse(await req.json());
  } catch (err) {
    return badRequest(err instanceof z.ZodError ? zodMessage(err) : "JSON inválido.");
  }

  try {
    const found = await findOrgLead(params.id, session);
    if (found.error) return found.error;
    const { lead } = found;
    if (!canModifyLead(lead, session)) return forbidden("Você não tem permissão para registrar no histórico deste lead.");

    const entry = await prisma.leadTimeline.create({
      data: {
        leadId: lead.id,
        userId: session.userId,
        tipo: input.tipo,
        conteudo: input.conteudo,
        metadata: {
          ...(input.canal ? { canal: input.canal } : {}),
          ...(input.desfecho ? { desfecho: input.desfecho } : {}),
          ...(input.motivo ? { motivo: input.motivo } : {}),
        },
      },
      include: { user: { select: { id: true, nome: true } } },
    });

    // Abordagem por canal de contato real conta como primeiro contato (afeta SLA e score)
    if (input.canal && CONTACT_CHANNELS.includes(input.canal) && !lead.firstContactAt) {
      await prisma.lead.update({ where: { id: lead.id }, data: { firstContactAt: new Date() } });
    }
    await refreshLeadScore(lead.id);

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: input.tipo === "descarte" ? "LEAD_DESCARTADO" : "LEAD_ABORDAGEM_REGISTRADA",
      tipoAcao: "UPDATE",
      modulo: "LEADS",
      entidade: "Lead",
      entidadeId: lead.id,
      entidadeNome: lead.nome,
      descricao: `${input.tipo === "descarte" ? "Descarte" : "Registro"} no histórico do lead "${lead.nome}".`,
      dadosDepois: { tipo: input.tipo, canal: input.canal, desfecho: input.desfecho, motivo: input.motivo },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: any) {
    console.error("API /api/leads/[id]/timeline POST error:", error?.message);
    return NextResponse.json({ error: "Erro ao registrar no histórico." }, { status: 500 });
  }
}
