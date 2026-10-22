import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { container } from "@/lib/container";
import { RoletaService } from "@/lib/services/roleta";
import { verifyWebhookKey } from "@/lib/services/webhook-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Secret obrigatório (Authorization: Bearer, x-cron-secret, x-api-key ou ?token=)
    const denied = verifyWebhookKey(req, "CRON_SECRET", req.headers.get("x-cron-secret"));
    if (denied) return denied;

    const organizations = await prisma.organization.findMany({
      select: { id: true, nome: true, bolsaoTimeoutMin: true, operatingStart: true, operatingEnd: true },
    });

    const report = [];

    for (const org of organizations) {
      // 1. Processar transbordos de SLA estourado
      const transbordoResults = await container.processSlaTransbordoUseCase.execute(org.id);

      // 2. Liberar a Fila Noturna dentro do expediente da organização (fuso America/Fortaleza)
      let nightQueueReleased = 0;
      if (RoletaService.isWithinOperatingHours(org.operatingStart, org.operatingEnd)) {
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
