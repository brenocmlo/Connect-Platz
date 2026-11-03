import { test, expect } from "@playwright/test";
import { login, ADMIN_EMAIL } from "./helpers";

test.describe("Leads — Descoberta e Migração Cross-Funnel", () => {
  test("deve exibir banner de descoberta ao buscar lead que pertence a outro funil", async ({ page }) => {
    // 1. Autentica como Administrador
    await login(page, ADMIN_EMAIL);

    // 2. Acessa o Kanban de Leads (carrega por padrão o Funil de Vendas Imobiliárias)
    await page.goto("/crm/leads");
    await page.waitForLoadState("networkidle");

    // 3. Digita "pedro" no campo de busca com debounce
    const searchInput = page.getByPlaceholder(/busque por nome/i);
    await searchInput.fill("pedro");

    // 4. Aguarda a detecção paralela cross-funnel e exibição do banner
    const banner = page.locator(".animate-fadeInUp").filter({ hasText: /encontrados? em outros? funi/i });
    await expect(banner).toBeVisible({ timeout: 10000 });

    // 5. Valida menção ao funil de destino dentro do banner
    await expect(banner.getByText(/Funil de Locações & Temporada/i).first()).toBeVisible();
    await expect(banner.getByRole("button", { name: /Ir para funil/i }).first()).toBeVisible();

    // 6. Clica em "Ir para funil"
    await banner.getByRole("button", { name: /Ir para funil/i }).last().click();

    // 7. Valida que o funil mudou e o card do Pedro aparece na tela
    await expect(page.getByText(/Pedro cifoni/i).first()).toBeVisible({ timeout: 10000 });
  });
});
