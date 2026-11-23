import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { signSessionToken, verifySessionToken } from "@/lib/auth/jwt";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  canManageSaleValues,
  canManageRentalValues,
  getUserModality,
} from "@/lib/auth/session";
import { canDeletePropertyForRole } from "@/lib/domain/properties/modalityScope";
import { verifyWebhookKey } from "@/lib/services/webhook-auth";
import { getR2PublicBaseUrl } from "@/lib/storage/r2Client";
import { MetaWebhookService } from "@/lib/services/meta-webhook";
import { middleware } from "@/middleware";

describe("Security Suite — Connect Platz CRM", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.JWT_SECRET = "connect-platz-test-secret-super-seguro-2026";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe("1. Autenticação JWT & Integridade de Sessão", () => {
    it("assina e valida um token de sessão legítimo", () => {
      const token = signSessionToken({
        userId: "u-1",
        email: "admin@connectplatz.com.br",
        nome: "Admin Geral",
        role: Role.ADMINISTRADOR,
        organizationId: "org-1",
      });

      const decoded = verifySessionToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe("u-1");
      expect(decoded?.role).toBe(Role.ADMINISTRADOR);
    });

    it("rejeita token vazio, malformado ou com assinatura adulterada", () => {
      expect(verifySessionToken("")).toBeNull();
      expect(verifySessionToken("token.invalido")).toBeNull();

      const valid = signSessionToken({
        userId: "u-2",
        email: "corretor@connectplatz.com.br",
        nome: "Corretor",
        role: Role.CORRETOR_VENDA,
        organizationId: "org-1",
      });
      const [h, p] = valid.split(".");
      const tampered = `${h}.${p}.assinaturaFalsa123`;
      expect(verifySessionToken(tampered)).toBeNull();
    });

    it("rejeita token assinado com chave secreta diferente ou alg=none", () => {
      const forged = jwt.sign(
        { userId: "u-1", role: "ADMINISTRADOR" },
        "segredo-atacante"
      );
      expect(verifySessionToken(forged)).toBeNull();

      const noneHeader = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
      const nonePayload = Buffer.from(JSON.stringify({ userId: "u-1", role: "ADMINISTRADOR" })).toString("base64url");
      expect(verifySessionToken(`${noneHeader}.${nonePayload}.`)).toBeNull();
    });
  });

  describe("2. Política de Senhas & Hash Bcrypt", () => {
    it("recusa senhas menores que 6 caracteres", async () => {
      await expect(hashPassword("12345")).rejects.toThrow(/mínimo 6 caracteres/i);
      await expect(hashPassword("")).rejects.toThrow();
    });

    it("gera hash bcrypt (nunca texto plano) e valida corretamente", async () => {
      process.env.BCRYPT_SALT_ROUNDS = "10";
      const hash = await hashPassword("SenhaForte#2026");
      expect(hash).not.toBe("SenhaForte#2026");
      expect(hash.startsWith("$2")).toBe(true);

      expect(await verifyPassword("SenhaForte#2026", hash)).toBe(true);
      expect(await verifyPassword("SenhaErrada", hash)).toBe(false);
      expect(await verifyPassword("", hash)).toBe(false);
    });
  });

  describe("3. RBAC & Segregação Estrita por Modalidade", () => {
    it("restringe manipulação de valores de Venda a Admin/Admin Venda/Financeiro Venda", () => {
      expect(canManageSaleValues(Role.ADMINISTRADOR)).toBe(true);
      expect(canManageSaleValues(Role.ADMINISTRADOR_VENDA)).toBe(true);
      expect(canManageSaleValues(Role.FINANCEIRO_VENDA)).toBe(true);

      expect(canManageSaleValues(Role.CORRETOR_VENDA)).toBe(false);
      expect(canManageSaleValues(Role.CORRETOR_ALUGUEL)).toBe(false);
      expect(canManageSaleValues(Role.ADMINISTRADOR_ALUGUEL)).toBe(false);
      expect(canManageSaleValues(Role.FINANCEIRO_ALUGUEL)).toBe(false);
    });

    it("restringe manipulação de valores de Aluguel a Admin/Admin Aluguel/Financeiro Aluguel", () => {
      expect(canManageRentalValues(Role.ADMINISTRADOR)).toBe(true);
      expect(canManageRentalValues(Role.ADMINISTRADOR_ALUGUEL)).toBe(true);
      expect(canManageRentalValues(Role.FINANCEIRO_ALUGUEL)).toBe(true);

      expect(canManageRentalValues(Role.CORRETOR_ALUGUEL)).toBe(false);
      expect(canManageRentalValues(Role.CORRETOR_VENDA)).toBe(false);
      expect(canManageRentalValues(Role.ADMINISTRADOR_VENDA)).toBe(false);
      expect(canManageRentalValues(Role.FINANCEIRO_VENDA)).toBe(false);
    });

    it("bloqueia exclusão cruzada de imóveis entre Admin Venda e Admin Aluguel", () => {
      expect(canDeletePropertyForRole("VENDA", Role.ADMINISTRADOR)).toBe(true);
      expect(canDeletePropertyForRole("VERANEIO_TEMPORADA", Role.ADMINISTRADOR)).toBe(true);

      expect(canDeletePropertyForRole("VENDA", Role.ADMINISTRADOR_VENDA)).toBe(true);
      expect(canDeletePropertyForRole("REPASSE", Role.ADMINISTRADOR_VENDA)).toBe(true);
      expect(canDeletePropertyForRole("VERANEIO_TEMPORADA", Role.ADMINISTRADOR_VENDA)).toBe(false);
      expect(canDeletePropertyForRole("LOCACAO_ANUAL", Role.ADMINISTRADOR_VENDA)).toBe(false);

      expect(canDeletePropertyForRole("VERANEIO_TEMPORADA", Role.ADMINISTRADOR_ALUGUEL)).toBe(true);
      expect(canDeletePropertyForRole("LOCACAO_ANUAL", Role.ADMINISTRADOR_ALUGUEL)).toBe(true);
      expect(canDeletePropertyForRole("VENDA", Role.ADMINISTRADOR_ALUGUEL)).toBe(false);
      expect(canDeletePropertyForRole("REPASSE", Role.ADMINISTRADOR_ALUGUEL)).toBe(false);

      expect(canDeletePropertyForRole("VENDA", Role.CORRETOR_VENDA)).toBe(false);
      expect(canDeletePropertyForRole("VERANEIO_TEMPORADA", Role.CORRETOR_ALUGUEL)).toBe(false);
      expect(canDeletePropertyForRole("VENDA", Role.FINANCEIRO_VENDA)).toBe(false);
    });

    it("retorna modalidade correta por perfil", () => {
      expect(getUserModality(Role.CORRETOR_VENDA)).toBe("VENDA");
      expect(getUserModality(Role.CORRETOR_ALUGUEL)).toBe("ALUGUEL");
      expect(getUserModality(Role.ADMINISTRADOR)).toBe("AMBOS");
    });
  });

  describe("4. Autenticação de Webhooks (Fail-Closed em Produção)", () => {
    it("bloqueia com 503 em produção quando a variável do webhook não está configurada", () => {
      vi.stubEnv("NODE_ENV", "production");
      delete process.env.WEBHOOK_INGEST_SECRET;

      const req = new NextRequest("http://localhost:3000/api/webhooks/leads", { method: "POST" });
      const res = verifyWebhookKey(req, "WEBHOOK_INGEST_SECRET");
      expect(res).not.toBeNull();
      expect(res?.status).toBe(503);
    });

    it("bloqueia com 401 quando a chave está ausente ou incorreta", () => {
      process.env.WEBHOOK_INGEST_SECRET = "chave-secreta-crm-999";

      const noKeyReq = new NextRequest("http://localhost:3000/api/webhooks/leads", { method: "POST" });
      expect(verifyWebhookKey(noKeyReq, "WEBHOOK_INGEST_SECRET")?.status).toBe(401);

      const wrongKeyReq = new NextRequest("http://localhost:3000/api/webhooks/leads", {
        method: "POST",
        headers: { "x-api-key": "chave-errada" },
      });
      expect(verifyWebhookKey(wrongKeyReq, "WEBHOOK_INGEST_SECRET")?.status).toBe(401);
    });

    it("aceita chave válida via x-api-key, Bearer token ou query ?token=", () => {
      process.env.WEBHOOK_INGEST_SECRET = "chave-secreta-crm-999";

      const reqHeader = new NextRequest("http://localhost:3000/api/webhooks/leads", {
        method: "POST",
        headers: { "x-api-key": "chave-secreta-crm-999" },
      });
      expect(verifyWebhookKey(reqHeader, "WEBHOOK_INGEST_SECRET")).toBeNull();

      const reqBearer = new NextRequest("http://localhost:3000/api/webhooks/leads", {
        method: "POST",
        headers: { authorization: "Bearer chave-secreta-crm-999" },
      });
      expect(verifyWebhookKey(reqBearer, "WEBHOOK_INGEST_SECRET")).toBeNull();

      const reqQuery = new NextRequest("http://localhost:3000/api/webhooks/leads?token=chave-secreta-crm-999", {
        method: "POST",
      });
      expect(verifyWebhookKey(reqQuery, "WEBHOOK_INGEST_SECRET")).toBeNull();
    });
  });

  describe("5. Cloudflare R2 & Sanitização de URL Pública", () => {
    it("normaliza R2_PUBLIC_URL removendo barras finais e garantindo HTTPS", () => {
      process.env.R2_PUBLIC_URL = "cdn.connectplatz.com.br///";
      expect(getR2PublicBaseUrl()).toBe("https://cdn.connectplatz.com.br");

      process.env.R2_PUBLIC_URL = "https://pub-123.r2.dev/";
      expect(getR2PublicBaseUrl()).toBe("https://pub-123.r2.dev");

      delete process.env.R2_PUBLIC_URL;
      expect(getR2PublicBaseUrl()).toBe("");
    });
  });

  describe("6. Assinatura HMAC SHA-256 do Webhook Meta Ads & Inferência", () => {
    it("bloqueia sem META_APP_SECRET em produção (fail-closed) e valida HMAC SHA-256", () => {
      vi.stubEnv("NODE_ENV", "production");
      delete process.env.META_APP_SECRET;
      expect(MetaWebhookService.verifySignature('{"entry":[]}', null)).toBe(false);

      process.env.META_APP_SECRET = "meta-app-secret-connect-platz-2026";
      const body = JSON.stringify({ object: "page", entry: [{ id: "1", time: 1700000 }] });
      const digest = crypto.createHmac("sha256", process.env.META_APP_SECRET).update(body).digest("hex");

      expect(MetaWebhookService.verifySignature(body, `sha256=${digest}`)).toBe(true);
      expect(MetaWebhookService.verifySignature(body + "tamper", `sha256=${digest}`)).toBe(false);
      expect(MetaWebhookService.verifySignature(body, `md5=${digest}`)).toBe(false);
      expect(MetaWebhookService.verifySignature(body, null)).toBe(false);
    });

    it("infere modalidade ALUGUEL e VENDA pelos form_ids oficiais e campanha na Graph API", async () => {
      process.env.META_PAGE_ACCESS_TOKEN = "meta-page-token-test";
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            form_id: "1426894502491423",
            campaign_name: "Campanha Porto das Dunas",
            field_data: [{ name: "full_name", values: ["Carlos Locatário"] }, { name: "phone_number", values: ["85999990001"] }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            form_id: "1974750823497447",
            campaign_name: "Lançamento Meireles",
            field_data: [{ name: "full_name", values: ["Beatriz Compradora"] }, { name: "phone_number", values: ["85999990002"] }],
          }),
        });
      vi.stubGlobal("fetch", fetchMock);

      const aluguel = await MetaWebhookService.fetchLeadData("leadgen-aluguel-1");
      expect(aluguel?.modalidade).toBe("ALUGUEL");
      expect(aluguel?.nome).toBe("Carlos Locatário");

      const venda = await MetaWebhookService.fetchLeadData("leadgen-venda-1");
      expect(venda?.modalidade).toBe("VENDA");
      expect(venda?.nome).toBe("Beatriz Compradora");
    });
  });

  describe("7. Proteção Zero-Trust no Edge Middleware (middleware.ts)", () => {
    const mkReq = (path: string, token?: string) =>
      new NextRequest(`http://localhost:3000${path}`, {
        headers: token ? { cookie: `connect_platz_token=${token}` } : undefined,
      });

    it("redireciona /crm sem sessão ou com token adulterado para /login", async () => {
      const noToken = await middleware(mkReq("/crm"));
      expect(noToken.status).toBe(307);
      expect(noToken.headers.get("location")).toContain("/login?redirect=%2Fcrm");

      const badToken = await middleware(mkReq("/crm/leads", "token.adulterado.aqui"));
      expect(badToken.status).toBe(307);
      expect(badToken.headers.get("location")).toContain("/login");
    });

    it("aplica segregação RBAC entre Corretores, Financeiros e Admins por modalidade", async () => {
      const cv = signSessionToken({ userId: "u-cv", email: "cv@cp.com", nome: "CV", role: Role.CORRETOR_VENDA, organizationId: "org-1" });
      for (const p of ["/crm/temporada", "/crm/fluxo-de-caixa", "/crm/equipes", "/crm/integracoes", "/crm/auditoria"]) {
        const res = await middleware(mkReq(p, cv));
        expect(res.headers.get("location")).toContain("/crm/leads?denied=true");
      }

      const ca = signSessionToken({ userId: "u-ca", email: "ca@cp.com", nome: "CA", role: Role.CORRETOR_ALUGUEL, organizationId: "org-1" });
      expect((await middleware(mkReq("/crm/vendas", ca))).headers.get("location")).toContain("/crm/leads?denied=true");

      const fv = signSessionToken({ userId: "u-fv", email: "fv@cp.com", nome: "FV", role: Role.FINANCEIRO_VENDA, organizationId: "org-1" });
      expect((await middleware(mkReq("/crm/temporada", fv))).headers.get("location")).toContain("/crm/vendas?denied=true");

      const fa = signSessionToken({ userId: "u-fa", email: "fa@cp.com", nome: "FA", role: Role.FINANCEIRO_ALUGUEL, organizationId: "org-1" });
      expect((await middleware(mkReq("/crm/vendas", fa))).headers.get("location")).toContain("/crm/temporada?denied=true");

      const av = signSessionToken({ userId: "u-av", email: "av@cp.com", nome: "AV", role: Role.ADMINISTRADOR_VENDA, organizationId: "org-1" });
      expect((await middleware(mkReq("/crm/temporada", av))).headers.get("location")).toContain("/crm/vendas?denied=true");

      const aa = signSessionToken({ userId: "u-aa", email: "aa@cp.com", nome: "AA", role: Role.ADMINISTRADOR_ALUGUEL, organizationId: "org-1" });
      expect((await middleware(mkReq("/crm/vendas", aa))).headers.get("location")).toContain("/crm/temporada?denied=true");
    });

    it("injeta headers de contexto x-user-id, x-user-role e x-organization-id em rota autorizada", async () => {
      const admin = signSessionToken({ userId: "u-adm", email: "adm@cp.com", nome: "Admin", role: Role.ADMINISTRADOR, organizationId: "org-99" });
      const res = await middleware(mkReq("/crm/auditoria", admin));
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
      expect(res.headers.get("x-middleware-request-x-user-id")).toBe("u-adm");
      expect(res.headers.get("x-middleware-request-x-user-role")).toBe("ADMINISTRADOR");
      expect(res.headers.get("x-middleware-request-x-organization-id")).toBe("org-99");
    });
  });
});
