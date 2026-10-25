// app/api/agenda/route.ts
// Agenda: listagem (corretor vê os seus; gestor vê a organização), criação, atualização e exclusão.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession, isAdmin } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { refreshLeadScore } from "@/lib/services/lead-score";
import { normalizeAppointmentType } from "@/components/crm/agenda/types";
import { appointmentInclude, updateAppointment, deleteAppointment } from "./shared";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const leadId = searchParams.get("leadId");

    const appointments = await prisma.appointment.findMany({
      where: {
        organizationId: session.organizationId,
        ...(isAdmin(session.role) ? {} : { userId: session.userId }),
        ...(leadId ? { leadId } : {}),
        ...(from || to
          ? {
              dataInicio: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      include: appointmentInclude,
      orderBy: { dataInicio: "asc" },
    });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao listar compromissos da agenda:", error?.message);
    return NextResponse.json({ error: "Erro ao carregar a agenda." }, { status: 500 });
  }
}

const createSchema = z
  .object({
    tipo: z.string().min(1, "Tipo obrigatório."),
    titulo: z.string().trim().min(3, "Título obrigatório.").max(200),
    dataInicio: z.string().datetime({ offset: true, message: "Data de início inválida." }),
    dataFim: z.string().datetime({ offset: true, message: "Data de término inválida." }),
    leadId: z.string().uuid("Selecione um cliente/lead válido.").nullable().optional(),
    propertyId: z.string().uuid("Empreendimento inválido.").nullable().optional(),
    userId: z.string().uuid().nullable().optional(),
    observacoes: z.string().trim().max(5000).nullable().optional(),
  })
  .refine((d) => new Date(d.dataFim) > new Date(d.dataInicio), {
    message: "O horário de término deve ser posterior ao início.",
    path: ["dataFim"],
  });

export async function POST(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const tipo = normalizeAppointmentType(data.tipo);
    if (!tipo) {
      return NextResponse.json({ error: `Tipo de compromisso inválido: ${data.tipo}.` }, { status: 400 });
    }

    const manager = isAdmin(session.role);

    // Responsável: corretor agenda para si; gestor pode escolher alguém da organização
    let responsibleId = session.userId;
    if (manager && data.userId && data.userId !== session.userId) {
      const responsible = await prisma.user.findFirst({
        where: { id: data.userId, organizationId: session.organizationId, isActive: true },
        select: { id: true },
      });
      if (!responsible) {
        return NextResponse.json({ error: "Responsável não encontrado na organização." }, { status: 400 });
      }
      responsibleId = responsible.id;
    }

    // Lead precisa existir na organização; corretor só agenda para os próprios leads
    if (data.leadId) {
      const lead = await prisma.lead.findFirst({
        where: { id: data.leadId, organizationId: session.organizationId },
        select: { id: true, corretorId: true },
      });
      if (!lead) {
        return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
      }
      if (!manager && lead.corretorId !== session.userId) {
        return NextResponse.json(
          { error: "Você só pode agendar compromissos para os seus leads." },
          { status: 403 }
        );
      }
    }

    if (data.propertyId) {
      const property = await prisma.property.findFirst({
        where: { id: data.propertyId, organizationId: session.organizationId },
        select: { id: true },
      });
      if (!property) {
        return NextResponse.json({ error: "Empreendimento não encontrado." }, { status: 404 });
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        organizationId: session.organizationId,
        userId: responsibleId,
        tipo,
        titulo: data.titulo,
        dataInicio: new Date(data.dataInicio),
        dataFim: new Date(data.dataFim),
        leadId: data.leadId || null,
        propertyId: data.propertyId || null,
        observacoes: data.observacoes || null,
      },
      include: appointmentInclude,
    });

    if (appointment.leadId) {
      try {
        await refreshLeadScore(appointment.leadId);
      } catch (err) {
        console.warn("Falha ao recalcular score após agendamento:", err);
      }
    }

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Compromisso criado",
      tipoAcao: "CREATE",
      modulo: "AGENDA",
      entidade: "Appointment",
      entidadeId: appointment.id,
      entidadeNome: appointment.titulo,
      descricao: `Compromisso "${appointment.titulo}" agendado para ${appointment.user.nome}.`,
      dadosDepois: {
        tipo: appointment.tipo,
        dataInicio: appointment.dataInicio.toISOString(),
        leadId: appointment.leadId,
        propertyId: appointment.propertyId,
        userId: appointment.userId,
      },
    });

    return NextResponse.json(
      { appointment, message: "Compromisso agendado com sucesso!" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro ao criar compromisso:", error);
    return NextResponse.json({ error: "Erro interno ao criar compromisso." }, { status: 500 });
  }
}

// Compatibilidade: PATCH/DELETE na coleção com id no corpo/query (preferir /api/agenda/[id])
export async function PATCH(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json().catch(() => null);
    const id = body?.id;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    }
    const { id: _ignored, ...rest } = body;
    return await updateAppointment(req, auth.session, id, rest);
  } catch (error: any) {
    console.error("Erro ao atualizar compromisso:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar compromisso." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    }
    return await deleteAppointment(req, auth.session, id);
  } catch (error: any) {
    console.error("Erro ao excluir compromisso:", error);
    return NextResponse.json({ error: "Erro interno ao excluir compromisso." }, { status: 500 });
  }
}
