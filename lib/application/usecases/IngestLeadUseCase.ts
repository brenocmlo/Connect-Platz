import { ILeadRepository } from "@/lib/core/interfaces/ILeadRepository";
import { DistributeLeadUseCase } from "./DistributeLeadUseCase";
import { LeadSource, LeadTemperature } from "@prisma/client";

export interface IngestLeadDto {
  organizationId: string;
  funnelId: string;
  stageId: string;
  nome: string;
  telefone: string;
  email?: string | null;
  source?: LeadSource;
  adId?: string;
  formId?: string;
  campaignName?: string;
  adName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  slaMinutes?: number;
}

export interface IngestLeadResult {
  lead: any;
  isDuplicate: boolean;
  message: string;
}

/**
 * Single Responsibility: Ingestão de leads externos ou manuais com deduplicação e entrega via roleta.
 * Dependency Inversion: Depende de ILeadRepository e DistributeLeadUseCase.
 */
export class IngestLeadUseCase {
  constructor(
    private readonly leadRepo: ILeadRepository,
    private readonly distributeUseCase: DistributeLeadUseCase
  ) {}

  async execute(dto: IngestLeadDto): Promise<IngestLeadResult> {
    const cleanPhone = dto.telefone.replace(/\D/g, "");

    // 1. DEDUPLICAÇÃO VIA REPOSITÓRIO
    const existing = await this.leadRepo.findDuplicate(
      dto.organizationId,
      cleanPhone,
      dto.email
    );

    if (existing) {
      await this.leadRepo.addTimeline({
        leadId: existing.id,
        tipo: "nota",
        conteudo: `RECAPTURA: Lead reincidente pela campanha "${dto.campaignName || "Origem Externa"}".`,
      });

      return {
        lead: existing,
        isDuplicate: true,
        message: `Lead já existente na carteira de ${existing.corretor?.nome || "Bolsão"}.`,
      };
    }

    // 2. DISTRIBUIÇÃO PELA ROLETA
    const roletaResult = await this.distributeUseCase.execute(dto.organizationId);
    const assignedCorretor = roletaResult.assignedCorretor;

    const slaMins = dto.slaMinutes || 20;
    const slaDueAt = roletaResult.isNightQueue
      ? null
      : new Date(Date.now() + slaMins * 60 * 1000);

    // 3. PERSISTÊNCIA DO LEAD
    const createdLead = await this.leadRepo.create({
      organizationId: dto.organizationId,
      funnelId: dto.funnelId,
      stageId: dto.stageId,
      corretorId: assignedCorretor?.id || null,
      nome: dto.nome,
      telefone: cleanPhone,
      email: dto.email,
      source: dto.source || LeadSource.META_ADS,
      temperatura: LeadTemperature.MORNO,
      adId: dto.adId,
      formId: dto.formId,
      campaignName: dto.campaignName,
      adName: dto.adName,
      utmSource: dto.utmSource,
      utmMedium: dto.utmMedium,
      utmCampaign: dto.utmCampaign,
      utmContent: dto.utmContent,
      isNightQueue: roletaResult.isNightQueue,
      isBolsao: !assignedCorretor && !roletaResult.isNightQueue,
      bolsaoEnteredAt: !assignedCorretor && !roletaResult.isNightQueue ? new Date() : null,
      slaDueAt,
    });

    // 4. REGISTRO NA LINHA DO TEMPO
    await this.leadRepo.addTimeline({
      leadId: createdLead.id,
      tipo: "status_change",
      conteudo: `Lead captado e distribuído. ${roletaResult.reason}. Prazo de atendimento: ${slaMins} min.`,
      metadata: {
        adId: dto.adId,
        campaignName: dto.campaignName,
      },
    });

    return {
      lead: createdLead,
      isDuplicate: false,
      message: roletaResult.reason,
    };
  }
}
