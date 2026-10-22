// lib/auth/session.ts
// Leitura padronizada da sessão nas rotas de API.
// Ordem: cookie HttpOnly primeiro; Bearer apenas para integrações server-to-server.
// Sem sessão válida => 401. Nunca há fallback para um perfil padrão.

import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { verifySessionToken, SessionPayload } from "./jwt";

export const MANAGER_ROLES: Role[] = [Role.ADMINISTRADOR, Role.DIRETOR, Role.GERENTE];
export const DIRECTOR_ROLES: Role[] = [Role.ADMINISTRADOR, Role.DIRETOR];

export function getRequestSession(req: NextRequest): SessionPayload | null {
  const cookieToken = req.cookies.get("connect_platz_token")?.value;
  if (cookieToken) {
    const fromCookie = verifySessionToken(cookieToken);
    if (fromCookie) return fromCookie;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return verifySessionToken(authHeader.slice(7).trim());
  }

  return null;
}

export function isManager(role: Role | string): boolean {
  return MANAGER_ROLES.includes(role as Role);
}

export function isDirector(role: Role | string): boolean {
  return DIRECTOR_ROLES.includes(role as Role);
}

type SessionResult =
  | { session: SessionPayload; error?: undefined }
  | { session?: undefined; error: NextResponse };

/**
 * Exige sessão válida (e opcionalmente um dos perfis informados).
 * Uso: const auth = requireSession(req, MANAGER_ROLES); if (auth.error) return auth.error;
 */
export function requireSession(req: NextRequest, roles?: Role[]): SessionResult {
  const session = getRequestSession(req);
  if (!session) {
    return { error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  }
  if (roles && !roles.includes(session.role)) {
    return {
      error: NextResponse.json(
        { error: "Acesso negado para o seu perfil." },
        { status: 403 }
      ),
    };
  }
  return { session };
}

export function getClientIp(req: NextRequest): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.ip ||
    null
  );
}
