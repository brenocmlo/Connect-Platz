import { Lead, LeadTimeline, Prisma } from "@prisma/client";

export interface CreateLeadDto {
  organizationId: string;
  funnelId: string;
  stageId: string;
  corretorId?: string | null;
  nome: string;
  telefone: string;
  email?: string | null;
  source?: any;
  temperatura?: any;
  adId?: string;
  formId?: string;
  campaignName?: string;
  adName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  isNightQueue?: boolean;
  isBolsao?: boolean;
  bolsaoEnteredAt?: Date | null;
  slaDueAt?: Date | null;
  rendaDeclarada?: number;
  faixaRenda?: string;
  tipoOcupacaoCredito?: any;
  rendaEspecificaAutonomo?: number;
  bairrosInteresse?: string[];
}

export interface CreateTimelineDto {
  leadId: string;
  userId?: string | null;
  tipo: string;
  conteudo: string;
  metadata?: any;
}

/**
 * Interface Segregation: Repositório de Leads isolado das regras de negócio.
 */
export interface ILeadRepository {
  findById(id: string): Promise<(Lead & { stage: any; funnel: any; corretor: any; timeline: any; documents: any }) | null>;
  findDuplicate(organizationId: string, cleanPhone: string, email?: string | null): Promise<(Lead & { corretor: any }) | null>;
  create(data: CreateLeadDto): Promise<Lead & { corretor?: any; stage?: any }>;
  update(id: string, data: Prisma.LeadUncheckedUpdateInput | Prisma.LeadUpdateInput): Promise<Lead>;
  addTimeline(dto: CreateTimelineDto): Promise<LeadTimeline>;
  findExpiredSlaLeads(organizationId: string, now: Date): Promise<(Lead & { corretor: any; stage: any })[]>;
  findInactiveLeads(organizationId: string, cutoffDate: Date): Promise<Lead[]>;
  findManyWithFilter(where: Prisma.LeadWhereInput, limit?: number): Promise<(Lead & { stage: any; corretor: any })[]>;
}
