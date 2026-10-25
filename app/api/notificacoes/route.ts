import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession, isAdmin } from "@/lib/auth/session";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";

const rel = (d: Date) => formatDistanceToNow(d, { addSuffix: true, locale: ptBR });

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  const scope = isAdmin(session.role) ? {} : { corretorId: session.userId };
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const [recentLeads, breached, appointments] = await Promise.all([
    prisma.lead.findMany({
      where: { organizationId: session.organizationId, createdAt: { gte: since }, ...scope },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, nome: true, campaignName: true, createdAt: true },
    }),
    prisma.lead.findMany({
      where: {
        organizationId: session.organizationId,
        isClosed: false,
        firstContactAt: null,
        slaDueAt: { lt: new Date() },
        ...scope,
      },
      orderBy: { slaDueAt: "asc" },
      take: 10,
      select: { id: true, nome: true, slaDueAt: true },
    }),
    prisma.appointment.findMany({
      where: {
        organizationId: session.organizationId,
        dataInicio: { gte: startOfDay, lt: endOfDay },
        ...(isAdmin(session.role) ? {} : { userId: session.userId }),
      },
      orderBy: { dataInicio: "asc" },
      take: 10,
      select: { id: true, titulo: true, dataInicio: true },
    }),
  ]);

  const notifications = [
    ...breached.map((l) => ({
      id: `sla-${l.id}`,
      title: "SLA estourado",
      message: `O lead '${l.nome}' ainda não teve primeiro contato.`,
      type: "sla" as const,
      createdAt: rel(l.slaDueAt!),
      sortAt: l.slaDueAt!.getTime(),
    })),
    ...recentLeads.map((l) => ({
      id: `lead-${l.id}`,
      title: "Novo lead",
      message: `Lead '${l.nome}' recebido${l.campaignName ? ` via ${l.campaignName}` : ""}.`,
      type: "lead" as const,
      createdAt: rel(l.createdAt),
      sortAt: l.createdAt.getTime(),
    })),
    ...appointments.map((a) => ({
      id: `appt-${a.id}`,
      title: "Compromisso de hoje",
      message: `${a.titulo} às ${a.dataInicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Fortaleza" })}.`,
      type: "booking" as const,
      createdAt: rel(a.dataInicio),
      sortAt: a.dataInicio.getTime(),
    })),
  ]
    .sort((a, b) => b.sortAt - a.sortAt)
    .map(({ sortAt, ...n }) => ({ ...n, read: false }));

  return NextResponse.json({ notifications, slaBreachedCount: breached.length });
}
