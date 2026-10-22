// components/crm/integracoes/channels.ts
// Mapa canônico dos canais de integração: rota do webhook, variável de ambiente da chave
// e critério para reconhecer os leads recebidos por cada canal. Compartilhado por UI e API.

export type ChannelId =
  | "meta-ads"
  | "google-ads"
  | "grupo-olx"
  | "dream-casa"
  | "chaves-na-mao"
  | "landing-page"
  | "api-webhooks";

export type ChannelAuth = "meta" | "google" | "url-token" | "header";

export interface ChannelDef {
  id: ChannelId;
  webhookPath: string;
  /** Variável de ambiente com a chave aceita pela rota (Meta usa META_VERIFY_TOKEN no handshake). */
  keyEnv: string;
  auth: ChannelAuth;
  /** Critério de origem gravado pelo webhook no lead. */
  match: { source: string; utmSource?: string };
}

export const CHANNELS: ChannelDef[] = [
  { id: "meta-ads", webhookPath: "/api/webhooks/meta", keyEnv: "META_VERIFY_TOKEN", auth: "meta", match: { source: "META_ADS", utmSource: "facebook" } },
  { id: "google-ads", webhookPath: "/api/webhooks/google-ads", keyEnv: "GOOGLE_ADS_WEBHOOK_KEY", auth: "google", match: { source: "GOOGLE_ADS", utmSource: "google" } },
  { id: "grupo-olx", webhookPath: "/api/webhooks/grupo-olx", keyEnv: "PORTAL_WEBHOOK_KEY", auth: "url-token", match: { source: "PORTAL_IMOBILIARIO", utmSource: "olx_zap_vivareal" } },
  { id: "dream-casa", webhookPath: "/api/webhooks/dream-casa", keyEnv: "PORTAL_WEBHOOK_KEY", auth: "url-token", match: { source: "PORTAL_IMOBILIARIO", utmSource: "dreamcasa" } },
  { id: "chaves-na-mao", webhookPath: "/api/webhooks/chaves-na-mao", keyEnv: "PORTAL_WEBHOOK_KEY", auth: "url-token", match: { source: "PORTAL_IMOBILIARIO", utmSource: "chavesnamao" } },
  { id: "landing-page", webhookPath: "/api/webhooks/landing-page", keyEnv: "LANDING_PAGE_WEBHOOK_KEY", auth: "url-token", match: { source: "CATALOGO_SITE", utmSource: "site_oficial" } },
  { id: "api-webhooks", webhookPath: "/api/webhooks/custom", keyEnv: "CONNECT_PLATZ_API_KEY", auth: "header", match: { source: "API_EXTERNA" } },
];

export interface ChannelStatus {
  leadsRecebidos: number;
  ultimoLeadEm: string | null;
  keyConfigured: boolean;
  /** Somente Meta: META_APP_SECRET configurado para validar a assinatura X-Hub-Signature-256. */
  signatureConfigured?: boolean;
  recentes: { id: string; nome: string; createdAt: string; corretor: string | null }[];
}
