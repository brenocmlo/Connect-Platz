import { expect, test } from "@playwright/test";
import { login, ROLE_EMAILS } from "./helpers";

test.describe("E2E — Guards de Rota RBAC (Middleware) & Configurações", () => {
  test("Acesso não autenticado a rotas do CRM redireciona para /login com redirect", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/crm/vendas");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcrm%2Fvendas/);
  });

  test("CORRETOR_VENDA e CORRETOR_ALUGUEL são bloqueados de módulos gerenciais e modalidade oposta", async ({ page }) => {
    await login(page, ROLE_EMAILS.CORRETOR_VENDA);
    for (const blocked of [
      "/crm/fluxo-de-caixa",
      "/crm/equipes",
      "/crm/integracoes",
      "/crm/auditoria",
      "/crm/temporada",
    ]) {
      await page.goto(blocked);
      await expect(page, `CORRETOR_VENDA em ${blocked}`).toHaveURL(/\/crm\/leads\?denied=true/);
    }

    await login(page, ROLE_EMAILS.CORRETOR_ALUGUEL);
    for (const blocked of [
      "/crm/fluxo-de-caixa",
      "/crm/equipes",
      "/crm/integracoes",
      "/crm/auditoria",
      "/crm/vendas",
    ]) {
      await page.goto(blocked);
      await expect(page, `CORRETOR_ALUGUEL em ${blocked}`).toHaveURL(/\/crm\/leads\?denied=true/);
    }
  });

  test("FINANCEIRO_VENDA e FINANCEIRO_ALUGUEL têm segregação cruzada e sem auditoria/integrações", async ({ page }) => {
    await login(page, ROLE_EMAILS.FINANCEIRO_VENDA);
    for (const blocked of ["/crm/temporada", "/crm/auditoria", "/crm/integracoes"]) {
      await page.goto(blocked);
      await expect(page, `FINANCEIRO_VENDA em ${blocked}`).toHaveURL(/\/crm\/vendas\?denied=true/);
    }
    await page.goto("/crm/fluxo-de-caixa");
    await expect(page.getByRole("heading", { name: /Fluxo de Caixa/i })).toBeVisible();
    await expect(page.getByText("Time de Vendas")).toBeVisible();

    await login(page, ROLE_EMAILS.FINANCEIRO_ALUGUEL);
    for (const blocked of ["/crm/vendas", "/crm/auditoria", "/crm/integracoes"]) {
      await page.goto(blocked);
      await expect(page, `FINANCEIRO_ALUGUEL em ${blocked}`).toHaveURL(/\/crm\/temporada\?denied=true/);
    }
    await page.goto("/crm/fluxo-de-caixa");
    await expect(page.getByRole("heading", { name: /Fluxo de Caixa/i })).toBeVisible();
    await expect(page.getByText(/Time de Locação & Temporada/i)).toBeVisible();
  });

  test("ADMINISTRADOR_VENDA e ADMINISTRADOR_ALUGUEL são segregados entre Vendas e Temporada", async ({ page }) => {
    await login(page, ROLE_EMAILS.ADMINISTRADOR_VENDA);
    await page.goto("/crm/temporada");
    await expect(page).toHaveURL(/\/crm\/vendas\?denied=true/);

    await login(page, ROLE_EMAILS.ADMINISTRADOR_ALUGUEL);
    await page.goto("/crm/vendas");
    await expect(page).toHaveURL(/\/crm\/temporada\?denied=true/);
  });

  test("Configurações: apenas perfis ADMINISTRADOR* veem abas corporativas (SLA, Score, Dados)", async ({ page }) => {
    await login(page, ROLE_EMAILS.CORRETOR_VENDA);
    await page.goto("/crm/configuracoes");
    await expect(page.getByRole("heading", { name: /Minha Conta/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Minha Conta/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Notificações PWA/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Dados da Imobiliária/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Regras de SLA/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Régua de Score/i })).toHaveCount(0);

    await login(page, ROLE_EMAILS.FINANCEIRO_VENDA);
    await page.goto("/crm/configuracoes");
    await expect(page.getByRole("button", { name: /Dados da Imobiliária/i })).toHaveCount(0);

    await login(page, ROLE_EMAILS.ADMINISTRADOR);
    await page.goto("/crm/configuracoes");
    await expect(page.getByRole("heading", { name: /Configurações do Sistema/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Dados da Imobiliária/i })).toBeVisible();
    await page.getByRole("button", { name: /Regras de SLA/i }).click();
    await expect(page).toHaveURL(/#sla/);
    await page.getByRole("button", { name: /Régua de Score/i }).click();
    await expect(page).toHaveURL(/#score/);
  });
});
