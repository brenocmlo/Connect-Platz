import { describe, it, expect } from "vitest";
import {
  canDeletePropertyForRole,
  canEditPropertyForRole,
  getAllowedPropertyModalities,
  getDefaultPropertyModalidade,
  getModalityScopeErrorMessage,
  isModalidadeAllowedForRole,
  isPropertyVisibleToRole,
  resolveRoleModalityGroup,
} from "@/lib/domain/properties/modalityScope";

describe("Escopo de modalidades de imóveis por perfil (modalityScope)", () => {
  it("resolve a vertical operacional de cada perfil sem dependências de servidor", () => {
    expect(resolveRoleModalityGroup("ADMINISTRADOR")).toBe("AMBOS");
    expect(resolveRoleModalityGroup(undefined)).toBe("AMBOS");
    expect(resolveRoleModalityGroup("ADMINISTRADOR_VENDA")).toBe("VENDA");
    expect(resolveRoleModalityGroup("FINANCEIRO_VENDA")).toBe("VENDA");
    expect(resolveRoleModalityGroup("CORRETOR_VENDA")).toBe("VENDA");
    expect(resolveRoleModalityGroup("ADMINISTRADOR_ALUGUEL")).toBe("ALUGUEL");
    expect(resolveRoleModalityGroup("FINANCEIRO_ALUGUEL")).toBe("ALUGUEL");
    expect(resolveRoleModalityGroup("CORRETOR_ALUGUEL")).toBe("ALUGUEL");
  });

  it("define modalidade inicial correta ao abrir o cadastro de imóvel", () => {
    expect(getDefaultPropertyModalidade("ADMINISTRADOR_ALUGUEL")).toBe("VERANEIO_TEMPORADA");
    expect(getDefaultPropertyModalidade("ADMINISTRADOR_VENDA")).toBe("VENDA");
    expect(getDefaultPropertyModalidade("ADMINISTRADOR")).toBe("VENDA");
  });

  it("restringe opções de cadastro para ADMINISTRADOR_ALUGUEL a temporada e locação", () => {
    const empOpts = getAllowedPropertyModalities("ADMINISTRADOR_ALUGUEL", true).map((o) => o.value);
    expect(empOpts).toEqual(["VERANEIO_TEMPORADA", "LOCACAO_ANUAL"]);

    expect(isModalidadeAllowedForRole("VERANEIO_TEMPORADA", "ADMINISTRADOR_ALUGUEL", true)).toBe(true);
    expect(isModalidadeAllowedForRole("LOCACAO_ANUAL", "ADMINISTRADOR_ALUGUEL", true)).toBe(true);
    expect(isModalidadeAllowedForRole("VENDA", "ADMINISTRADOR_ALUGUEL", true)).toBe(false);
    expect(isModalidadeAllowedForRole("REPASSE", "ADMINISTRADOR_ALUGUEL", true)).toBe(false);
    expect(isModalidadeAllowedForRole("AMBOS", "ADMINISTRADOR_ALUGUEL", true)).toBe(false);
    expect(getModalityScopeErrorMessage("ADMINISTRADOR_ALUGUEL")).toContain("temporada ou locação");
  });

  it("restringe opções de cadastro para ADMINISTRADOR_VENDA a venda e repasse", () => {
    const opts = getAllowedPropertyModalities("ADMINISTRADOR_VENDA", true).map((o) => o.value);
    expect(opts).toEqual(["VENDA", "REPASSE"]);

    expect(isModalidadeAllowedForRole("VENDA", "ADMINISTRADOR_VENDA", true)).toBe(true);
    expect(isModalidadeAllowedForRole("REPASSE", "ADMINISTRADOR_VENDA", true)).toBe(true);
    expect(isModalidadeAllowedForRole("LOCACAO_ANUAL", "ADMINISTRADOR_VENDA", true)).toBe(false);
    expect(isModalidadeAllowedForRole("VERANEIO_TEMPORADA", "ADMINISTRADOR_VENDA", true)).toBe(false);
    expect(isModalidadeAllowedForRole("AMBOS", "ADMINISTRADOR_VENDA", true)).toBe(false);
    expect(getModalityScopeErrorMessage("ADMINISTRADOR_VENDA")).toContain("venda ou repasse");
  });

  it("libera todas as opções para ADMINISTRADOR geral (com ou sem AMBOS)", () => {
    const empOpts = getAllowedPropertyModalities("ADMINISTRADOR", true).map((o) => o.value);
    const avulsoOpts = getAllowedPropertyModalities("ADMINISTRADOR", false).map((o) => o.value);

    expect(empOpts).toEqual(["VENDA", "LOCACAO_ANUAL", "VERANEIO_TEMPORADA", "REPASSE", "AMBOS"]);
    expect(avulsoOpts).toEqual(["VENDA", "LOCACAO_ANUAL", "VERANEIO_TEMPORADA", "REPASSE"]);
    expect(isModalidadeAllowedForRole("AMBOS", "ADMINISTRADOR", true)).toBe(true);
    expect(isModalidadeAllowedForRole("AMBOS", "ADMINISTRADOR", false)).toBe(false);
  });

  it("espelha visibilidade de carteira incluindo imóveis AMBOS para ambas as verticais", () => {
    expect(isPropertyVisibleToRole("VERANEIO_TEMPORADA", "ADMINISTRADOR_ALUGUEL")).toBe(true);
    expect(isPropertyVisibleToRole("LOCACAO_ANUAL", "ADMINISTRADOR_ALUGUEL")).toBe(true);
    expect(isPropertyVisibleToRole("AMBOS", "ADMINISTRADOR_ALUGUEL")).toBe(true);
    expect(isPropertyVisibleToRole("VENDA", "ADMINISTRADOR_ALUGUEL")).toBe(false);
    expect(isPropertyVisibleToRole("REPASSE", "ADMINISTRADOR_ALUGUEL")).toBe(false);

    expect(isPropertyVisibleToRole("VENDA", "ADMINISTRADOR_VENDA")).toBe(true);
    expect(isPropertyVisibleToRole("REPASSE", "ADMINISTRADOR_VENDA")).toBe(true);
    expect(isPropertyVisibleToRole("AMBOS", "ADMINISTRADOR_VENDA")).toBe(true);
    expect(isPropertyVisibleToRole("LOCACAO_ANUAL", "ADMINISTRADOR_VENDA")).toBe(false);
  });

  it("permite que Admin Venda e Admin Aluguel editem e apaguem imóveis relacionados aos seus tipos e bloqueia outros perfis", () => {
    // Admin Venda -> VENDA, REPASSE e AMBOS permitidos; Aluguel/Temporada negados
    expect(canEditPropertyForRole("VENDA", "ADMINISTRADOR_VENDA")).toBe(true);
    expect(canDeletePropertyForRole("VENDA", "ADMINISTRADOR_VENDA")).toBe(true);
    expect(canDeletePropertyForRole("REPASSE", "ADMINISTRADOR_VENDA")).toBe(true);
    expect(canDeletePropertyForRole("AMBOS", "ADMINISTRADOR_VENDA")).toBe(true);
    expect(canEditPropertyForRole("VERANEIO_TEMPORADA", "ADMINISTRADOR_VENDA")).toBe(false);
    expect(canDeletePropertyForRole("VERANEIO_TEMPORADA", "ADMINISTRADOR_VENDA")).toBe(false);
    expect(canDeletePropertyForRole("LOCACAO_ANUAL", "ADMINISTRADOR_VENDA")).toBe(false);

    // Admin Aluguel -> VERANEIO_TEMPORADA, VERANEIO, LOCACAO_ANUAL e AMBOS permitidos; Venda/Repasse negados
    expect(canEditPropertyForRole("VERANEIO_TEMPORADA", "ADMINISTRADOR_ALUGUEL")).toBe(true);
    expect(canDeletePropertyForRole("VERANEIO_TEMPORADA", "ADMINISTRADOR_ALUGUEL")).toBe(true);
    expect(canDeletePropertyForRole("VERANEIO", "ADMINISTRADOR_ALUGUEL")).toBe(true);
    expect(canDeletePropertyForRole("LOCACAO_ANUAL", "ADMINISTRADOR_ALUGUEL")).toBe(true);
    expect(canDeletePropertyForRole("AMBOS", "ADMINISTRADOR_ALUGUEL")).toBe(true);
    expect(canEditPropertyForRole("VENDA", "ADMINISTRADOR_ALUGUEL")).toBe(false);
    expect(canDeletePropertyForRole("VENDA", "ADMINISTRADOR_ALUGUEL")).toBe(false);
    expect(canDeletePropertyForRole("REPASSE", "ADMINISTRADOR_ALUGUEL")).toBe(false);

    // Admin Geral -> todas
    expect(canDeletePropertyForRole("VENDA", "ADMINISTRADOR")).toBe(true);
    expect(canDeletePropertyForRole("VERANEIO_TEMPORADA", "ADMINISTRADOR")).toBe(true);

    // Financeiro / Corretores nunca podem editar ou apagar catálogo
    for (const nonAdmin of ["CORRETOR_VENDA", "CORRETOR_ALUGUEL", "FINANCEIRO_VENDA", "FINANCEIRO_ALUGUEL", null]) {
      expect(canEditPropertyForRole("VENDA", nonAdmin)).toBe(false);
      expect(canDeletePropertyForRole("VENDA", nonAdmin)).toBe(false);
      expect(canDeletePropertyForRole("VERANEIO_TEMPORADA", nonAdmin)).toBe(false);
    }
  });
});
