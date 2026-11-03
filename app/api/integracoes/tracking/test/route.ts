import { NextRequest, NextResponse } from "next/server";
import { requireSession, ADMIN_ROLES } from "@/lib/auth/session";
import { MetaCapiService } from "@/lib/services/meta-capi";
import { z } from "zod";

export const dynamic = "force-dynamic";

const TestSchema = z.object({
  pixelId: z.string().min(1, "Informe o Pixel ID para testar."),
  token: z.string().min(1, "Informe o Token CAPI para testar."),
  testEventCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const data = TestSchema.parse(body);

    const result = await MetaCapiService.testConnection(
      data.pixelId,
      data.token,
      data.testEventCode || undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Não foi possível validar o Token com a Meta." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Conexão CAPI validada com sucesso na Meta Graph API!",
        fbtraceId: result.fbtraceId,
        eventsReceived: result.eventsReceived,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro ao testar conexão CAPI." },
      { status: 400 }
    );
  }
}
