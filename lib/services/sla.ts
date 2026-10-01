import { prisma } from "../db/prisma";
import { RoletaService } from "./roleta";

export class SlaService {
  /**
   * Executa varredura de SLAs estourados e realiza o transbordo automático de inatividade
   * (Regra Contratual: Transbordo automático para o próximo corretor em caso de ausência de primeiro contato)
   */
  static async processTransbordoInactivity(organizationId: string) {
    const now = new Date();

    // Buscar leads com SLA de primeiro atendimento estourado
    const expiredLeads = await prisma.lead.findMany({
      where: {
        organizationId,
        firstContactAt: null,
        isClosed: false,
        isBolsao: false,
        slaDueAt: {
          lt: now,
        },
        corretorId: {
          not: null,
        },
      },
      include: {
        corretor: true,
        stage: true,
      },
    });

    const results = [];

    for (const lead of expiredLeads) {
      const previousCorretor = lead.corretor;

      // Executa nova rodada da roleta para encontrar o próximo corretor disponível
      const roletaResult = await RoletaService.distributeLead(organizationId);

      if (roletaResult.assignedCorretor && roletaResult.assignedCorretor.id !== previousCorretor?.id) {
        const nextCorretor = roletaResult.assignedCorretor;
        const newSlaMinutes = lead.stage.slaMinutes || 20;
        const newSlaDueAt = new Date(Date.now() + newSlaMinutes * 60 * 1000);

        // Atualizar o lead com o novo corretor
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            corretorId: nextCorretor.id,
            slaBreached: true,
            slaDueAt: newSlaDueAt,
          },
        });

        // Registrar evento de transbordo na linha do tempo
        await prisma.leadTimeline.create({
          data: {
            leadId: lead.id,
            tipo: "transbordo",
            conteudo: `TRANSBORDO AUTOMÁTICO DE INATIVIDADE: O corretor ${previousCorretor?.nome || "Anterior"} não realizou o primeiro contato dentro do SLA. Lead redistribuído para ${nextCorretor.nome}.`,
          },
        });

        results.push({
          leadId: lead.id,
          action: "TRANSBORDO",
          from: previousCorretor?.nome,
          to: nextCorretor.nome,
        });
      } else {
        // Se não houver outro corretor disponível no momento, envia para o Bolsão
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            corretorId: null,
            isBolsao: true,
            bolsaoEnteredAt: new Date(),
            slaBreached: true,
          },
        });

        await prisma.leadTimeline.create({
          data: {
            leadId: lead.id,
            tipo: "transbordo",
            conteudo: `SLA ESTOURADO: Sem resposta do corretor ${previousCorretor?.nome} e sem outros corretores online. Lead transferido para o Bolsão Compartilhado.`,
          },
        });

        results.push({
          leadId: lead.id,
          action: "BOLSAO",
          from: previousCorretor?.nome,
        });
      }
    }

    return results;
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

    // Buscar a etapa de "Encerrado"
    const closedStage = await prisma.funnelStage.findFirst({
      where: {
        funnel: { organizationId },
        nome: { contains: "Encerrado", mode: "insensitive" },
      },
    });

    let closedCount = 0;

    for (const lead of staleLeads) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          isClosed: true,
          closedAt: new Date(),
          stageId: closedStage?.id || lead.stageId,
        },
      });

      await prisma.leadTimeline.create({
        data: {
          leadId: lead.id,
          tipo: "status_change",
          conteudo: `CADUCIDADE AUTOMÁTICA: Lead inativo há mais de ${daysInactive} dias movido para Encerrados.`,
        },
      });

      closedCount++;
    }

    return closedCount;
  }
}
