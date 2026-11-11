import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, CORRETOR_EMAIL, PASSWORD, login, uiLogin } from "./helpers";

test.describe("Autenticação & RBAC — Login UI, Logout e Menu Lateral", () => {
  test("rejeita senha inválida na UI, autentica via UI Login e efetua logout seguro", async ({ page }) => {
    await page.goto("/login");

    // 1. Senha incorreta exibe alerta no formulário
    await page.getByPlaceholder(/seu\.email@connectplatz\.com\.br/i).fill(ADMIN_EMAIL);
    await page.getByPlaceholder(/••••••••/i).fill("SenhaIncorreta999!");
    await page.getByRole("button", { name: /Entrar no Sistema/i }).click();
    await expect(page.getByText(/incorret|inválid|falha/i).first()).toBeVisible({ timeout: 10000 });

    // 2. Fluxo Esqueci minha senha (ForgotPasswordModal sem alterar usuários reais)
    await page.getByRole("button", { name: /Esqueci minha senha/i }).click();
    await expect(page.getByText(/Redefinição Emergencial/i)).toBeVisible();
    await page.locator('form input[type="email"]').last().fill("e2e.recuperacao@connectplatz.com.br");
    await page.getByRole("button", { name: /Gerar Código Emergencial/i }).click();
    await expect(page.getByText(/Código Emergencial \(6 dígitos\)/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /^Fechar$/i }).click();
    await expect(page.getByText(/Redefinição Emergencial/i)).toHaveCount(0);

    // 3. Login válido via UI redireciona para /crm
    await uiLogin(page, ADMIN_EMAIL, PASSWORD);
    await expect(page).toHaveURL(/\/crm/);

    // 4. Logout via ?logout=1 limpa sessão e bloqueia /crm
    await page.goto("/login?logout=1");
    await expect(page.getByRole("button", { name: /Entrar no Sistema/i })).toBeVisible({ timeout: 10000 });
    await page.goto("/crm");
    await expect(page).toHaveURL(/\/login/);
  });

  test("corretor não deve visualizar itens administrativos ou financeiros no menu", async ({ page }) => {
    await login(page, CORRETOR_EMAIL);
    await page.goto("/crm");
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside nav");
    await expect(sidebar.getByText(/^Leads/i).first()).toBeVisible({ timeout: 10000 });
    await expect(sidebar.getByText(/Fluxo de Caixa/i)).toHaveCount(0);
    await expect(sidebar.getByText(/^Equipe$/i)).toHaveCount(0);
    await expect(sidebar.getByText(/Integrações/i)).toHaveCount(0);
    await expect(sidebar.getByText(/Log e Auditoria/i)).toHaveCount(0);
    await expect(sidebar.getByText(/Locações e Temporada/i)).toHaveCount(0);
    await expect(sidebar.getByText(/Administração/i)).toHaveCount(0);
  });

  test("administrador deve visualizar visão completa de gestão no menu", async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto("/crm");
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside nav");
    await expect(sidebar.getByText(/Vendas e Comissões/i).first()).toBeVisible({ timeout: 10000 });
    await expect(sidebar.getByText(/Locações e Temporada/i).first()).toBeVisible();
    await expect(sidebar.getByText(/Fluxo de Caixa/i).first()).toBeVisible();
    await expect(sidebar.getByText(/^Equipe$/i).first()).toBeVisible();
    await expect(sidebar.getByText(/Log e Auditoria/i).first()).toBeVisible();
    await expect(sidebar.getByText(/Configurações/i).first()).toBeVisible();
  });
});
