import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, login, createLead, getLead, findStage, moveLead, openLeadCard } from "./helpers";

test.describe("E2E-02/03: Ganho, pendência financeira e vendas", () => {
  test("E2E-02: Lead em Ganho sem venda mostra 'Pendência Financeira' e 'Cadastrar Venda' abre o modal de venda", async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    const { id, nome } = await createLead(page, "Pend");
    // Move via API (o dragTo com DnD HTML5 nativo é instável no Playwright)
    const ganho = await findStage(page, /ganho|fechado/i);
    await moveLead(page, id, ganho.id);

    const card = await openLeadCard(page, nome);
    // O card deve estar na coluna de Ganho/Fechado
    const column = page.getByTestId("kanban-column").filter({ has: card });
    await expect(column).toHaveAttribute("data-stage-name", ganho.nome);

    await expect(card.getByText("Pendência Financeira")).toBeVisible();
    await card.getByText("Cadastrar Venda").click();
    await expect(page.getByText(/Nova Venda & Split de Comissões/i)).toBeVisible();
  });

  test("E2E-03: Registrar venda move o lead para Ganho e grava 'Venda <código> registrada com sucesso' na timeline", async ({ page }) => {
    const admin = await login(page, ADMIN_EMAIL);
    const { id, nome } = await createLead(page, "Venda");
    const propsRes = await page.request.get("/api/properties");
    const propertyId: string = (await propsRes.json()).properties[0].id;

    const today = new Date().toISOString().slice(0, 10);
    const res = await page.request.post("/api/vendas", {
      data: {
        leadId: id,
        propertyId,
        dataVenda: today,
        vgv: 600000,
        percentualComissao: 5,
        meioPagamento: "PIX",
        participants: [{ role: "CORRETOR_1", userId: admin.id, percentual: 100 }],
      },
    });
    expect(res.status(), await res.text()).toBe(201);
    const codigo: string = (await res.json()).sale.codigoVenda;
    expect(codigo).toMatch(/^CP-\d{4}-\d+/);

    const ganho = await findStage(page, /ganho|fechado/i);
    expect((await getLead(page, id)).stage.id).toBe(ganho.id);

    const card = await openLeadCard(page, nome);
    const column = page.getByTestId("kanban-column").filter({ has: card });
    await expect(column).toHaveAttribute("data-stage-name", ganho.nome);
    await expect(card.getByText("Pendência Financeira")).toHaveCount(0);

    await card.getByRole("heading", { name: nome }).click();
    await page.getByRole("button", { name: /Histórico & Timeline/ }).click();
    await expect(page.getByText(new RegExp(`Venda ${codigo} registrada com sucesso`))).toBeVisible({ timeout: 15000 });
  });
});
