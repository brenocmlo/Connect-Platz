import { prisma } from "../db/prisma";
import { container } from "@/lib/container";

export class SlaService {
  /**
   * Delega a varredura de SLAs estourados e transbordo de inatividade para o
   * Use Case oficial da Clean Architecture (ProcessSlaTransbordoUseCase).
   */
  static async processTransbordoInactivity(organizationId: string) {
    return container.processSlaTransbordoUseCase.execute(organizationId);
  }

  /**
   * Aplica a Regra de Caducidade: leads sem interação há mais de 14 dias (2 semanas)
   * são movidos automaticamente para a coluna de Encerrados.
   */
  static async processCaducidade(organizationId: string, daysInactive: number = 14) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    const staleLeads = await prisma.lead.findMany({
      where: {
        organizationId,
        isClosed: false,
        updatedAt: {
          lt: cutoffDate,
        },
      },
    });

    let archivedCount = 0;

    for (const lead of staleLeads) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          isClosed: true,
          closedAt: new Date(),
        },
      });

      await prisma.leadTimeline.create({
        data: {
          leadId: lead.id,
          tipo: "caducidade",
          conteudo: `REGRA DE CADUCIDADE: Lead arquivado automaticamente após ${daysInactive} dias sem atualização no funil.`,
        },
      });

      archivedCount++;
    }

    return archivedCount;
  }
}
