import { PrismaClient, Lead, LeadTimeline, Prisma } from "@prisma/client";
import { ILeadRepository, CreateLeadDto, CreateTimelineDto } from "@/lib/core/interfaces/ILeadRepository";

export class PrismaLeadRepository implements ILeadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<any> {
    return this.prisma.lead.findUnique({
      where: { id },
      include: {
        stage: true,
        funnel: true,
        corretor: {
          select: { id: true, nome: true, email: true, telefone: true },
        },
        timeline: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, nome: true } },
          },
        },
        documents: true,
      },
    });
  }

  async findDuplicate(
    organizationId: string,
    cleanPhone: string,
    email?: string | null
  ): Promise<any> {
    return this.prisma.lead.findFirst({
      where: {
        organizationId,
        isClosed: false,
        OR: [
          { telefone: { contains: cleanPhone.slice(-8) } },
          ...(email ? [{ email: email.toLowerCase().trim() }] : []),
        ],
      },
      include: {
        corretor: true,
      },
    });
  }

  async create(data: CreateLeadDto): Promise<any> {
    return this.prisma.lead.create({
      data: {
        organizationId: data.organizationId,
        funnelId: data.funnelId,
        stageId: data.stageId,
        corretorId: data.corretorId || null,
        nome: data.nome,
        telefone: data.telefone,
        email: data.email || null,
        source: data.source,
        temperatura: data.temperatura,
        adId: data.adId,
        formId: data.formId,
        campaignName: data.campaignName,
        adName: data.adName,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmContent: data.utmContent,
        isNightQueue: data.isNightQueue ?? false,
        isBolsao: data.isBolsao ?? false,
        bolsaoEnteredAt: data.bolsaoEnteredAt,
        slaDueAt: data.slaDueAt,
        rendaDeclarada: data.rendaDeclarada,
        faixaRenda: data.faixaRenda,
        tipoOcupacaoCredito: data.tipoOcupacaoCredito,
        rendaEspecificaAutonomo: data.rendaEspecificaAutonomo,
        bairrosInteresse: data.bairrosInteresse || [],
      },
      include: {
        corretor: true,
        stage: true,
      },
    });
  }

  async update(id: string, data: Prisma.LeadUncheckedUpdateInput | Prisma.LeadUpdateInput): Promise<Lead> {
    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  async addTimeline(dto: CreateTimelineDto): Promise<LeadTimeline> {
    return this.prisma.leadTimeline.create({
      data: {
        leadId: dto.leadId,
        userId: dto.userId || null,
        tipo: dto.tipo,
        conteudo: dto.conteudo,
        metadata: dto.metadata || Prisma.JsonNull,
      },
    });
  }

  async findExpiredSlaLeads(organizationId: string, now: Date): Promise<any> {
    return this.prisma.lead.findMany({
      where: {
        organizationId,
        firstContactAt: null,
        isClosed: false,
        isBolsao: false,
        slaDueAt: { lt: now },
        corretorId: { not: null },
      },
      include: {
        corretor: true,
        stage: true,
      },
    });
  }

  async findInactiveLeads(organizationId: string, cutoffDate: Date): Promise<Lead[]> {
    return this.prisma.lead.findMany({
      where: {
        organizationId,
        isClosed: false,
        updatedAt: { lt: cutoffDate },
      },
    });
  }

  async findManyWithFilter(where: Prisma.LeadWhereInput, limit: number = 200): Promise<any> {
    return this.prisma.lead.findMany({
      where,
      include: {
        stage: true,
        corretor: {
          select: { id: true, nome: true, email: true, photoUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
