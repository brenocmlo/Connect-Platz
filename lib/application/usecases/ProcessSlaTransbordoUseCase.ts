import { ILeadRepository } from "@/lib/core/interfaces/ILeadRepository";
import { DistributeLeadUseCase } from "./DistributeLeadUseCase";

export class ProcessSlaTransbordoUseCase {
  constructor(
    private readonly leadRepo: ILeadRepository,
    private readonly distributeUseCase: DistributeLeadUseCase
  ) {}

  async execute(organizationId: string) {
    const expiredLeads = await this.leadRepo.findExpiredSlaLeads(organizationId, new Date());
    const processed = [];

    for (const lead of expiredLeads) {
      const previousCorretor = lead.corretor;

      // Executar nova distribuição via roleta
      const roletaResult = await this.distributeUseCase.execute(organizationId);

      if (roletaResult.assignedCorretor && roletaResult.assignedCorretor.id !== previousCorretor?.id) {
        const nextCorretor = roletaResult.assignedCorretor;
        const newSlaMinutes = lead.stage?.slaMinutes || 20;

        await this.leadRepo.update(lead.id, {
          corretorId: nextCorretor.id,
          slaBreached: true,
          slaDueAt: new Date(Date.now() + newSlaMinutes * 60 * 1000),
        });

        await this.leadRepo.addTimeline({
          leadId: lead.id,
          tipo: "transbordo",
          conteudo: `TRANSBORDO DE INATIVIDADE (SOLID): Corretor ${previousCorretor?.nome || "Anterior"} não realizou o 1º contato no prazo. Lead redistribuído para ${nextCorretor.nome}.`,
        });

        processed.push({ leadId: lead.id, action: "TRANSBORDO", to: nextCorretor.nome });
      } else {
        // Enviar para o Bolsão se não houver corretor online
        await this.leadRepo.update(lead.id, {
          corretorId: null,
          isBolsao: true,
          bolsaoEnteredAt: new Date(),
          slaBreached: true,
        });

        await this.leadRepo.addTimeline({
          leadId: lead.id,
          tipo: "transbordo",
          conteudo: `SLA ESTOURADO: Sem resposta do corretor ${previousCorretor?.nome} e sem outros corretores online. Lead transferido para o Bolsão Compartilhado.`,
        });

        processed.push({ leadId: lead.id, action: "BOLSAO" });
      }
    }

    return processed;
  }
}
