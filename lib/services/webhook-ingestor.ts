// lib/services/webhook-ingestor.ts
// Ingestor universal e determinístico para todas as integrações de Webhook do Connect Platz CRM

import { prisma } from "@/lib/db/prisma";
import { container } from "@/lib/container";
import { LeadSource } from "@prisma/client";
import { logAuditEvent } from "@/lib/services/auditLogger";

export interface StandardWebhookPayload {
  channelId: string;
  source: LeadSource;
  nome: string;
  telefone: string;
  email?: string | null;
  campaignName?: string;
  adName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  mensagem?: string;
  codigoImovel?: string;
  customFields?: Record<string, unknown>;
}

export class WebhookIngestorService {
  static async ingestLead(payload: StandardWebhookPayload) {
    if (!payload.nome || !payload.telefone) {
      throw new Error("Campos obrigatórios ausentes: 'nome' e 'telefone' são mandatórios.");
    }

    // 1. Obter Organização padrão Connect Platz
    const org = await prisma.organization.findFirst({
      where: { slug: "connect-platz" },
      include: {
        funnels: {
          where: { isActive: true },
          include: {
            stages: { orderBy: { posicao: "asc" }, take: 1 },
          },
          take: 1,
        },
      },
    });

    if (!org || !org.funnels[0] || !org.funnels[0].stages[0]) {
      throw new Error("Organização ou Funil padrão não encontrado.");
    }

    const funnel = org.funnels[0];
    const stage = funnel.stages[0];

    // 2. Executar ingestão através do Caso de Uso oficial com Roleta Round-Robin e Deduplicação
    const result = await container.ingestLeadUseCase.execute({
      organizationId: org.id,
      funnelId: funnel.id,
      stageId: stage.id,
      slaMinutes: stage.slaMinutes || 20,
      nome: payload.nome.trim(),
      telefone: payload.telefone.trim(),
      email: payload.email?.toLowerCase().trim() || null,
      source: payload.source,
      campaignName: payload.campaignName || `Canal ${payload.channelId}`,
      adName: payload.adName || (payload.codigoImovel ? `Ref. Imóvel #${payload.codigoImovel}` : undefined),
      utmSource: payload.utmSource || payload.channelId,
      utmMedium: payload.utmMedium || "webhook",
      utmCampaign: payload.utmCampaign || payload.campaignName,
    });

    // 3. Registrar na trilha de auditoria
    logAuditEvent({
      usuario: {
        id: "webhook-system",
        nome: `Integração: ${payload.channelId.toUpperCase()}`,
        email: `webhook.${payload.channelId}@connectplatz.com.br`,
        role: "SISTEMA",
      },
      acao: `Entrada de Lead (${payload.channelId})`,
      tipoAcao: "CREATE",
      modulo: "LEADS",
      detalhes: `Lead '${payload.nome}' (${payload.telefone}) recebido via ${payload.channelId}. ${result.message}`,
      entidadeAfetada: {
        tipo: "Lead",
        id: result.lead.id,
        nome: payload.nome,
      },
    });

    return result;
  }
}
