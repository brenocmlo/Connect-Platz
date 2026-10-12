import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Sessão encerrada com sucesso." },
    { status: 200 }
  );

  // Expira e remove o cookie HttpOnly de forma segura
  response.cookies.set({
    name: "connect_platz_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
