// lib/services/webhook-ingestor.ts
// Ingestor universal e determinístico para todas as integrações de Webhook do Connect Platz CRM

import { prisma } from "@/lib/db/prisma";
import { container } from "@/lib/container";
import { LeadSource } from "@prisma/client";
import { recordAudit } from "@/lib/services/audit-server";

export interface StandardWebhookPayload {
  channelId: string;
  source: LeadSource;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  campaignName?: string;
  adName?: string;
  adId?: string;
  formId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  mensagem?: string;
  codigoImovel?: string;
}

export class WebhookValidationError extends Error {}

/** Lê um campo de texto opcional de um objeto JSON/FormData sem aceitar tipos inesperados. */
export function pickString(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

export class WebhookIngestorService {
  static async ingestLead(payload: StandardWebhookPayload) {
    const nome = payload.nome?.trim();
    const telefone = payload.telefone?.trim() || "";
    const email = payload.email?.toLowerCase().trim() || null;

    if (!nome || nome.length < 2) {
      throw new WebhookValidationError("Campo obrigatório ausente: 'nome'.");
    }
    if (!telefone && !email) {
      throw new WebhookValidationError("Informe ao menos 'telefone' ou 'email' do lead.");
    }

    // 1. Organização padrão Connect Platz (webhooks públicos não carregam sessão)
    const org = await prisma.organization.findFirst({
      where: { slug: "connect-platz" },
      include: {
        funnels: {
          where: { isActive: true },
          include: { stages: { orderBy: { posicao: "asc" }, take: 1 } },
          take: 1,
        },
      },
    });

    if (!org || !org.funnels[0] || !org.funnels[0].stages[0]) {
      throw new Error("Organização ou Funil padrão não encontrado.");
    }

    const funnel = org.funnels[0];
    const stage = funnel.stages[0];

    // 2. Caso de Uso oficial: deduplicação + Roleta Round-Robin + score
    const result = await container.ingestLeadUseCase.execute({
      organizationId: org.id,
      funnelId: funnel.id,
      stageId: stage.id,
      slaMinutes: stage.slaMinutes || 20,
      nome,
      telefone,
      email,
      source: payload.source,
      adId: payload.adId,
      formId: payload.formId,
      campaignName: payload.campaignName || `Canal ${payload.channelId}`,
      adName: payload.adName || (payload.codigoImovel ? `Ref. Imóvel #${payload.codigoImovel}` : undefined),
      utmSource: payload.utmSource || payload.channelId,
      utmMedium: payload.utmMedium || "webhook",
      utmCampaign: payload.utmCampaign || payload.campaignName,
      utmContent: payload.utmContent,
      mensagem: payload.mensagem,
    });

    // 3. Trilha de auditoria persistida
    await recordAudit({
      organizationId: org.id,
      userId: null,
      ator: `Integração: ${payload.channelId}`,
      acao: `Entrada de Lead (${payload.channelId})`,
      tipoAcao: "CREATE",
      modulo: "INTEGRACOES",
      entidade: "Lead",
      entidadeId: result.lead.id,
      entidadeNome: nome,
      descricao: `Lead '${nome}' recebido via ${payload.channelId}. ${result.message}`,
    });

    return result;
  }
}

/** Resposta padronizada de erro para as rotas de webhook. */
export function webhookErrorStatus(error: unknown): number {
  return error instanceof WebhookValidationError ? 400 : 500;
}
