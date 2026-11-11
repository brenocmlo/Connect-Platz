import { expect, test } from "@playwright/test";
import { cleanupAsAdmin, createLead, getFunnels, login, ROLE_EMAILS } from "./helpers";
import { deleteLeadWithRelationsById, deleteRentalContractById } from "./cleanup";

test.describe("E2E — Temporada Overbooking UI & Locação Anual (Aprovação Corretor → Financeiro)", () => {
  test("Reserva temporada, bloqueia overbooking com erro [role=alert] visível e cancela para Histórico", async ({ page }) => {
    await login(page, ROLE_EMAILS.ADMINISTRADOR_ALUGUEL);
    const funnels = await getFunnels(page);
    const rentalFunnel = funnels.find((f) => f.modalidade === "ALUGUEL") ?? funnels[0];
    const guestLead = await createLead(page, "TempGuest", { funnelId: rentalFunnel.id });
    let bookingId = "";

    try {
      await page.goto("/crm/temporada");
      await expect(page.getByRole("heading", { name: /Gestão de Aluguel & Temporada/i })).toBeVisible({ timeout: 15000 });

      // 1. Criar reserva válida em datas futuras isoladas (2028-03-10 a 2028-03-15)
      await page.getByRole("button", { name: /Nova Reserva/i }).click();
      await expect(page.getByRole("heading", { name: /Nova Reserva com Bloqueio de Calendário/i })).toBeVisible();

      const modal = page.locator("form").filter({ hasText: /Confirmar Reserva & Bloquear/i });
      const propSelect = modal.locator("select").filter({ has: page.locator("option", { hasText: /Selecione o imóvel/i }) });
      const leadSelect = modal.locator("select").filter({ has: page.locator("option", { hasText: /Selecione um lead/i }) });

      const villaVal = await propSelect.locator("option", { hasText: "Villa Platz Beach Residence" }).getAttribute("value");
      expect(villaVal).toBeTruthy();
      await propSelect.selectOption(villaVal!);
      await leadSelect.selectOption(guestLead.id);

      const dateInputs = modal.locator('input[type="date"]');
      await dateInputs.nth(0).fill("2028-03-10");
      await dateInputs.nth(1).fill("2028-03-15");

      const [bookRes] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith("/api/bookings") && r.request().method() === "POST"),
        modal.getByRole("button", { name: /Confirmar Reserva & Bloquear/i }).click(),
      ]);
      expect(bookRes.status(), await bookRes.text()).toBe(201);
      bookingId = (await bookRes.json()).booking?.id || "";
      expect(bookingId).toBeTruthy();

      // 2. Tentar reservar período conflitante -> HTTP 409 e alerta visível mantendo modal aberto
      await page.getByRole("button", { name: /Nova Reserva/i }).click();
      await expect(modal).toBeVisible();
      await propSelect.selectOption(villaVal!);
      await leadSelect.selectOption(guestLead.id);
      await dateInputs.nth(0).fill("2028-03-12");
      await dateInputs.nth(1).fill("2028-03-14");

      const [conflictRes] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith("/api/bookings") && r.request().method() === "POST"),
        modal.getByRole("button", { name: /Confirmar Reserva & Bloquear/i }).click(),
      ]);
      expect(conflictRes.status()).toBe(409);

      await expect(page.getByRole("alert").filter({ hasText: /Overbooking|Choque/i })).toBeVisible();
      await expect(modal).toBeVisible();
      await page.getByRole("button", { name: /^Fechar$/i }).click();

      // 3. Cancelar primeira reserva via EditBookingModal e verificar na aba Histórico
      const bookingCard = page.locator("div.rounded-xl").filter({ hasText: guestLead.nome }).first();
      await expect(bookingCard).toBeVisible();
      await bookingCard.locator('button[title="Editar check-in / diárias"]').click();

      await page.getByRole("button", { name: "Cancelada", exact: true }).click();
      await Promise.all([
        page.waitForResponse((r) => r.url().includes(`/api/bookings/${bookingId}`) && r.request().method() === "PATCH"),
        page.getByRole("button", { name: /Salvar Alterações/i }).click(),
      ]);

      await page.getByRole("button", { name: /Histórico Overbooking & Canceladas/i }).click();
      await expect(page.getByText(guestLead.nome).first()).toBeVisible();
    } finally {
      await cleanupAsAdmin(page, { bookings: bookingId ? [bookingId] : [] });
      await deleteLeadWithRelationsById(guestLead.id);
    }
  });

  test("CORRETOR_ALUGUEL cria contrato PENDENTE VALIDAÇÃO e FINANCEIRO_ALUGUEL aprova para ATIVO", async ({ page }) => {
    await login(page, ROLE_EMAILS.CORRETOR_ALUGUEL);
    const funnels = await getFunnels(page);
    const rentalFunnel = funnels.find((f) => f.modalidade === "ALUGUEL") ?? funnels[0];
    const tenantLead = await createLead(page, "LocatarioE2E", { funnelId: rentalFunnel.id });
    let contractId = "";

    try {
      await page.goto("/crm/temporada");
      await page.getByRole("button", { name: /Locação Anual \/ Comum/i }).click();
      await page.getByRole("button", { name: /Novo Contrato de Aluguel/i }).first().click();

      const modal = page.locator("form").filter({ hasText: /Firmar Contrato de Locação/i });
      await expect(modal).toBeVisible();
      const leadSelect = modal.locator("select").filter({ has: page.locator("option", { hasText: /Selecione o locatário/i }) });
      await leadSelect.selectOption(tenantLead.id);

      const [createRes] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith("/api/rentals") && r.request().method() === "POST"),
        modal.getByRole("button", { name: /Firmar Contrato de Locação/i }).click(),
      ]);
      expect(createRes.status(), await createRes.text()).toBe(201);
      const contract = (await createRes.json()).contract;
      contractId = contract.id;
      const codigo = contract.codigoContrato as string;
      expect(contract.status).toBe("PENDENTE_APROVACAO");

      // Regra UI: corretor vê PENDENTE VALIDAÇÃO e NÃO vê botão Validar
      const cardCorretor = page.locator("div.rounded-xl").filter({ hasText: codigo }).first();
      await expect(cardCorretor).toContainText(/PENDENTE VALIDAÇÃO/i);
      await expect(cardCorretor.getByRole("button", { name: /^Validar$/i })).toHaveCount(0);

      // Financeiro de Aluguel acessa e aprova o contrato
      await login(page, ROLE_EMAILS.FINANCEIRO_ALUGUEL);
      await page.goto("/crm/temporada");
      await page.getByRole("button", { name: /Locação Anual \/ Comum/i }).click();

      const cardFin = page.locator("div.rounded-xl").filter({ hasText: codigo }).first();
      await expect(cardFin).toContainText(/PENDENTE VALIDAÇÃO/i);
      await Promise.all([
        page.waitForResponse((r) => r.url().endsWith("/api/rentals") && r.request().method() === "PATCH"),
        cardFin.getByRole("button", { name: /^Validar$/i }).click(),
      ]);
      await expect(cardFin).toContainText(/VALIDADO \/ ATIVO/i);

      // Cancelar contrato e verificar movimentação para o Histórico
      await Promise.all([
        page.waitForResponse((r) => r.url().endsWith("/api/rentals") && r.request().method() === "PATCH"),
        cardFin.getByRole("button", { name: /^Cancelar$/i }).click(),
      ]);
      await page.getByRole("button", { name: /Histórico Overbooking & Canceladas/i }).click();
      await expect(page.getByText(codigo, { exact: true })).toBeVisible();
    } finally {
      if (contractId) await deleteRentalContractById(contractId);
      await deleteLeadWithRelationsById(tenantLead.id);
    }
  });
});
