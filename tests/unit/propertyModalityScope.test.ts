import { describe, it, expect } from "vitest";
import {
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
});
