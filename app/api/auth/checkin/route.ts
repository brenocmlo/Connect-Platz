import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { container } from "@/lib/container";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cookieToken = req.cookies.get("connect_platz_token")?.value;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Registrar check-in através da abstração do repositório
    const checkIn = await container.userRepository.registerCheckIn(
      session.userId,
      new Date(),
      req.headers.get("x-forwarded-for") || undefined
    );

    return NextResponse.json(
      {
        success: true,
        message: "Check-in diário realizado com sucesso! Você está ativo na Roleta de Leads.",
        checkIn,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao realizar check-in." },
      { status: 500 }
    );
  }
}
