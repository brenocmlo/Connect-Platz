import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { container } from "@/lib/container";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Validação de Secret Token para execução por Vercel Cron, GitHub Actions ou worker externo
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "connect_platz_cron_secret_2026";

    if (authHeader !== `Bearer ${cronSecret}` && req.headers.get("x-cron-secret") !== cronSecret) {
      // Permite requisições internas em ambiente local de desenvolvimento
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Acesso não autorizado ao Cron Worker" }, { status: 401 });
      }
    }

    const organizations = await prisma.organization.findMany({
      select: { id: true, nome: true, bolsaoTimeoutMin: true },
    });

    const report = [];

    for (const org of organizations) {
      // 1. Processar transbordos de SLA estourado
      const transbordoResults = await container.processSlaTransbordoUseCase.execute(org.id);

      // 2. Liberar leads da Fila Noturna se for após as 09:00
      const now = new Date();
      const currentHour = now.getHours();

      let nightQueueReleased = 0;
      if (currentHour >= 9 && currentHour < 22) {
        const nightLeads = await prisma.lead.findMany({
          where: {
            organizationId: org.id,
            isNightQueue: true,
          },
          orderBy: { createdAt: "asc" },
        });

        for (const nLead of nightLeads) {
          const roleta = await container.distributeLeadUseCase.execute(org.id);
          if (roleta.assignedCorretor) {
            await prisma.lead.update({
              where: { id: nLead.id },
              data: {
                isNightQueue: false,
                corretorId: roleta.assignedCorretor.id,
                slaDueAt: new Date(Date.now() + 20 * 60 * 1000),
              },
            });
            nightQueueReleased++;
          }
        }
      }

      report.push({
        organization: org.nome,
        transbordos: transbordoResults.length,
        nightQueueReleased,
        details: transbordoResults,
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      report,
    });
  } catch (error: any) {
    console.error("Erro no Worker Cron de SLA:", error);
    return NextResponse.json({ error: "Erro interno no cron" }, { status: 500 });
  }
}
