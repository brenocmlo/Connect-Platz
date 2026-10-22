// app/api/integracoes/status/route.ts
// Status real de cada integração: leads recebidos pela origem do canal e se a chave está configurada.
// "Conectado" na UI só quando há lead recebido — nada de status fictício.

import { NextRequest, NextResponse } from "next/server";
import { LeadSource, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession, MANAGER_ROLES } from "@/lib/auth/session";
import { CHANNELS, ChannelStatus } from "@/components/crm/integracoes/channels";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireSession(req, MANAGER_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const entries = await Promise.all(
      CHANNELS.map(async (ch) => {
        const where: Prisma.LeadWhereInput = {
          organizationId: session.organizationId,
          source: ch.match.source as LeadSource,
          ...(ch.match.utmSource ? { utmSource: ch.match.utmSource } : {}),
        };
        const [count, recentes] = await Promise.all([
          prisma.lead.count({ where }),
          prisma.lead.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { id: true, nome: true, createdAt: true, corretor: { select: { nome: true } } },
          }),
        ]);
        const status: ChannelStatus = {
          leadsRecebidos: count,
          ultimoLeadEm: recentes[0]?.createdAt.toISOString() || null,
          keyConfigured: Boolean(process.env[ch.keyEnv]),
          ...(ch.auth === "meta" ? { signatureConfigured: Boolean(process.env.META_APP_SECRET) } : {}),
          recentes: recentes.map((l) => ({
            id: l.id,
            nome: l.nome,
            createdAt: l.createdAt.toISOString(),
            corretor: l.corretor?.nome || null,
          })),
        };
        return [ch.id, status] as const;
      })
    );

    return NextResponse.json({ channels: Object.fromEntries(entries) });
  } catch (err) {
    console.error("[INTEGRACOES/STATUS] GET:", err);
    return NextResponse.json({ error: "Erro ao consultar o status das integrações." }, { status: 500 });
  }
}
