import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function expireAuthCookies(response: NextResponse, isHttps: boolean) {
  // Limpeza explícita por delete e por expiração imediata com maxAge 0
  response.cookies.delete("connect_platz_token");
  response.cookies.set({
    name: "connect_platz_token",
    value: "",
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
}

function checkIsHttps(req: NextRequest): boolean {
  return (
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https" ||
    req.headers.get("x-forwarded-ssl") === "on"
  );
}

export async function POST(req: NextRequest) {
  const isHttps = checkIsHttps(req);
  const response = NextResponse.json(
    { success: true, message: "Sessão encerrada com sucesso." },
    { status: 200 }
  );

  expireAuthCookies(response, isHttps);
  return response;
}

export async function GET(req: NextRequest) {
  const isHttps = checkIsHttps(req);
  const response = NextResponse.redirect(new URL("/login?logout=1", req.url));
  expireAuthCookies(response, isHttps);
  return response;
}
