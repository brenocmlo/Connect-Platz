import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { CorretorStatus } from "@prisma/client";
import { z } from "zod";

const StatusSchema = z.object({
  status: z.enum([
    CorretorStatus.DISPONIVEL,
    CorretorStatus.EM_VISITA,
    CorretorStatus.PAUSA,
    CorretorStatus.OFFLINE,
  ]),
});

export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const { status } = StatusSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: { status },
      select: {
        id: true,
        nome: true,
        status: true,
      },
    });

    let message = `Status alterado para ${status}.`;
    if (status === CorretorStatus.EM_VISITA) {
      message = "Status: EM VISITA. A roleta foi pausada temporariamente para você, mantendo seu check-in ativo.";
    }

    return NextResponse.json({ success: true, message, user: updatedUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao alterar status." },
      { status: 500 }
    );
  }
}
