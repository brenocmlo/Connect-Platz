import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { buildLeadRLSWhere } from "@/lib/db/rls";

const AddTimelineSchema = z.object({
  leadId: z.string().uuid("ID de lead inválido."),
  texto: z.string().trim().min(1, "Texto da anotação é obrigatório."),
  canal: z.string().optional().default("whatsapp"),
  isFirstContact: z.boolean().optional(),
});

/**
 * POST /api/extension/timeline
 * Registra anotação ou abordagem rápida no histórico do lead via WhatsApp Web
 * e encerra deterministamente o SLA de primeiro contato.
 */
export async function POST(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const session = auth.session;

  try {
    const body = await req.json();
    const parsed = AddTimelineSchema.safeParse(body);
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

    const now = new Date();
    let firstContactRegistered = false;

    // Se o lead ainda não tem primeiro contato registrado ou foi explicitado
    if (!lead.firstContactAt || parsed.data.isFirstContact) {
      const isBreached = lead.slaDueAt ? now > lead.slaDueAt : false;
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          firstContactAt: now,
          slaBreached: isBreached,
        },
      });
      firstContactRegistered = true;
    }

    // Registra a interação no histórico
    const timelineEntry = await prisma.leadTimeline.create({
      data: {
        leadId: lead.id,
        tipo: "whatsapp_print",
        conteudo: `[WhatsApp Web] ${parsed.data.texto}`,
        userId: session.userId,
        metadata: {
          canal: parsed.data.canal,
          autorNome: session.nome,
          firstContactRegistered,
        },
      },
    });

    return NextResponse.json({
      success: true,
      timelineId: timelineEntry.id,
      firstContactRegistered,
      createdAt: timelineEntry.createdAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao registrar na timeline.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
