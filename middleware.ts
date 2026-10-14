import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "connect_platz_jwt_super_secret_key_change_in_production_2026";

interface DecodedSession {
  userId: string;
  email: string;
  nome: string;
  role: "ADMINISTRADOR" | "DIRETOR" | "GERENTE" | "CORRETOR";
  organizationId: string;
  exp?: number;
}

/**
 * Validação de assinatura JWT HS256 utilizando a Web Crypto API nativa.
 * 100% compatível com o Next.js Edge Runtime sem dependências pesadas.
 */
async function verifyJwtInEdge(token: string): Promise<DecodedSession | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    // Decodifica a assinatura Base64URL
    const base64 = signatureB64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", key, bytes, data);
    if (!isValid) return null;

    // Decodifica o payload
    const payloadJson = atob(
      payloadB64.replace(/-/g, "+").replace(/_/g, "/")
    );
    const payload = JSON.parse(payloadJson) as DecodedSession;

    // Checa expiração se presente
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Rotas restritas para CORRETOR (Regra de Negócio RBAC)
const ADMIN_ONLY_ROUTES = [
  "/crm/fluxo-de-caixa",
  "/crm/equipes",
  "/crm/integracoes",
  "/crm/auditoria",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const token = request.cookies.get("connect_platz_token")?.value || bearerToken;

  // 1. Rota de Login: se já tiver sessão válida, redireciona para o CRM
  if (pathname === "/login") {
    if (token) {
      const session = await verifyJwtInEdge(token);
      if (session) {
        return NextResponse.redirect(new URL("/crm", request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Proteção das Rotas do CRM (/crm e sub-rotas)
  if (pathname.startsWith("/crm")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyJwtInEdge(token);
    if (!session) {
      // Cookie inválido ou adulterado: limpa cookie e redireciona
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("connect_platz_token");
      return response;
    }

    // 3. Verificação Rígida de RBAC
    if (session.role === "CORRETOR") {
      const isForbidden = ADMIN_ONLY_ROUTES.some((route) =>
        pathname.startsWith(route)
      );
      if (isForbidden) {
        // Redireciona o corretor para o Kanban de Leads com mensagem de alerta
        const forbiddenRedirect = new URL("/crm/leads", request.url);
        forbiddenRedirect.searchParams.set("denied", "true");
        return NextResponse.redirect(forbiddenRedirect);
      }
    }

    // Encaminha requisição injetando headers de contexto de sessão
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.userId);
    requestHeaders.set("x-user-role", session.role);
    requestHeaders.set("x-organization-id", session.organizationId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/crm/:path*",
    "/login",
  ],
};
