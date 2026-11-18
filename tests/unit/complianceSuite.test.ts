import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { Role } from "@prisma/client";
import {
  validateCpf,
  validateCnpj,
  formatCpf,
  formatCnpj,
} from "@/lib/services/compliance";
import { buildLeadRLSWhere, maskLeadSensitiveData } from "@/lib/db/rls";
import { isR2Configured } from "@/lib/storage/r2Client";

const ROOT = process.cwd();

function collectTsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsFiles(full));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

describe("Suite de Conformidade — Connect Platz CRM", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("1. Conformidade Cadastral GovTech (CPF/CNPJ Módulo 11)", () => {
    it("valida CPFs legítimos e rejeita dígitos inválidos ou sequências repetidas", () => {
      expect(validateCpf("529.982.247-25")).toBe(true);
      expect(validateCpf("52998224725")).toBe(true);
      expect(validateCpf("529.982.247-26")).toBe(false);
      expect(validateCpf("111.111.111-11")).toBe(false);
      expect(validateCpf("000.000.000-00")).toBe(false);
      expect(validateCpf("1234567890")).toBe(false);
    });

    it("valida CNPJs legítimos e rejeita dígitos inválidos ou sequências repetidas", () => {
      expect(validateCnpj("11.222.333/0001-81")).toBe(true);
      expect(validateCnpj("11222333000181")).toBe(true);
      expect(validateCnpj("11.222.333/0001-82")).toBe(false);
      expect(validateCnpj("00.000.000/0000-00")).toBe(false);
      expect(validateCnpj("11111111111111")).toBe(false);
    });

    it("formata CPF e CNPJ estritamente nos padrões oficiais", () => {
      expect(formatCpf("52998224725")).toBe("529.982.247-25");
      expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
    });
  });

  describe("2. Conformidade LGPD & Row-Level Security (RLS)", () => {
    it("garante isolamento multi-tenant (organizationId) e mascaramento de PII", () => {
      const orgA = "org-A";
      const whereBroker = buildLeadRLSWhere({ userId: "c-1", organizationId: orgA, role: Role.CORRETOR_VENDA });
      expect(whereBroker).toMatchObject({ organizationId: orgA, modalidade: "VENDA" });

      const lead = {
        id: "l-1",
        telefone: "85999887766",
        email: "cliente.vip@empresa.com.br",
        corretorId: "c-titular",
        modalidade: "VENDA",
      };

      const masked = maskLeadSensitiveData(lead, { userId: "c-terceiro", organizationId: orgA, role: Role.CORRETOR_VENDA });
      expect(masked.telefone).toBe("(85) 9****-7766");
      expect(masked.email).toBe("cl***@empresa.com.br");

      const ownerView = maskLeadSensitiveData(lead, { userId: "c-titular", organizationId: orgA, role: Role.CORRETOR_VENDA });
      expect(ownerView.telefone).toBe("85999887766");
      expect(ownerView.email).toBe("cliente.vip@empresa.com.br");
    });
  });

  describe("3. Conformidade Arquitetural (Limite Máximo de 400 Linhas por Arquivo)", () => {
    it("assegura que nenhum arquivo TypeScript/TSX de produção ou teste ultrapasse 400 linhas", () => {
      const dirs = ["app", "components", "lib", "hooks", "tests"];
      const violations: Array<{ file: string; lines: number }> = [];

      for (const d of dirs) {
        for (const file of collectTsFiles(path.join(ROOT, d))) {
          const content = fs.readFileSync(file, "utf8");
          const lines = content === "" ? 0 : content.split(/\r?\n/).length;
          if (lines > 400) {
            violations.push({ file: path.relative(ROOT, file), lines });
          }
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe("4. Conformidade de Escopo e Governança (Sidebar & 7 Perfis Prisma)", () => {
    it("proíbe itens de menu 'Treinamentos', 'Assinatura' e 'Administração' na Sidebar", () => {
      const sidebar = fs.readFileSync(path.join(ROOT, "components/crm/Sidebar.tsx"), "utf8");
      expect(sidebar).not.toMatch(/label:\s*["']Treinamentos["']/i);
      expect(sidebar).not.toMatch(/label:\s*["']Assinatura["']/i);
      expect(sidebar).not.toMatch(/label:\s*["']Administra[çc][ãa]o["']/i);
      expect(sidebar).not.toMatch(/href:\s*["']\/crm\/(treinamentos|assinatura|administracao)["']/i);
    });

    it("garante existência exata dos 7 perfis oficiais no enum Role do Prisma", () => {
      const schema = fs.readFileSync(path.join(ROOT, "prisma/schema.prisma"), "utf8");
      const match = schema.match(/enum\s+Role\s*\{([\s\S]*?)\}/);
      expect(match).not.toBeNull();

      const roles = (match?.[1] || "")
        .split(/\r?\n/)
        .map((line) => line.replace(/\/\/.*$/, "").trim())
        .filter(Boolean);

      expect(roles).toEqual([
        "ADMINISTRADOR",
        "ADMINISTRADOR_VENDA",
        "ADMINISTRADOR_ALUGUEL",
        "FINANCEIRO_VENDA",
        "FINANCEIRO_ALUGUEL",
        "CORRETOR_VENDA",
        "CORRETOR_ALUGUEL",
      ]);
    });
  });

  describe("5. Conformidade PWA & Infraestrutura Stateless Cloudflare R2", () => {
    it("valida manifest.json (standalone, tema Connect Blue, start_url /crm) e Service Worker", () => {
      const manifestRaw = fs.readFileSync(path.join(ROOT, "public/manifest.json"), "utf8");
      const manifest = JSON.parse(manifestRaw);

      expect(manifest.display).toBe("standalone");
      expect(manifest.start_url).toBe("/crm");
      expect(manifest.theme_color).toBe("#1266C7");
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
      expect(fs.existsSync(path.join(ROOT, "public/sw.js"))).toBe(true);
    });

    it("valida uso do SDK @aws-sdk/client-s3 e variáveis de ambiente obrigatórias do Cloudflare R2", () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
      expect(pkg.dependencies["@aws-sdk/client-s3"]).toBeDefined();

      const r2Src = fs.readFileSync(path.join(ROOT, "lib/storage/r2Client.ts"), "utf8");
      for (const envVar of [
        "R2_ACCOUNT_ID",
        "R2_ACCESS_KEY_ID",
        "R2_SECRET_ACCESS_KEY",
        "R2_BUCKET_NAME",
        "R2_PUBLIC_URL",
      ]) {
        expect(r2Src).toContain(envVar);
      }

      delete process.env.R2_ACCOUNT_ID;
      expect(isR2Configured()).toBe(false);

      process.env.R2_ACCOUNT_ID = "acc-123";
      process.env.R2_ACCESS_KEY_ID = "key-123";
      process.env.R2_SECRET_ACCESS_KEY = "sec-123";
      process.env.R2_BUCKET_NAME = "connect-platz";
      expect(isR2Configured()).toBe(true);
    });
  });
});
