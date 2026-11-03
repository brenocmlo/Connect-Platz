import { test, expect } from "@playwright/test";
import { login, ADMIN_EMAIL, CORRETOR_EMAIL } from "./helpers";

test.describe("Segurança & RBAC — Menu Lateral e Permissões", () => {
  test("corretor não deve visualizar itens administrativos ou financeiros no menu", async ({ page }) => {
    // 1. Login com perfil de Corretor
    await login(page, CORRETOR_EMAIL);
    await page.goto("/crm");
    await page.waitForLoadState("networkidle");

    // 2. Valida ausência estrita de itens restritos no menu lateral
    const sidebar = page.locator("nav");
    await expect(sidebar.getByText(/Fluxo de Caixa/i)).toHaveCount(0);
    await expect(sidebar.getByText(/Equipes/i)).toHaveCount(0);
    await expect(sidebar.getByText(/Integrações/i)).toHaveCount(0);
    await expect(sidebar.getByText(/Administração/i)).toHaveCount(0);
  });

  test("administrador deve visualizar visão completa de gestão", async ({ page }) => {
    // 1. Login com perfil de Administrador
    await login(page, ADMIN_EMAIL);
    await page.goto("/crm");
    await page.waitForLoadState("networkidle");

    // 2. Valida presença dos módulos de gestão corporativa
    const sidebar = page.locator("nav");
    await expect(sidebar.getByText(/Fluxo de Caixa/i).first()).toBeVisible({ timeout: 10000 });
    await expect(sidebar.getByText(/Equipe/i).first()).toBeVisible();
    await expect(sidebar.getByText(/Configurações/i).first()).toBeVisible();
  });
});
