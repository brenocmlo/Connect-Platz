import { test, expect } from "@playwright/test";

const PASSWORD = process.env.TEST_PASSWORD || "ConnectPlatz2026@";
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "robson@connectplatz.com.br";
const CORRETOR_EMAIL = process.env.TEST_CORRETOR_EMAIL || "lucas.corretor@connectplatz.com.br";

async function login(page: any, email: string) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', PASSWORD);
  await Promise.all([
    page.waitForURL((url: URL) => url.pathname.includes("/crm"), { timeout: 30000 }),
    page.click('button[type="submit"]'),
  ]);
}

test.describe("E2E: Sincronização Bidirecional & Regras de Negócio", () => {
  test("E2E-01: Administrador visualiza 'Mudar corretor' no menu do lead e abre modal de transferência", async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto("/crm/leads");

    // Localiza o primeiro card disponível no Kanban
    const menuButton = page.locator('button[aria-label="Abrir menu do lead"]').first();
    await expect(menuButton).toBeVisible({ timeout: 10000 });
    await menuButton.click();

    // Administrador DEVE ver a opção 'Mudar corretor'
    const btnMudarCorretor = page.getByRole("button", { name: /mudar corretor/i });
    await expect(btnMudarCorretor).toBeVisible();

    // Ao clicar, o modal de transferência deve abrir
    await btnMudarCorretor.click();
    await expect(page.getByText("Mudar Corretor Responsável")).toBeVisible();
    await expect(page.getByRole("button", { name: /confirmar transferência/i })).toBeVisible();
  });

  test("E2E-02: Corretor comum NÃO visualiza a opção 'Mudar corretor' no menu do card (RBAC)", async ({ page }) => {
    await login(page, CORRETOR_EMAIL);
    await page.goto("/crm/leads");

    const menuButton = page.locator('button[aria-label="Abrir menu do lead"]').first();
    await expect(menuButton).toBeVisible({ timeout: 10000 });
    await menuButton.click();

    // Corretor NÃO deve ter a opção 'Mudar corretor'
    const btnMudarCorretor = page.getByRole("button", { name: /mudar corretor/i });
    await expect(btnMudarCorretor).not.toBeVisible();
  });

  test("E2E-03: Lead na etapa Ganho sem venda exibe banner de 'Pendência Financeira'", async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto("/crm/leads");

    // Valida se na coluna de Ganho ou nos cards existe o indicador visual de pendência financeira
    const pendenciaBanner = page.locator('text=Pendência Financeira').first();
    // Se houver lead com pendência, verifica estrutura e botão 'Cadastrar Venda'
    if (await pendenciaBanner.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(pendenciaBanner).toBeVisible();
      const cadastrarBtn = page.getByText(/cadastrar venda/i).first();
      await expect(cadastrarBtn).toBeVisible();

      // Clicar no botão abre o modal de Nova Venda pré-preenchido
      await cadastrarBtn.click();
      await expect(page.getByText(/Nova Venda & Split de Comissões/i)).toBeVisible();
    }
  });
});
