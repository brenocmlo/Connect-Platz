import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "connected";
  let latencyMs = 0;

  try {
    // Executa uma consulta simples para validar a conectividade do banco
    await prisma.$queryRaw`SELECT 1`;
    latencyMs = Date.now() - startTime;
  } catch (err: any) {
    dbStatus = "disconnected";
  }

  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latencyMs,
      },
      environment: process.env.NODE_ENV || "development",
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
