import { NextResponse } from "next/server";
import { ensureInitialSeed } from "@/lib/db/autoSeed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await ensureInitialSeed();
    return NextResponse.json({
      success: true,
      message: res.message,
      admin: "robson@connectplatz.com.br",
      passwordHint: "ConnectPlatz2026@",
    });
  } catch (error: any) {
    console.error("[Manual Seed Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Falha ao executar seed no banco" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
