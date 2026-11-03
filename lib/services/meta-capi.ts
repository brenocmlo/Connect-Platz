import crypto from "crypto";

export interface MetaCapiUserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
}

export interface MetaCapiCustomData {
  currency?: string;
  value?: number | null;
  contentName?: string | null;
  contentCategory?: string | null;
  orderId?: string | null;
  [key: string]: any;
}

export interface SendMetaCapiParams {
  pixelId: string;
  token: string;
  testEventCode?: string | null;
  eventName: "PageView" | "ViewContent" | "Lead" | "Schedule" | "InitiateCheckout" | "Purchase" | string;
  eventId?: string | null;
  eventTime?: number;
  eventSourceUrl?: string | null;
  actionSource?: "website" | "system_generated" | "physical_store" | "other";
  userData?: MetaCapiUserData;
  customData?: MetaCapiCustomData;
}

export class MetaCapiService {
  /**
   * Hasheia valor em SHA-256 conforme especificação da Meta.
   */
  static hashSha256(value: string): string {
    return crypto.createHash("sha256").update(value.trim()).digest("hex");
  }

  /**
   * Normaliza telefone brasileiro para E.164 (ex: 5585999998888) e retorna SHA-256.
   */
  static hashPhone(phone: string): string | null {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return null;

    // Se já começa com DDI 55
    const normalized = digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
    return this.hashSha256(normalized);
  }

  /**
   * Normaliza e-mail em minúsculas e retorna SHA-256.
   */
  static hashEmail(email: string): string | null {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    if (!clean.includes("@")) return null;
    return this.hashSha256(clean);
  }

  /**
   * Envia evento para a Meta Conversions API (Graph API v19.0).
   * Operação segura e tolerante a falhas (não bloqueia a thread de execução principal).
   */
  static async sendEvent(params: SendMetaCapiParams): Promise<{
    success: boolean;
    eventsReceived?: number;
    fbtraceId?: string;
    error?: string;
  }> {
    const {
      pixelId,
      token,
      testEventCode,
      eventName,
      eventId,
      eventTime,
      eventSourceUrl,
      actionSource = "website",
      userData = {},
      customData,
    } = params;

    if (!pixelId || !token) {
      return { success: false, error: "Pixel ID ou Token CAPI não fornecido." };
    }

    const hashedUserData: Record<string, any> = {};
    if (userData.email) {
      const em = this.hashEmail(userData.email);
      if (em) hashedUserData.em = [em];
    }
    if (userData.phone) {
      const ph = this.hashPhone(userData.phone);
      if (ph) hashedUserData.ph = [ph];
    }
    if (userData.firstName) {
      hashedUserData.fn = [this.hashSha256(userData.firstName.toLowerCase())];
    }
    if (userData.lastName) {
      hashedUserData.ln = [this.hashSha256(userData.lastName.toLowerCase())];
    }
    if (userData.clientIpAddress) {
      hashedUserData.client_ip_address = userData.clientIpAddress;
    }
    if (userData.clientUserAgent) {
      hashedUserData.client_user_agent = userData.clientUserAgent;
    }
    if (userData.fbp) {
      hashedUserData.fbp = userData.fbp;
    }
    if (userData.fbc) {
      hashedUserData.fbc = userData.fbc;
    }

    const payloadEvent: Record<string, any> = {
      event_name: eventName,
      event_time: eventTime || Math.floor(Date.now() / 1000),
      action_source: actionSource,
      user_data: hashedUserData,
    };

    if (eventId) payloadEvent.event_id = eventId;
    if (eventSourceUrl) payloadEvent.event_source_url = eventSourceUrl;

    if (customData) {
      payloadEvent.custom_data = {
        currency: customData.currency || "BRL",
        ...(customData.value !== undefined && customData.value !== null ? { value: Number(customData.value) } : {}),
        ...(customData.contentName ? { content_name: customData.contentName } : {}),
        ...(customData.contentCategory ? { content_category: customData.contentCategory } : {}),
        ...(customData.orderId ? { order_id: customData.orderId } : {}),
      };
    }

    const requestBody: Record<string, any> = {
      data: [payloadEvent],
    };

    if (testEventCode) {
      requestBody.test_event_code = testEventCode;
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = json?.error?.message || `Meta CAPI erro HTTP ${res.status}`;
        console.warn(`[META CAPI] Falha ao enviar evento ${eventName}:`, errorMsg);
        return { success: false, error: errorMsg, fbtraceId: json?.error?.fbtrace_id };
      }

      return {
        success: true,
        eventsReceived: json?.events_received || 1,
        fbtraceId: json?.fbtrace_id,
      };
    } catch (err: any) {
      console.warn(`[META CAPI] Exceção de rede no evento ${eventName}:`, err?.message || err);
      return { success: false, error: err?.message || "Erro de rede ao conectar com a Meta." };
    }
  }

  /**
   * Teste de conexão para validar o Token e Pixel na Meta Graph API.
   */
  static async testConnection(pixelId: string, token: string, testEventCode?: string) {
    return this.sendEvent({
      pixelId,
      token,
      testEventCode,
      eventName: "Lead",
      eventId: `test_${Date.now()}`,
      actionSource: "system_generated",
      userData: {
        email: "teste@connectplatz.com.br",
        phone: "5585999990000",
      },
      customData: {
        contentName: "Teste de Conexão CAPI Connect Platz",
      },
    });
  }
}
