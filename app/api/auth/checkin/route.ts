import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";
import { container } from "@/lib/container";

export async function POST(req: NextRequest) {
  try {
    const session = getRequestSession(req);
    if (!session) {
      return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 });
    }

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
      { error: error?.message || "Erro ao realizar check-in." },
      { status: 500 }
    );
  }
}
