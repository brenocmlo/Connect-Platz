import { expect, test } from "@playwright/test";
import { cleanupAsAdmin, uniquePhone } from "./helpers";

test.describe("E2E — Portal Público, Captação de Lead, Simulador & Páginas SEO", () => {
  test("Vitrine, chips de modalidade, modal de detalhes e captação via formulário público", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const guestName = `Portal E2E ${Date.now()}`;
    const guestPhone = uniquePhone();
    let capturedLeadId = "";

    try {
      await page.goto("/");
      await expect(page.getByRole("heading", { name: /IMÓVEIS EM DESTAQUE/i })).toBeVisible({ timeout: 15000 });

      // Chips de filtro de modalidade
      const vitrine = page.locator("#vitrine");
      for (const chipLabel of ["Venda", "Temporada", "Todos"]) {
        const chip = vitrine.getByRole("button", { name: chipLabel, exact: true });
        await chip.click();
        await expect(chip).toHaveAttribute("aria-pressed", "true");
      }

      // Alternar carrossel <-> grade
      const toggleGrid = vitrine.getByRole("button", { name: /Ver todos os imóveis/i });
      if ((await toggleGrid.count()) > 0) {
        await toggleGrid.click();
        await expect(vitrine.getByRole("button", { name: /Voltar ao carrossel/i })).toBeVisible();
        await vitrine.getByRole("button", { name: /Voltar ao carrossel/i }).click();
      }

      // Abrir primeiro imóvel no PortalContactModal
      const firstCardBtn = vitrine.locator('button[aria-label^="Ver detalhes de "]').first();
      await firstCardBtn.click();

      // Navegar pelas 3 abas do modal do portal
      await expect(page.getByRole("button", { name: /Sobre o Imóvel & Lazer/i })).toBeVisible();
      await page.getByRole("button", { name: /Localização & Mapa/i }).click();
      await page.getByRole("button", { name: /Falar com o Corretor/i }).click();

      // Preencher formulário de captação pública e validar POST /api/leads/public
      await page.locator("#lead-nome").fill(guestName);
      await page.locator("#lead-tel").fill(guestPhone);
      await page.locator("#lead-email").fill(`portal.e2e.${Date.now()}@teste.com`);
      await page.locator("#lead-msg").fill("Interesse validado em teste E2E automatizado.");

      const [publicRes] = await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/leads/public") && r.request().method() === "POST"),
        page.getByRole("button", { name: /Enviar Interesse/i }).click(),
      ]);
      expect(publicRes.ok(), await publicRes.text()).toBeTruthy();
      const publicData = await publicRes.json();
      capturedLeadId = publicData.leadId || "";
      expect(capturedLeadId).toBeTruthy();

      const statusBox = page.locator('[role="status"]').filter({ hasText: /Solicitação registrada com sucesso/i });
      await expect(statusBox).toBeVisible();
      await expect(statusBox.locator('a[href^="https://wa.me/55"]')).toBeVisible();

      expect(errors).toEqual([]);
    } finally {
      if (capturedLeadId) {
        await cleanupAsAdmin(page, { leads: [capturedLeadId] });
      }
    }
  });

  test("Simulador de Crédito recalcula valores, alerta entrada < 20% e aprova >= 20%", async ({ page }) => {
    await page.goto("/#simulador");
    const sim = page.locator("#simulador");
    await expect(sim.getByRole("heading", { name: /Simule seu crédito imobiliário/i })).toBeVisible();

    await page.locator("#sim-valor").fill("1000000");
    await page.locator("#sim-renda").fill("20000");
    await page.locator("#sim-entrada").fill("100000"); // 10% -> alerta < 20%

    await expect(sim.locator('[role="status"]')).toContainText(/entrada mínima de 20%/i);

    await page.locator("#sim-entrada").fill("300000"); // 30%
    await page.locator("#sim-renda").fill("50000");
    await expect(sim.locator('[role="status"]')).toContainText(/parcela cabe nos 30%/i);
  });

  test("Página SEO /imoveis/[slug] e redirecionamento /espelho/[slug] funcionam corretamente", async ({ page }) => {
    const res = await page.goto("/imoveis/edificio-platinum-meireles");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /Edifício Platinum Meireles/i })).toBeVisible();
    const ldScripts = page.locator('script[type="application/ld+json"]');
    expect(await ldScripts.count()).toBeGreaterThanOrEqual(1);
    const ldContents = await ldScripts.allTextContents();
    expect(ldContents.some((c) => c.includes("Edifício Platinum Meireles"))).toBeTruthy();

    await page.goto("/espelho/edificio-platinum-meireles");
    await expect(page).toHaveURL(/\/imoveis\/edificio-platinum-meireles/);
  });
});
