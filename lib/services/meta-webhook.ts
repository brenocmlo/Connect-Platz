import { z } from "zod";
import crypto from "crypto";
import { prisma } from "../db/prisma";
import { RoletaService } from "./roleta";
import { LeadSource, LeadTemperature } from "@prisma/client";

// Schema de validação Zod para o Webhook da Meta Ads (Leadgen)
export const MetaWebhookLeadgenEntrySchema = z.object({
  id: z.string(),
  time: z.number(),
  changes: z.array(
    z.object({
      field: z.literal("leadgen"),
      value: z.object({
        ad_id: z.string().optional(),
        form_id: z.string().optional(),
        leadgen_id: z.string(),
        created_time: z.number(),
        page_id: z.string().optional(),
        adgroup_id: z.string().optional(),
      }),
    })
  ),
});

export const MetaWebhookPayloadSchema = z.object({
  object: z.literal("page"),
  entry: z.array(MetaWebhookLeadgenEntrySchema),
});

// Schema para criação direta/normalizada de Lead via API/Meta
export const IngestLeadSchema = z.object({
  organizationId: z.string().uuid(),
  nome: z.string().min(2, "Nome é obrigatório"),
  telefone: z.string().min(8, "Telefone é obrigatório"),
  email: z.string().email().optional().or(z.literal("")),
  adId: z.string().optional(),
  formId: z.string().optional(),
  campaignName: z.string().optional(),
  adName: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
});

export type IngestLeadInput = z.infer<typeof IngestLeadSchema>;

export class MetaWebhookService {
  /**
   * Valida a assinatura HMAC SHA256 enviada pela Meta no cabeçalho x-hub-signature-256
   */
  static verifySignature(rawPayload: string, signatureHeader: string | null): boolean {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret || !signatureHeader) {
      // Se não configurado secret no ambiente de teste, permite passagem
      return true;
    }

    const [algorithm, signature] = signatureHeader.split("=");
    if (algorithm !== "sha256" || !signature) {
      return false;
    }

    const hmac = crypto.createHmac("sha256", appSecret);
    const digest = hmac.update(rawPayload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }

  /**
   * Ingestão e processamento de novo lead com deduplicação e entrega via Roleta Round-Robin
   * SLA contratual de entrega: < 3 segundos
   */
  static async ingestLead(input: IngestLeadInput) {
    const validated = IngestLeadSchema.parse(input);

    // Normalizar telefone (apenas números)
    const cleanPhone = validated.telefone.replace(/\D/g, "");

    // 1. DEDUPLICAÇÃO DE LEADS
    const existingLead = await prisma.lead.findFirst({
      where: {
        organizationId: validated.organizationId,
        isClosed: false,
        OR: [
          { telefone: { contains: cleanPhone.slice(-8) } },
          ...(validated.email ? [{ email: validated.email.toLowerCase().trim() }] : []),
        ],
      },
      include: {
        corretor: true,
      },
    });

    if (existingLead) {
      // Registrar evento na linha do tempo do lead existente ao invés de duplicar
      await prisma.leadTimeline.create({
        data: {
          leadId: existingLead.id,
          tipo: "nota",
          conteudo: `RECAPTURA META ADS: Lead reincidente pela campanha "${validated.campaignName || "Meta Ads"}" (Anúncio: ${validated.adName || "Direto"}).`,
        },
      });

      return {
        lead: existingLead,
        isDuplicate: true,
        message: `Lead já existente na carteira do corretor ${existingLead.corretor?.nome || "Sem corretor"}. Evento registrado.`,
      };
    }

    // 2. Buscar Funil Padrão e Primeira Etapa
    const defaultFunnel = await prisma.funnel.findFirst({
      where: {
        organizationId: validated.organizationId,
        isActive: true,
      },
      include: {
        stages: {
          orderBy: { posicao: "asc" },
          take: 1,
        },
      },
    });

    if (!defaultFunnel || defaultFunnel.stages.length === 0) {
      throw new Error("Nenhum funil ou etapa configurado para a organização.");
    }

    const firstStage = defaultFunnel.stages[0];

    // 3. Executar Roleta Round-Robin de Distribuição
    const roletaResult = await RoletaService.distributeLead(validated.organizationId);
    const assignedCorretor = roletaResult.assignedCorretor;

    // Calcular SLA de primeiro atendimento (ex.: 20 minutos)
    const slaMinutes = firstStage.slaMinutes || 20;
    const slaDueAt = roletaResult.isNightQueue
      ? null
      : new Date(Date.now() + slaMinutes * 60 * 1000);

    // 4. Criar Lead no Banco de Dados
    const lead = await prisma.lead.create({
      data: {
        organizationId: validated.organizationId,
        funnelId: defaultFunnel.id,
        stageId: firstStage.id,
        corretorId: assignedCorretor?.id || null,
        nome: validated.nome,
        telefone: cleanPhone,
        email: validated.email ? validated.email.toLowerCase().trim() : null,
        source: LeadSource.META_ADS,
        temperatura: LeadTemperature.MORNO, // Lead recém-captado com interesse ativo
        adId: validated.adId,
        formId: validated.formId,
        campaignName: validated.campaignName,
        adName: validated.adName,
        utmSource: validated.utmSource,
        utmMedium: validated.utmMedium,
        utmCampaign: validated.utmCampaign,
        utmContent: validated.utmContent,
        isNightQueue: roletaResult.isNightQueue,
        isBolsao: !assignedCorretor && !roletaResult.isNightQueue,
        bolsaoEnteredAt: !assignedCorretor && !roletaResult.isNightQueue ? new Date() : null,
        slaDueAt: slaDueAt,
      },
      include: {
        corretor: true,
        stage: true,
      },
    });

    // 5. Registrar Histórico Inicial na Linha do Tempo
    await prisma.leadTimeline.create({
      data: {
        leadId: lead.id,
        tipo: "status_change",
        conteudo: `Lead captado via Meta Ads. ${roletaResult.reason}. SLA de 1º atendimento: ${slaMinutes} min.`,
        metadata: {
          adId: validated.adId,
          campaignName: validated.campaignName,
          adName: validated.adName,
          utms: {
            source: validated.utmSource,
            medium: validated.utmMedium,
            campaign: validated.utmCampaign,
          },
        },
      },
    });

    return {
      lead,
      isDuplicate: false,
      message: roletaResult.reason,
    };
  }
}
