import { prisma } from "../db/prisma";
import { User, CorretorStatus, Lead } from "@prisma/client";

export interface RoletaDistributionResult {
  assignedCorretor: User | null;
  isNightQueue: boolean;
  reason: string;
}

export class RoletaService {
  /**
   * Verifica se o timestamp atual está dentro da janela operacional comercial
   * Padrão Connect Platz: 09:00 às 22:00 (Fuso horário de Fortaleza/Brasília)
   */
  static isWithinOperatingHours(
    startHour: string = "09:00",
    endHour: string = "22:00"
  ): boolean {
    const now = new Date();
    // Conversão para fuso horário de Brasília (UTC-3)
    const brazilTimeStr = now.toLocaleTimeString("pt-BR", {
      timeZone: "America/Fortaleza",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const [currentHour, currentMinute] = brazilTimeStr.split(":").map(Number);
    const [startH, startM] = startHour.split(":").map(Number);
    const [endH, endM] = endHour.split(":").map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  /**
   * Executa a atribuição de lead pelo algoritmo Round-Robin:
   * 1. Valida horário operacional comercial (09:00 às 22:00).
   * 2. Filtra corretores ativos da organização que:
   *    - Fizeram Check-in no dia de hoje;
   *    - Estão com status DISPONIVEL (ignora EM_VISITA e PAUSA);
   *    - Estão ativos no sistema.
   * 3. Ordena pelo menor timestamp de `lastLeadAssignedAt` (o que está há mais tempo sem receber).
   * 4. Atualiza o timestamp do corretor selecionado de forma atômica.
   */
  static async distributeLead(
    organizationId: string
  ): Promise<RoletaDistributionResult> {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    const isOperating = this.isWithinOperatingHours(
      org?.operatingStart || "09:00",
      org?.operatingEnd || "22:00"
    );

    // Se estiver fora do horário operacional, retém na Fila de Espera Noturna (FIFO às 09:00)
    if (!isOperating) {
      return {
        assignedCorretor: null,
        isNightQueue: true,
        reason: "Lead retido na Fila de Espera Noturna (despacho às 09:00 em ordem de chegada)",
      };
    }

    // Obter data de hoje (00:00:00) para validação do Check-in diário
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar corretores qualificados
    const eligibleCorretores = await prisma.user.findMany({
      where: {
        organizationId,
        isActive: true,
        role: "CORRETOR",
        status: CorretorStatus.DISPONIVEL,
        checkIns: {
          some: {
            date: today,
          },
        },
      },
      orderBy: [
        // Corretores com lastLeadAssignedAt nulo primeiro, depois pelo mais antigo
        { lastLeadAssignedAt: { sort: "asc", nulls: "first" } },
        { createdAt: "asc" },
      ],
      take: 1,
    });

    if (eligibleCorretores.length === 0) {
      return {
        assignedCorretor: null,
        isNightQueue: false,
        reason: "Nenhum corretor disponível com check-in realizado no momento. Lead direcionado ao bolsão.",
      };
    }

    const selectedCorretor = eligibleCorretores[0];

    // Atualiza o timestamp do corretor de forma atômica
    await prisma.user.update({
      where: { id: selectedCorretor.id },
      data: { lastLeadAssignedAt: new Date() },
    });

    return {
      assignedCorretor: selectedCorretor,
      isNightQueue: false,
      reason: `Lead atribuído ao corretor ${selectedCorretor.nome} via Roleta Round-Robin`,
    };
  }

  /**
   * Processa o despacho da Fila de Espera Noturna pontualmente às 09:00 da manhã
   * Despacha leads acumulados respeitando a ordem de chegada (FIFO)
   */
  static async dispatchNightQueue(organizationId: string): Promise<number> {
    const pendingLeads = await prisma.lead.findMany({
      where: {
        organizationId,
        isNightQueue: true,
      },
      orderBy: { createdAt: "asc" }, // FIFO
    });

    let dispatchedCount = 0;

    for (const lead of pendingLeads) {
      const result = await this.distributeLead(organizationId);
      if (result.assignedCorretor) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            corretorId: result.assignedCorretor.id,
            isNightQueue: false,
            slaDueAt: new Date(Date.now() + 20 * 60 * 1000), // 20 min de SLA
          },
        });

        // Registrar na timeline
        await prisma.leadTimeline.create({
          data: {
            leadId: lead.id,
            tipo: "transbordo",
            conteudo: `Despacho matinal da Fila Noturna: lead atribuído a ${result.assignedCorretor.nome}`,
          },
        });

        dispatchedCount++;
      }
    }

    return dispatchedCount;
  }
}
