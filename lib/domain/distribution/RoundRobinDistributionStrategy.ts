import { User } from "@prisma/client";
import { IDistributionStrategy } from "@/lib/core/interfaces/IDistributionStrategy";

/**
 * Open/Closed Principle & Liskov Substitution:
 * Estratégia de Roleta Round-Robin.
 * Seleciona o corretor com o menor timestamp de último lead recebido (ou null se nunca recebeu).
 */
export class RoundRobinDistributionStrategy implements IDistributionStrategy {
  readonly name = "Round-Robin Ponderado";

  selectCorretor(candidates: User[]): User | null {
    if (!candidates || candidates.length === 0) {
      return null;
    }

    // Ordenar pelo menor timestamp de lastLeadAssignedAt (nulls first)
    const sorted = [...candidates].sort((a, b) => {
      if (!a.lastLeadAssignedAt && !b.lastLeadAssignedAt) return 0;
      if (!a.lastLeadAssignedAt) return -1;
      if (!b.lastLeadAssignedAt) return 1;
      return a.lastLeadAssignedAt.getTime() - b.lastLeadAssignedAt.getTime();
    });

    return sorted[0];
  }
}
