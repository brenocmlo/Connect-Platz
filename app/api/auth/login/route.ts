import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = LoginSchema.parse(body);

    const result = await container.authenticateUserUseCase.execute({
      email,
      plainTextPassword: password,
    });

    const response = NextResponse.json(result, { status: 200 });

    // Salvar token em cookie HttpOnly seguro
    response.cookies.set({
      name: "connect_platz_token",
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao realizar login." },
      { status: 401 }
    );
  }
}
