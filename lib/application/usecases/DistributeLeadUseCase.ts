import { IUserRepository } from "@/lib/core/interfaces/IUserRepository";
import { IDistributionStrategy } from "@/lib/core/interfaces/IDistributionStrategy";
import { User } from "@prisma/client";

export interface DistributionResult {
  assignedCorretor: User | null;
  isNightQueue: boolean;
  reason: string;
}

/**
 * Single Responsibility: Orquestração do processo de distribuição de leads.
 * Open/Closed: A estratégia de distribuição (Round-Robin, Ponderada, etc.) é injetada via IDistributionStrategy.
 */
export class DistributeLeadUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly strategy: IDistributionStrategy
  ) {}

  isWithinOperatingHours(startHour: string = "09:00", endHour: string = "22:00"): boolean {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR", {
      timeZone: "America/Fortaleza",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const [currentHour, currentMinute] = timeStr.split(":").map(Number);
    const [startH, startM] = startHour.split(":").map(Number);
    const [endH, endM] = endHour.split(":").map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  async execute(
    organizationId: string,
    operatingStart: string = "09:00",
    operatingEnd: string = "22:00"
  ): Promise<DistributionResult> {
    // 1. Checagem de Janela Operacional
    const isOperating = this.isWithinOperatingHours(operatingStart, operatingEnd);
    if (!isOperating) {
      return {
        assignedCorretor: null,
        isNightQueue: true,
        reason: "Lead retido na Fila de Espera Noturna (despacho às 09:00 via FIFO)",
      };
    }

    // 2. Buscar corretores ativos com Check-in diário
    const candidates = await this.userRepo.findEligibleCorretores(organizationId, new Date());
    if (candidates.length === 0) {
      return {
        assignedCorretor: null,
        isNightQueue: false,
        reason: "Nenhum corretor disponível no momento. Lead direcionado ao bolsão compartilhado.",
      };
    }

    // 3. Aplicação da estratégia injetada (OCP/LSP)
    const selected = this.strategy.selectCorretor(candidates);
    if (!selected) {
      return {
        assignedCorretor: null,
        isNightQueue: false,
        reason: "Estratégia não selecionou corretor. Lead enviado ao bolsão.",
      };
    }

    // 4. Atualização atômica do timestamp do corretor selecionado
    await this.userRepo.updateLastLeadAssignedAt(selected.id, new Date());

    return {
      assignedCorretor: selected,
      isNightQueue: false,
      reason: `Lead atribuído a ${selected.nome} via ${this.strategy.name}`,
    };
  }
}
