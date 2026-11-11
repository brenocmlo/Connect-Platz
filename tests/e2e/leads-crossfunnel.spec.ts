import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, cleanupAsAdmin, createLead, getFunnels, login } from "./helpers";

test.describe("Leads — Descoberta e Migração Cross-Funnel", () => {
  test("exibe banner ao buscar lead de outro funil e permite ir para funil ou migrar", async ({ page }) => {
    const createdLeadIds: string[] = [];

    try {
      await login(page, ADMIN_EMAIL);
      const funnels = await getFunnels(page);
      const rentalFunnel = funnels.find((f) => f.modalidade === "ALUGUEL");
      const salesFunnel = funnels.find((f) => f.modalidade === "VENDA");
      expect(rentalFunnel && salesFunnel).toBeTruthy();

      const { id, nome } = await createLead(page, "CrossFunnel", { funnelId: rentalFunnel!.id });
      createdLeadIds.push(id);

      await page.goto("/crm/leads");
      await page.waitForLoadState("networkidle");

      // Busca pelo nome único no funil de Vendas (padrão)
      const searchInput = page.getByPlaceholder(/busque por nome/i);
      await searchInput.fill(nome);

      // Banner exibe exatamente o lead recém-criado e o nome do funil de Locações
      const banner = page.locator(".animate-fadeInUp").filter({ hasText: /encontrados? em outros? funi/i });
      await expect(banner).toBeVisible({ timeout: 12000 });
      await expect(banner.getByText(nome)).toBeVisible();
      await expect(banner.getByText(rentalFunnel!.nome).first()).toBeVisible();

      // 1. "Ir para funil" troca o board para Locações & Temporada e exibe o card (abrindo o Drawer)
      await banner.getByRole("button", { name: /Ir para funil/i }).first().click();
      await expect(page.getByTestId("lead-card").filter({ hasText: nome })).toBeVisible({ timeout: 12000 });
      await page.getByRole("button", { name: /Fechar prontuário/i }).click();

      // 2. Cria um segundo lead em Vendas, busca a partir do funil de Locações e testa "Trazer para cá"
      const second = await createLead(page, "MigrateFunnel", { funnelId: salesFunnel!.id });
      createdLeadIds.push(second.id);

      await searchInput.fill(second.nome);
      await expect(banner).toBeVisible({ timeout: 12000 });
      await expect(banner.getByText(second.nome)).toBeVisible();

      await banner.getByRole("button", { name: /Trazer para cá/i }).first().click();
      await expect(page.getByTestId("lead-card").filter({ hasText: second.nome })).toBeVisible({ timeout: 12000 });
    } finally {
      await cleanupAsAdmin(page, { leads: createdLeadIds });
    }
  });
});
