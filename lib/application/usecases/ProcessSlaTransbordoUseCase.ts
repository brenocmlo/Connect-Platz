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
      const actionOnExpire = (lead.stage?.actionOnExpire || "transbordo").toLowerCase();
      const leadModality: "VENDA" | "ALUGUEL" =
        lead.modalidade === "ALUGUEL" || lead.funnel?.modalidade === "ALUGUEL"
          ? "ALUGUEL"
          : "VENDA";
      const opStart = lead.organization?.operatingStart || "09:00";
      const opEnd = lead.organization?.operatingEnd || "22:00";

      // Caso 1: Etapa configurada apenas para notificar (mantém corretor atual e marca slaBreached)
      if (actionOnExpire === "notificar") {
        if (!lead.slaBreached) {
          await this.leadRepo.update(lead.id, { slaBreached: true });
          await this.leadRepo.addTimeline({
            leadId: lead.id,
            tipo: "transbordo",
            conteudo: `ALERTA DE SLA: Prazo da etapa "${lead.stage?.nome || "Atendimento"}" expirado na carteira de ${previousCorretor?.nome || "Corretor"}.`,
          });
          processed.push({ leadId: lead.id, action: "NOTIFICAR", to: previousCorretor?.nome });
        }
        continue;
      }

      // Caso 2: Etapa configurada para enviar direto ao Bolsão
      if (actionOnExpire === "bolsao") {
        await this.leadRepo.update(lead.id, {
          corretorId: null,
          isBolsao: true,
          bolsaoEnteredAt: new Date(),
          slaBreached: true,
        });
        await this.leadRepo.addTimeline({
          leadId: lead.id,
          tipo: "transbordo",
          conteudo: `SLA ESTOURADO: Etapa configurada para envio direto ao Bolsão Compartilhado (anterior: ${previousCorretor?.nome || "Corretor"}).`,
        });
        processed.push({ leadId: lead.id, action: "BOLSAO" });
        continue;
      }

      // Caso 3 (padrão): Transbordo via roleta excluindo o corretor anterior e respeitando a modalidade
      const roletaResult = await this.distributeUseCase.execute(
        organizationId,
        opStart,
        opEnd,
        leadModality,
        previousCorretor?.id
      );

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
        // Enviar para o Bolsão se não houver outro corretor elegível online na modalidade
        await this.leadRepo.update(lead.id, {
          corretorId: null,
          isBolsao: true,
          bolsaoEnteredAt: new Date(),
          slaBreached: true,
        });

        await this.leadRepo.addTimeline({
          leadId: lead.id,
          tipo: "transbordo",
          conteudo: `SLA ESTOURADO: Sem resposta do corretor ${previousCorretor?.nome || "Anterior"} e sem outros corretores de ${leadModality === "ALUGUEL" ? "Aluguel" : "Vendas"} online. Lead transferido para o Bolsão Compartilhado.`,
        });

        processed.push({ leadId: lead.id, action: "BOLSAO" });
      }
    }

    return processed;
  }
}
