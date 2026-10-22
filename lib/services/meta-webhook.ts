import { z } from "zod";
import crypto from "crypto";

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

export interface MetaLeadData {
  nome?: string;
  telefone?: string;
  email?: string;
  campaignName?: string;
  adName?: string;
}

export class MetaWebhookService {
  /**
   * Valida a assinatura HMAC SHA256 do cabeçalho x-hub-signature-256.
   * Sem META_APP_SECRET: bloqueia em produção e só aceita em desenvolvimento.
   * Com o secret configurado, a assinatura é SEMPRE obrigatória.
   */
  static verifySignature(rawPayload: string, signatureHeader: string | null): boolean {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
      return process.env.NODE_ENV !== "production";
    }
    if (!signatureHeader) return false;

    const [algorithm, signature] = signatureHeader.split("=");
    if (algorithm !== "sha256" || !signature) return false;

    const digest = crypto.createHmac("sha256", appSecret).update(rawPayload).digest("hex");
    const a = Buffer.from(signature, "utf8");
    const b = Buffer.from(digest, "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  /**
   * Busca os dados preenchidos pelo cliente no formulário (Graph API /{leadgen_id}).
   * Requer META_PAGE_ACCESS_TOKEN. Retorna null quando não for possível consultar.
   */
  static async fetchLeadData(leadgenId: string): Promise<MetaLeadData | null> {
    const accessToken = process.env.META_PAGE_ACCESS_TOKEN;
    if (!accessToken) return null;

    try {
      const url = `https://graph.facebook.com/v19.0/${encodeURIComponent(leadgenId)}?fields=field_data,campaign_name,ad_name&access_token=${encodeURIComponent(accessToken)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        console.error("[Meta Webhook] Graph API respondeu", res.status);
        return null;
      }
      const data = await res.json();
      const fields: Record<string, string> = {};
      for (const f of data.field_data || []) {
        if (f?.name && Array.isArray(f.values) && f.values[0]) fields[String(f.name).toLowerCase()] = String(f.values[0]);
      }
      const firstName = fields["first_name"];
      const lastName = fields["last_name"];
      return {
        nome: fields["full_name"] || fields["nome_completo"] || fields["nome"] || [firstName, lastName].filter(Boolean).join(" ") || undefined,
        telefone: fields["phone_number"] || fields["telefone"] || fields["whatsapp"],
        email: fields["email"],
        campaignName: data.campaign_name,
        adName: data.ad_name,
      };
    } catch (err) {
      console.error("[Meta Webhook] Falha ao consultar Graph API:", err);
      return null;
    }
  }
}
