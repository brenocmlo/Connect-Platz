// app/api/agenda/leadSync.ts
// Sincronização automática entre ações na Agenda e o funil Kanban / prontuário do Lead.

import { prisma } from "@/lib/db/prisma";
import { SessionPayload } from "@/lib/auth/jwt";

interface SyncAppointmentCreationParams {
  appointment: {
    id: string;
    leadId: string | null;
    tipo: string;
    titulo: string;
    dataInicio: Date;
    dataFim: Date;
  };
  session: SessionPayload;
}

interface SyncAppointmentStatusParams {
  appointment: {
    id: string;
    leadId: string | null;
    tipo: string;
    titulo: string;
    status: string;
    resultadoVisita?: string | null;
  };
  previousStatus: string;
  session: SessionPayload;
}

export async function syncAppointmentToLead({ appointment, session }: SyncAppointmentCreationParams) {
  if (!appointment.leadId) return;

  const lead = await prisma.lead.findUnique({
    where: { id: appointment.leadId },
    include: {
      funnel: {
        include: { stages: { orderBy: { posicao: "asc" } } },
      },
      stage: true,
    },
  });

  if (!lead) return;

  let advancedStageName: string | null = null;

  // 1. Visita: avança para etapa de Visita se o lead ainda estiver em etapa anterior
  if (appointment.tipo === "VISITA") {
    const visitStage = lead.funnel.stages.find((st) => /visit/i.test(st.nome));
    if (visitStage && lead.stage.posicao < visitStage.posicao) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { stageId: visitStage.id, slaBreached: false },
      });
      advancedStageName = visitStage.nome;
    }
  }

  // 2. Apresentação de Proposta: avança para etapa de Proposta se o lead estiver antes dela
  if (appointment.tipo === "APRESENTACAO_PROPOSTA") {
    const propStage = lead.funnel.stages.find((st) => /propost/i.test(st.nome));
    if (propStage && lead.stage.posicao < propStage.posicao) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { stageId: propStage.id, slaBreached: false },
      });
      advancedStageName = propStage.nome;
    }
  }

  // 3. Registra na timeline do lead
  const dataFmt = new Date(appointment.dataInicio).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const etapaTxt = advancedStageName ? ` • Lead avançado no funil para "${advancedStageName}"` : "";

  await prisma.leadTimeline.create({
    data: {
      leadId: lead.id,
      userId: session.userId,
      tipo: appointment.tipo === "VISITA" ? "visita" : "nota",
      conteudo: `Compromisso agendado: "${appointment.titulo}" (${appointment.tipo}) para ${dataFmt}${etapaTxt}.`,
      metadata: {
        appointmentId: appointment.id,
        tipo: appointment.tipo,
        dataInicio: appointment.dataInicio.toISOString(),
      },
    },
  });
}

export async function syncAppointmentStatusChangeToLead({
  appointment,
  previousStatus,
  session,
}: SyncAppointmentStatusParams) {
  if (!appointment.leadId || appointment.status === previousStatus) return;

  let msg = `Compromisso "${appointment.titulo}" (${appointment.tipo}) alterado para ${appointment.status} por ${session.nome}.`;

  if (appointment.status === "CONCLUIDO") {
    msg = `Compromisso "${appointment.titulo}" (${appointment.tipo}) concluído por ${session.nome}.${
      appointment.resultadoVisita ? ` Resultado: "${appointment.resultadoVisita}"` : ""
    }`;
  } else if (appointment.status === "NAO_COMPARECEU") {
    msg = `Cliente não compareceu ao compromisso "${appointment.titulo}" (${appointment.tipo}). Registrado por ${session.nome}.`;
  } else if (appointment.status === "CANCELADO") {
    msg = `Compromisso "${appointment.titulo}" (${appointment.tipo}) cancelado por ${session.nome}.`;
  }

  await prisma.leadTimeline.create({
    data: {
      leadId: appointment.leadId,
      userId: session.userId,
      tipo: "status_change",
      conteudo: msg,
      metadata: {
        appointmentId: appointment.id,
        status: appointment.status,
        resultadoVisita: appointment.resultadoVisita || null,
      },
    },
  });
}
