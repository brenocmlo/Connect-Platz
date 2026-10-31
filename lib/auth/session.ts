// lib/auth/session.ts
// Leitura padronizada da sessão nas rotas de API.
// Ordem: cookie HttpOnly primeiro; Bearer apenas para integrações server-to-server.
// Sem sessão válida => 401. Nunca há fallback para um perfil padrão.

import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { verifySessionToken, SessionPayload } from "./jwt";

export const ADMIN_ROLES: Role[] = [Role.ADMINISTRADOR];
export const FINANCE_ROLES: Role[] = [Role.ADMINISTRADOR, Role.FINANCEIRO_VENDA, Role.FINANCEIRO_ALUGUEL];
export const SALE_ROLES: Role[] = [Role.ADMINISTRADOR, Role.FINANCEIRO_VENDA, Role.CORRETOR_VENDA];
export const RENT_ROLES: Role[] = [Role.ADMINISTRADOR, Role.FINANCEIRO_ALUGUEL, Role.CORRETOR_ALUGUEL];

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

export function isAdmin(role: Role | string): boolean {
  return role === Role.ADMINISTRADOR;
}

export function isFinanceiro(role: Role | string): boolean {
  return role === Role.FINANCEIRO_VENDA || role === Role.FINANCEIRO_ALUGUEL;
}

export function isCorretor(role: Role | string): boolean {
  return role === Role.CORRETOR_VENDA || role === Role.CORRETOR_ALUGUEL;
}

export function canManageSaleValues(role: Role | string): boolean {
  return role === Role.ADMINISTRADOR || role === Role.FINANCEIRO_VENDA;
}

export function canManageRentalValues(role: Role | string): boolean {
  return role === Role.ADMINISTRADOR || role === Role.FINANCEIRO_ALUGUEL;
}

export function getUserModality(role: Role | string): "VENDA" | "ALUGUEL" | "AMBOS" {
  if (role === Role.ADMINISTRADOR) return "AMBOS";
  if (role === Role.FINANCEIRO_VENDA || role === Role.CORRETOR_VENDA) return "VENDA";
  return "ALUGUEL";
}

type SessionResult =
  | { session: SessionPayload; error?: undefined }
  | { session?: undefined; error: NextResponse };

/**
 * Exige sessão válida (e opcionalmente um dos perfis informados).
 * Uso: const auth = requireSession(req, ADMIN_ROLES); if (auth.error) return auth.error;
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
