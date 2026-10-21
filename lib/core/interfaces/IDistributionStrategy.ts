import { User } from "@prisma/client";

/**
 * Open/Closed Principle (OCP) & Liskov Substitution Principle (LSP):
 * Estratégia de distribuição de leads intercambiável (Round-Robin, Ponderada, por Região).
 * Suporte a modalidades (VENDA ou ALUGUEL) com todos os corretores aptos para ambos os públicos.
 */
export interface IDistributionStrategy {
  readonly name: string;
  selectCorretor(candidates: User[], modality?: "VENDA" | "ALUGUEL"): User | null;
}
