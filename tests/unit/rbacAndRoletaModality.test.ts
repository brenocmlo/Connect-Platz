import { describe, it, expect } from "vitest";
import { Role, CorretorStatus, User } from "@prisma/client";
import {
  isAdmin,
  isSuperAdmin,
  isSaleAdmin,
  isRentalAdmin,
  isFinanceiro,
  SALE_ROLES,
  RENT_ROLES,
  getUserModality,
  canManageSaleValues,
} from "@/lib/auth/session";
import { buildLeadRLSWhere, maskLeadSensitiveData } from "@/lib/db/rls";
import { buildScope, NIL_UUID } from "@/app/api/dashboard/_lib/scope";
import { RoundRobinDistributionStrategy } from "@/lib/domain/distribution/RoundRobinDistributionStrategy";

const ORG_ID = "00000000-0000-0000-0000-000000000001";

function makeUser(partial: Partial<User> & { id: string; role: Role }): User {
  return {
    id: partial.id,
    organizationId: ORG_ID,
    nome: partial.nome || partial.id,
    email: `${partial.id}@connectplatz.com.br`,
    passwordHash: "hash",
    role: partial.role,
    telefone: "85999990000",
    creci: null,
    bio: null,
    photoUrl: null,
    status: partial.status || CorretorStatus.DISPONIVEL,
    isActive: partial.isActive ?? true,
    lastLeadAssignedAt: partial.lastLeadAssignedAt ?? null,
    emergencyResetToken: null,
    emergencyResetExpiresAt: null,
    createdAt: partial.createdAt || new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  } as User;
}

describe("Governança RBAC (7 Perfis Oficiais) & Roleta por Modalidade", () => {
  describe("Helpers de Sessão e Segregação dos 7 Perfis (lib/auth/session.ts)", () => {
    it("classifica corretamente os 3 perfis de Administrador (Geral, Venda e Aluguel)", () => {
      expect(isAdmin(Role.ADMINISTRADOR)).toBe(true);
      expect(isAdmin(Role.ADMINISTRADOR_VENDA)).toBe(true);
      expect(isAdmin(Role.ADMINISTRADOR_ALUGUEL)).toBe(true);
      expect(isAdmin(Role.FINANCEIRO_VENDA)).toBe(false);
      expect(isAdmin(Role.CORRETOR_VENDA)).toBe(false);

      expect(isSuperAdmin(Role.ADMINISTRADOR)).toBe(true);
      expect(isSuperAdmin(Role.ADMINISTRADOR_VENDA)).toBe(false);
      expect(isSuperAdmin(Role.ADMINISTRADOR_ALUGUEL)).toBe(false);

      expect(isSaleAdmin(Role.ADMINISTRADOR)).toBe(true);
      expect(isSaleAdmin(Role.ADMINISTRADOR_VENDA)).toBe(true);
      expect(isSaleAdmin(Role.ADMINISTRADOR_ALUGUEL)).toBe(false);

      expect(isRentalAdmin(Role.ADMINISTRADOR)).toBe(true);
      expect(isRentalAdmin(Role.ADMINISTRADOR_ALUGUEL)).toBe(true);
      expect(isRentalAdmin(Role.ADMINISTRADOR_VENDA)).toBe(false);
    });

    it("retorna a modalidade exata de cada um dos 7 perfis", () => {
      expect(getUserModality(Role.ADMINISTRADOR)).toBe("AMBOS");
      expect(getUserModality(Role.ADMINISTRADOR_VENDA)).toBe("VENDA");
      expect(getUserModality(Role.FINANCEIRO_VENDA)).toBe("VENDA");
      expect(getUserModality(Role.CORRETOR_VENDA)).toBe("VENDA");
      expect(getUserModality(Role.ADMINISTRADOR_ALUGUEL)).toBe("ALUGUEL");
      expect(getUserModality(Role.FINANCEIRO_ALUGUEL)).toBe("ALUGUEL");
      expect(getUserModality(Role.CORRETOR_ALUGUEL)).toBe("ALUGUEL");
    });

    it("restringe lançamento/edição de VGV e comissões apenas a Admin Geral, Admin Venda e Financeiro Venda", () => {
      expect(canManageSaleValues(Role.ADMINISTRADOR)).toBe(true);
      expect(canManageSaleValues(Role.ADMINISTRADOR_VENDA)).toBe(true);
      expect(canManageSaleValues(Role.FINANCEIRO_VENDA)).toBe(true);
      expect(canManageSaleValues(Role.CORRETOR_VENDA)).toBe(false);
      expect(canManageSaleValues(Role.ADMINISTRADOR_ALUGUEL)).toBe(false);
      expect(canManageSaleValues(Role.FINANCEIRO_ALUGUEL)).toBe(false);
      expect(canManageSaleValues(Role.CORRETOR_ALUGUEL)).toBe(false);
    });

    it("valida escopo financeiro e de modalidade para os 7 perfis", () => {
      expect(isFinanceiro(Role.FINANCEIRO_VENDA)).toBe(true);
      expect(isFinanceiro(Role.FINANCEIRO_ALUGUEL)).toBe(true);
      expect(isFinanceiro(Role.CORRETOR_VENDA)).toBe(false);
      expect(isFinanceiro(Role.CORRETOR_ALUGUEL)).toBe(false);

      expect(SALE_ROLES.includes(Role.ADMINISTRADOR_VENDA)).toBe(true);
      expect(SALE_ROLES.includes(Role.ADMINISTRADOR_ALUGUEL)).toBe(false);
      expect(RENT_ROLES.includes(Role.ADMINISTRADOR_ALUGUEL)).toBe(true);
      expect(RENT_ROLES.includes(Role.ADMINISTRADOR_VENDA)).toBe(false);
    });
  });

  describe("RLS de Leads e Máscara LGPD (lib/db/rls.ts)", () => {
    it("isola leads por modalidade para ADMINISTRADOR_VENDA e ADMINISTRADOR_ALUGUEL", () => {
      const vendaWhere = buildLeadRLSWhere({
        userId: "u-admin-venda",
        organizationId: ORG_ID,
        role: Role.ADMINISTRADOR_VENDA,
      });
      expect(vendaWhere).toEqual({ organizationId: ORG_ID, modalidade: "VENDA" });

      const aluguelWhere = buildLeadRLSWhere({
        userId: "u-admin-aluguel",
        organizationId: ORG_ID,
        role: Role.ADMINISTRADOR_ALUGUEL,
      });
      expect(aluguelWhere).toEqual({ organizationId: ORG_ID, modalidade: "ALUGUEL" });

      const superWhere = buildLeadRLSWhere({
        userId: "u-super",
        organizationId: ORG_ID,
        role: Role.ADMINISTRADOR,
      });
      expect(superWhere).toEqual({ organizationId: ORG_ID });
    });

    it("mascara telefone e e-mail de leads de terceiros para corretores, mas exibe para gestores da modalidade", () => {
      const leadVenda = {
        id: "lead-1",
        telefone: "85999887766",
        email: "cliente@teste.com",
        corretorId: "corretor-titular",
        modalidade: "VENDA",
      };

      // Outro corretor de venda -> mascarado
      const maskedForOtherBroker = maskLeadSensitiveData(leadVenda, {
        userId: "outro-corretor",
        organizationId: ORG_ID,
        role: Role.CORRETOR_VENDA,
      });
      expect(maskedForOtherBroker.telefone).toBe("(85) 9****-7766");
      expect(maskedForOtherBroker.email).toBe("cl***@teste.com");

      // Admin de Venda -> sem máscara para lead de VENDA
      const unmaskedForSaleAdmin = maskLeadSensitiveData(leadVenda, {
        userId: "admin-venda",
        organizationId: ORG_ID,
        role: Role.ADMINISTRADOR_VENDA,
      });
      expect(unmaskedForSaleAdmin.telefone).toBe("85999887766");

      // Admin de Aluguel tentando ver lead de VENDA -> mascarado
      const maskedForRentAdminOnSale = maskLeadSensitiveData(leadVenda, {
        userId: "admin-aluguel",
        organizationId: ORG_ID,
        role: Role.ADMINISTRADOR_ALUGUEL,
      });
      expect(maskedForRentAdminOnSale.telefone).toBe("(85) 9****-7766");
    });
  });

  describe("Escopo de BI e Dashboard (app/api/dashboard/_lib/scope.ts)", () => {
    it("concede visão gerencial da modalidade para FINANCEIRO_VENDA e ADMINISTRADOR_VENDA", () => {
      const scopeFinVenda = buildScope({
        userId: "fin-v",
        organizationId: ORG_ID,
        role: Role.FINANCEIRO_VENDA,
        email: "finv@connectplatz.com.br",
        nome: "Fin Venda",
      });
      expect(scopeFinVenda.manager).toBe(true);
      expect(scopeFinVenda.lead).toEqual({ modalidade: "VENDA" });
    });

    it("bloqueia vendas de imóveis no escopo de ADMINISTRADOR_ALUGUEL e FINANCEIRO_ALUGUEL", () => {
      const scopeAdminAluguel = buildScope({
        userId: "adm-a",
        organizationId: ORG_ID,
        role: Role.ADMINISTRADOR_ALUGUEL,
        email: "adma@connectplatz.com.br",
        nome: "Adm Aluguel",
      });
      expect(scopeAdminAluguel.manager).toBe(true);
      expect(scopeAdminAluguel.lead).toEqual({ modalidade: "ALUGUEL" });
      expect(scopeAdminAluguel.sale).toHaveProperty("id", NIL_UUID);
    });
  });

  describe("Roleta Round-Robin Segregada por Modalidade (RoundRobinDistributionStrategy)", () => {
    const strategy = new RoundRobinDistributionStrategy();
    const corretorVenda = makeUser({ id: "c-venda", nome: "Corretor Venda", role: Role.CORRETOR_VENDA });
    const corretorAluguel = makeUser({ id: "c-aluguel", nome: "Corretor Aluguel", role: Role.CORRETOR_ALUGUEL });

    it("atribui lead de VENDA exclusivamente para CORRETOR_VENDA", () => {
      const selected = strategy.selectCorretor([corretorAluguel, corretorVenda], "VENDA");
      expect(selected?.id).toBe("c-venda");
    });

    it("atribui lead de ALUGUEL exclusivamente para CORRETOR_ALUGUEL", () => {
      const selected = strategy.selectCorretor([corretorVenda, corretorAluguel], "ALUGUEL");
      expect(selected?.id).toBe("c-aluguel");
    });

    it("retorna null (envia ao Bolsão) se apenas corretores da outra modalidade estiverem online", () => {
      const selected = strategy.selectCorretor([corretorVenda], "ALUGUEL");
      expect(selected).toBeNull();
    });
  });
});
