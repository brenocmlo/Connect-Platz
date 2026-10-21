import { User } from "@prisma/client";
import { IDistributionStrategy } from "@/lib/core/interfaces/IDistributionStrategy";

/**
 * Open/Closed Principle & Liskov Substitution:
 * Estratégia de Roleta Round-Robin com suporte a modalidades independentes (Venda e Aluguel de Temporada).
 * Todos os corretores são aptos para ambos os públicos, garantindo rodízio equitativo.
 */
export class RoundRobinDistributionStrategy implements IDistributionStrategy {
  readonly name = "Round-Robin Ponderado (Venda & Temporada)";

  selectCorretor(candidates: User[], modality?: "VENDA" | "ALUGUEL"): User | null {
    if (!candidates || candidates.length === 0) {
      return null;
    }

    // Ordenar pelo menor timestamp de atribuição (nulls first)
    const sorted = [...candidates].sort((a, b) => {
      if (!a.lastLeadAssignedAt && !b.lastLeadAssignedAt) return 0;
      if (!a.lastLeadAssignedAt) return -1;
      if (!b.lastLeadAssignedAt) return 1;
      return a.lastLeadAssignedAt.getTime() - b.lastLeadAssignedAt.getTime();
    });

    return sorted[0];
  }
}
