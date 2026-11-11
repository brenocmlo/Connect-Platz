import { expect, test } from "@playwright/test";
import { ADMIN_EMAIL, cleanupAsAdmin, login, uniquePhone } from "./helpers";

test.describe("E2E — Leads UI (Criação Manual, Kanban/Lista, Drawer, Bolsão e Exclusão)", () => {
  test("Ciclo completo do Lead pela interface do CRM sem deixar rastro", async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    const stamp = Date.now();
    const leadName = `Lead UI ${stamp}`;
    const phone = uniquePhone();
    let leadId = "";

    try {
      await page.goto("/crm/leads");
      await expect(page.getByRole("heading", { name: /^Leads$/i })).toBeVisible({ timeout: 15000 });

      // 1. Abrir modal Novo Lead Manual e criar lead pela UI
      await page.getByRole("button", { name: /Novo Lead/i }).click();
      await expect(page.getByRole("heading", { name: /Novo Lead Manual/i })).toBeVisible();
      await page.getByPlaceholder("Ex: Carlos Eduardo").fill(leadName);
      await page.getByPlaceholder("85999887766").fill(phone);
      await page.getByPlaceholder("carlos@email.com").fill(`ui.lead.${stamp}@teste.com`);
      await page.getByPlaceholder(/Descreva perfil/i).fill("Criado via teste E2E UI.");

      const [createRes] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith("/api/leads") && r.request().method() === "POST"),
        page.getByRole("button", { name: /Cadastrar Lead/i }).click(),
      ]);
      expect(createRes.status(), await createRes.text()).toBe(201);
      const createdBody = await createRes.json();
      leadId = (createdBody.lead ?? createdBody).id;
      expect(leadId).toBeTruthy();

      // 2. Filtrar pelo nome no Kanban e validar exibição no card
      await page.getByPlaceholder(/busque por nome/i).fill(leadName);
      const card = page.getByTestId("lead-card").filter({ hasText: leadName });
      await expect(card).toHaveCount(1, { timeout: 15000 });

      // 3. Alternar para visão Lista e voltar para Kanban
      await page.getByRole("button", { name: /^Lista$/i }).click();
      await expect(page.locator("table tbody tr").filter({ hasText: leadName })).toHaveCount(1);
      await page.getByRole("button", { name: /^Kanban$/i }).click();
      await expect(card).toHaveCount(1);

      // 4. Abrir Prontuário 360° (LeadDrawer) e avançar etapa
      await card.getByRole("heading", { name: leadName }).click();
      await expect(page.getByText(/Prontuário 360°/i)).toBeVisible();

      const advanceBtn = page.getByRole("button", { name: /^Avançar para /i });
      await expect(advanceBtn).toBeVisible();
      await Promise.all([
        page.waitForResponse((r) => r.url().includes(`/api/leads/${leadId}`) && r.request().method() === "PATCH"),
        advanceBtn.click(),
      ]);

      // Conferir Timeline no Drawer
      await page.getByRole("button", { name: /Histórico & Timeline/i }).click();
      await expect(page.getByRole("heading", { name: /Etapa do lead alterada/i })).toBeVisible({ timeout: 10000 });

      // 5. Mover para o Bolsão a partir do Drawer, fechar e assumir pela aba Bolsão
      await Promise.all([
        page.waitForResponse((r) => r.url().includes(`/api/leads/${leadId}`) && r.request().method() === "PATCH"),
        page.getByRole("button", { name: /Mover p\/ Bolsão/i }).click(),
      ]);
      await page.getByRole("button", { name: /Fechar prontuário/i }).click();

      await page.getByRole("button", { name: /Bolsão/i }).first().click();
      const bolsaoCard = page.locator("div.rounded-xl").filter({ hasText: leadName }).filter({ hasText: /Transbordado/i }).first();
      await expect(bolsaoCard).toBeVisible({ timeout: 10000 });

      await Promise.all([
        page.waitForResponse((r) => r.url().includes(`/api/leads/${leadId}`) && r.request().method() === "PATCH"),
        bolsaoCard.getByRole("button", { name: /Assumir Lead do Bolsão/i }).click(),
      ]);

      // Voltar ao Kanban e confirmar que voltou para a carteira
      await page.getByRole("button", { name: /^Kanban$/i }).click();
      await expect(card).toHaveCount(1, { timeout: 10000 });

      // 6. Excluir o lead pelo menu ⋮ do card confirmando o diálogo
      page.once("dialog", (d) => d.accept());
      await card.getByRole("button", { name: /Abrir menu do lead/i }).click();
      const [delRes] = await Promise.all([
        page.waitForResponse((r) => r.url().includes(`/api/leads/${leadId}`) && r.request().method() === "DELETE"),
        page.getByRole("button", { name: /^Excluir$/i }).click(),
      ]);
      expect(delRes.ok()).toBeTruthy();
      await expect(card).toHaveCount(0);

      const checkRes = await page.request.get(`/api/leads/${leadId}`);
      expect(checkRes.status()).toBe(404);
      leadId = "";
    } finally {
      if (leadId) {
        await cleanupAsAdmin(page, { leads: [leadId] });
      }
    }
  });
});
