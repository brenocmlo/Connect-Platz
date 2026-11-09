import { container } from "@/lib/container";
import { User } from "@prisma/client";

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
   * Delega para o Use Case oficial da Clean Architecture (DistributeLeadUseCase),
   * mantendo compatibilidade e segregação estrita por modalidade (VENDA vs ALUGUEL).
   */
  static async distributeLead(
    organizationId: string,
    modality: "VENDA" | "ALUGUEL" = "VENDA"
  ): Promise<RoletaDistributionResult> {
    return container.distributeLeadUseCase.execute(organizationId, "09:00", "22:00", modality);
  }
}
