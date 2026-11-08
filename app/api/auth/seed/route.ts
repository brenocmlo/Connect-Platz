import { NextRequest, NextResponse } from "next/server";
import { ensureInitialSeed } from "@/lib/db/autoSeed";
import { getRequestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getRequestSession(req);
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");
    const hasSecret = Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`);
    const isSuperAdmin = session?.role === "ADMINISTRADOR";

    if (!isSuperAdmin && !hasSecret) {
      const existingUsers = await prisma.user.count();
      if (existingUsers > 0) {
        return NextResponse.json(
          { error: "Acesso restrito ao Administrador Geral." },
          { status: 403 }
        );
      }
    }

    const res = await ensureInitialSeed();
    return NextResponse.json({
      success: true,
      message: res.message,
    });
  } catch (error: any) {
    console.error("[Manual Seed Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Falha ao executar seed no banco" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
