import { expect, test } from "@playwright/test";
import { ADMIN_EMAIL, cleanupAsAdmin, createLead, login } from "./helpers";

test.describe("E2E — Agenda UI (Agendamento, Todos/Dia, Desfecho de Visita & Exclusão)", () => {
  test("Cria compromisso pelo modal, registra desfecho CONCLUIDO, persiste após reload e exclui", async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    const lead = await createLead(page, "AgendaUI");
    let appointmentId = "";

    try {
      await page.goto("/crm/agenda");
      await expect(page.getByRole("heading", { name: /^Agenda$/i })).toBeVisible({ timeout: 15000 });

      // 1. Abrir modal "+ Novo" e preencher compromisso vinculado ao lead E2E
      await page.getByRole("button", { name: /Novo/i }).click();
      await expect(page.getByRole("heading", { name: /Novo Compromisso/i })).toBeVisible();

      const leadCombo = page.getByPlaceholder("Busque por nome ou telefone...");
      await leadCombo.click();
      await leadCombo.fill(lead.nome);
      await page.locator('[role="listbox"] [role="option"]').filter({ hasText: lead.nome }).first().click();

      const propCombo = page.getByPlaceholder("Busque o empreendimento...");
      await propCombo.click();
      await page.locator('[role="listbox"] [role="option"]').first().click();

      await page.getByPlaceholder(/Detalhes da apresentação/i).fill("Visita agendada via E2E Agenda UI.");

      const [createRes] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith("/api/agenda") && r.request().method() === "POST"),
        page.getByRole("button", { name: /^Agendar$/i }).click(),
      ]);
      expect(createRes.status(), await createRes.text()).toBe(201);
      const created = await createRes.json();
      appointmentId = (created.appointment ?? created).id;
      expect(appointmentId).toBeTruthy();

      // 2. Alternar para visão "Todos", filtrar pelo nome do lead e abrir Parecer
      await page.getByRole("button", { name: /^Todos$/i }).click();
      await page.getByPlaceholder(/Buscar por título, lead ou imóvel/i).fill(lead.nome);

      const todosRow = page.locator("div.rounded-xl").filter({ hasText: lead.nome }).filter({ hasText: /Registrar Parecer/i }).first();
      await expect(todosRow).toBeVisible({ timeout: 10000 });
      await todosRow.getByRole("button", { name: /Registrar Parecer/i }).click();

      // 3. Registrar desfecho da visita (CONCLUIDO)
      await expect(page.getByRole("heading", { name: /Registrar Parecer do Cliente/i })).toBeVisible();
      await page.getByPlaceholder(/O cliente adorou a vista/i).fill("Cliente aprovou o imóvel no E2E.");
      await Promise.all([
        page.waitForResponse((r) => r.url().includes(`/api/agenda/${appointmentId}`) && r.request().method() === "PATCH"),
        page.getByRole("button", { name: /Salvar Desfecho/i }).click(),
      ]);

      await expect(page.locator("div.rounded-xl").filter({ hasText: lead.nome }).filter({ hasText: /Concluído/i }).first()).toBeVisible();

      // 4. Reload e verificação de persistência na visão "Dia" (hoje) com "Desfecho Registrado:"
      await page.reload();
      await page.getByRole("button", { name: /^Dia$/i }).click();
      const dayCard = page.locator("div.rounded-xl").filter({ hasText: lead.nome }).filter({ hasText: /Desfecho Registrado:/i }).first();
      await expect(dayCard).toBeVisible({ timeout: 10000 });
      await expect(dayCard).toContainText(/Cliente aprovou o imóvel no E2E\./i);

      // 5. Excluir compromisso pelo botão de lixeira
      page.once("dialog", (d) => d.accept());
      const [delRes] = await Promise.all([
        page.waitForResponse((r) => r.url().includes(`/api/agenda/${appointmentId}`) && r.request().method() === "DELETE"),
        dayCard.locator('button[title="Excluir compromisso"]').click(),
      ]);
      expect(delRes.ok()).toBeTruthy();
      appointmentId = "";
    } finally {
      await cleanupAsAdmin(page, {
        appointments: appointmentId ? [appointmentId] : [],
        leads: [lead.id],
      });
    }
  });
});
