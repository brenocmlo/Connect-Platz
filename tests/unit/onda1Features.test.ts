import { describe, it, expect } from "vitest";
import { Role } from "@prisma/client";
import {
  isAdmin,
  isSuperAdmin,
  isSaleAdmin,
  isRentalAdmin,
  canManageSaleValues,
  canManageRentalValues,
  getUserModality,
} from "@/lib/auth/session";
import { buildLeadRLSWhere } from "@/lib/db/rls";

describe("Onda 1: Segregação de Perfis de Administrador e RBAC", () => {
  it("deve identificar corretamente os administradores segregados e superadmin", () => {
    expect(isAdmin(Role.ADMINISTRADOR)).toBe(true);
    expect(isAdmin(Role.ADMINISTRADOR_VENDA)).toBe(true);
    expect(isAdmin(Role.ADMINISTRADOR_ALUGUEL)).toBe(true);
    expect(isAdmin(Role.CORRETOR_VENDA)).toBe(false);

    expect(isSuperAdmin(Role.ADMINISTRADOR)).toBe(true);
    expect(isSuperAdmin(Role.ADMINISTRADOR_VENDA)).toBe(false);
    expect(isSuperAdmin(Role.ADMINISTRADOR_ALUGUEL)).toBe(false);
  });

  it("deve permitir gestão de venda somente para perfis autorizados de venda", () => {
    expect(isSaleAdmin(Role.ADMINISTRADOR)).toBe(true);
    expect(isSaleAdmin(Role.ADMINISTRADOR_VENDA)).toBe(true);
    expect(isSaleAdmin(Role.ADMINISTRADOR_ALUGUEL)).toBe(false);

    expect(canManageSaleValues(Role.ADMINISTRADOR)).toBe(true);
    expect(canManageSaleValues(Role.ADMINISTRADOR_VENDA)).toBe(true);
    expect(canManageSaleValues(Role.FINANCEIRO_VENDA)).toBe(true);
    expect(canManageSaleValues(Role.ADMINISTRADOR_ALUGUEL)).toBe(false);
    expect(canManageSaleValues(Role.FINANCEIRO_ALUGUEL)).toBe(false);
    expect(canManageSaleValues(Role.CORRETOR_VENDA)).toBe(false);
  });

  it("deve permitir gestão de aluguel somente para perfis autorizados de aluguel", () => {
    expect(isRentalAdmin(Role.ADMINISTRADOR)).toBe(true);
    expect(isRentalAdmin(Role.ADMINISTRADOR_ALUGUEL)).toBe(true);
    expect(isRentalAdmin(Role.ADMINISTRADOR_VENDA)).toBe(false);

    expect(canManageRentalValues(Role.ADMINISTRADOR)).toBe(true);
    expect(canManageRentalValues(Role.ADMINISTRADOR_ALUGUEL)).toBe(true);
    expect(canManageRentalValues(Role.FINANCEIRO_ALUGUEL)).toBe(true);
    expect(canManageRentalValues(Role.ADMINISTRADOR_VENDA)).toBe(false);
    expect(canManageRentalValues(Role.FINANCEIRO_VENDA)).toBe(false);
    expect(canManageRentalValues(Role.CORRETOR_ALUGUEL)).toBe(false);
  });

  it("deve resolver a modalidade do usuário de acordo com a segregação de negócio", () => {
    expect(getUserModality(Role.ADMINISTRADOR)).toBe("AMBOS");
    expect(getUserModality(Role.ADMINISTRADOR_VENDA)).toBe("VENDA");
    expect(getUserModality(Role.FINANCEIRO_VENDA)).toBe("VENDA");
    expect(getUserModality(Role.CORRETOR_VENDA)).toBe("VENDA");
    expect(getUserModality(Role.ADMINISTRADOR_ALUGUEL)).toBe("ALUGUEL");
    expect(getUserModality(Role.FINANCEIRO_ALUGUEL)).toBe("ALUGUEL");
    expect(getUserModality(Role.CORRETOR_ALUGUEL)).toBe("ALUGUEL");
  });

  it("deve construir cláusula RLS correta para cada perfil na consulta de leads", () => {
    const orgId = "00000000-0000-0000-0000-000000000001";
    const userId = "00000000-0000-0000-0000-000000000002";

    const whereAdminVenda = buildLeadRLSWhere({
      organizationId: orgId,
      userId,
      role: Role.ADMINISTRADOR_VENDA,
    });
    expect(whereAdminVenda).toEqual({ organizationId: orgId, modalidade: "VENDA" });

    const whereAdminAluguel = buildLeadRLSWhere({
      organizationId: orgId,
      userId,
      role: Role.ADMINISTRADOR_ALUGUEL,
    });
    expect(whereAdminAluguel).toEqual({ organizationId: orgId, modalidade: "ALUGUEL" });

    const whereSuperAdmin = buildLeadRLSWhere({
      organizationId: orgId,
      userId,
      role: Role.ADMINISTRADOR,
    });
    expect(whereSuperAdmin).toEqual({ organizationId: orgId });
  });
});
