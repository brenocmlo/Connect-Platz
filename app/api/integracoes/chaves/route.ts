// app/api/integracoes/chaves/route.ts
// Exibe as chaves dos webhooks (lidas do process.env) somente para o Administrador.
// Cada consulta é auditada. META_APP_SECRET nunca é devolvido.

import { NextRequest, NextResponse } from "next/server";
import { requireSession, ADMIN_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { CHANNELS } from "@/components/crm/integracoes/channels";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  const keys: Record<string, string | null> = {};
  for (const ch of CHANNELS) {
    keys[ch.id] = process.env[ch.keyEnv] || null;
  }

  await recordAudit({
    req,
    organizationId: session.organizationId,
    userId: session.userId,
    acao: "Visualização de Chaves de Integração",
    tipoAcao: "EXPORT",
    modulo: "INTEGRACOES",
    entidade: "Integracao",
    entidadeNome: "Chaves de webhooks",
    descricao: "Chaves de autenticação dos webhooks exibidas na tela de Integrações.",
  });

  return NextResponse.json({ keys }, { headers: { "Cache-Control": "no-store" } });
}
