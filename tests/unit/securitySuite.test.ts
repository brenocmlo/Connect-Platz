import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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
});
