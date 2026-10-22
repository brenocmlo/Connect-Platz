// lib/services/webhook-auth.ts
// Autenticação dos webhooks de entrada. A chave pode vir em:
//   - header "x-api-key"
//   - header "Authorization: Bearer <chave>"
//   - query string "?token=<chave>" (para portais/formulários que só aceitam URL)
// Se a variável de ambiente não estiver configurada: bloqueia em produção, libera em desenvolvimento.

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function extractWebhookKey(req: NextRequest, bodyKey?: string | null): string | null {
  const header = req.headers.get("x-api-key");
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  const query = req.nextUrl.searchParams.get("token");
  return header || bearer || query || bodyKey || null;
}

/** Retorna NextResponse de erro quando a requisição não está autorizada; null quando OK. */
export function verifyWebhookKey(
  req: NextRequest,
  envName: string,
  bodyKey?: string | null
): NextResponse | null {
  const expected = process.env[envName];
  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      console.error(`[WEBHOOK] ${envName} não configurada: requisição bloqueada.`);
      return NextResponse.json({ error: "Integração não configurada no servidor." }, { status: 503 });
    }
    console.warn(`[WEBHOOK] ${envName} não configurada: aceitando apenas em desenvolvimento.`);
    return null;
  }

  const provided = extractWebhookKey(req, bodyKey);
  if (!provided || !safeEqual(provided, expected)) {
    return NextResponse.json({ error: "Chave de integração inválida ou ausente." }, { status: 401 });
  }
  return null;
}
