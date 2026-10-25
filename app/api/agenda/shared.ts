// app/api/agenda/shared.ts
// Regras compartilhadas da API de Agenda: includes, validação de posse e atualização/exclusão.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { isAdmin } from "@/lib/auth/session";
import { SessionPayload } from "@/lib/auth/jwt";
import { recordAudit } from "@/lib/services/audit-server";

export const appointmentInclude = {
  user: { select: { id: true, nome: true, photoUrl: true } },
  lead: { select: { id: true, nome: true, telefone: true } },
  property: { select: { id: true, nome: true, endereco: true, bairro: true } },
} as const;

/** Busca o compromisso garantindo organização e posse (corretor só acessa os seus). */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function findOwnedAppointment(id: string, session: SessionPayload) {
  if (!UUID_RE.test(id)) {
    return { error: NextResponse.json({ error: "Compromisso não encontrado." }, { status: 404 }) };
  }
  const appointment = await prisma.appointment.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!appointment) {
    return { error: NextResponse.json({ error: "Compromisso não encontrado." }, { status: 404 }) };
  }
  if (!isAdmin(session.role) && appointment.userId !== session.userId) {
    return {
      error: NextResponse.json(
        { error: "Você só pode alterar os seus próprios compromissos." },
        { status: 403 }
      ),
    };
  }
  return { appointment };
}

const patchSchema = z
  .object({
    status: z.enum(["AGENDADO", "CONCLUIDO", "CANCELADO", "NAO_COMPARECEU"]).optional(),
    resultadoVisita: z.string().trim().max(2000).nullable().optional(),
    observacoes: z.string().trim().max(5000).nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "Nenhum campo para atualizar." });

export async function updateAppointment(
  req: NextRequest,
  session: SessionPayload,
  id: string,
  body: unknown
) {
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }

  const owned = await findOwnedAppointment(id, session);
  if (owned.error) return owned.error;
  const before = owned.appointment;

  const updated = await prisma.appointment.update({
    where: { id },
    data: parsed.data,
    include: appointmentInclude,
  });

  await recordAudit({
    req,
    organizationId: session.organizationId,
    userId: session.userId,
    acao: "Compromisso atualizado",
    tipoAcao: parsed.data.status && parsed.data.status !== before.status ? "STATUS_CHANGE" : "UPDATE",
    modulo: "AGENDA",
    entidade: "Appointment",
    entidadeId: id,
    entidadeNome: updated.titulo,
    descricao: `Compromisso "${updated.titulo}" atualizado por ${session.nome}.`,
    dadosAntes: { status: before.status, resultadoVisita: before.resultadoVisita },
    dadosDepois: { status: updated.status, resultadoVisita: updated.resultadoVisita },
  });

  return NextResponse.json({ appointment: updated, message: "Compromisso atualizado!" });
}

export async function deleteAppointment(req: NextRequest, session: SessionPayload, id: string) {
  const owned = await findOwnedAppointment(id, session);
  if (owned.error) return owned.error;
  const before = owned.appointment;

  await prisma.appointment.delete({ where: { id } });

  await recordAudit({
    req,
    organizationId: session.organizationId,
    userId: session.userId,
    acao: "Compromisso excluído",
    tipoAcao: "DELETE",
    modulo: "AGENDA",
    entidade: "Appointment",
    entidadeId: id,
    entidadeNome: before.titulo,
    descricao: `Compromisso "${before.titulo}" excluído por ${session.nome}.`,
    dadosAntes: {
      tipo: before.tipo,
      dataInicio: before.dataInicio.toISOString(),
      leadId: before.leadId,
      userId: before.userId,
    },
  });

  return NextResponse.json({ success: true, message: "Compromisso excluído." });
}
