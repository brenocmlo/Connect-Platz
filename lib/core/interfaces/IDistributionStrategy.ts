import { User } from "@prisma/client";

/**
 * Open/Closed Principle (OCP) & Liskov Substitution Principle (LSP):
 * Estratégia de distribuição de leads intercambiável (Round-Robin, Ponderada, por Região).
 */
export interface IDistributionStrategy {
  readonly name: string;
  selectCorretor(candidates: User[]): User | null;
}
