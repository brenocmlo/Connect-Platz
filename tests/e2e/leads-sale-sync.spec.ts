import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, cleanupAsAdmin, login, createLead, getLead, findStage, moveLead, openLeadCard } from "./helpers";

test.describe("E2E-02/03: Ganho, pendência financeira e vendas", () => {
  test("E2E-02: Lead em Ganho sem venda mostra pendência e botão abre o modal de venda", async ({ page }) => {
    const leadsToDelete: string[] = [];
    try {
      await login(page, ADMIN_EMAIL);
      const { id, nome } = await createLead(page, "Pend");
      leadsToDelete.push(id);

      const ganho = await findStage(page, /ganho|fechado/i);
      await moveLead(page, id, ganho.id);

      const card = await openLeadCard(page, nome);
      const column = page.getByTestId("kanban-column").filter({ has: card });
      await expect(column).toHaveAttribute("data-stage-name", ganho.nome);

      await expect(card.getByText(/Aguardando Financeiro|Pendência Financeira/i)).toBeVisible();
      await card.getByText(/Formalizar Venda|Cadastrar Venda/i).click();
      await expect(page.getByText(/Nova Venda & Split de Comissões/i)).toBeVisible();
    } finally {
      await cleanupAsAdmin(page, { leads: leadsToDelete });
    }
  });

  test("E2E-03: Registrar venda move o lead para Ganho e grava código na timeline", async ({ page }) => {
    const leadsToDelete: string[] = [];
    const salesToDelete: string[] = [];
    try {
      const admin = await login(page, ADMIN_EMAIL);
      const { id, nome } = await createLead(page, "Venda");
      leadsToDelete.push(id);

      const propsRes = await page.request.get("/api/properties");
      const props = (await propsRes.json()).properties || [];
      const saleProp = props.find((p: any) => p.modalidade === "VENDA" || !p.modalidade) || props[0];

      const today = new Date().toISOString().slice(0, 10);
      const res = await page.request.post("/api/vendas", {
        data: {
          leadId: id,
          propertyId: saleProp.id,
          dataVenda: today,
          vgv: 600000,
          percentualComissao: 5,
          meioPagamento: "PIX",
          participants: [{ role: "CORRETOR_1", userId: admin.id, percentual: 100 }],
        },
      });
      expect(res.status(), await res.text()).toBe(201);
      const sale = (await res.json()).sale;
      salesToDelete.push(sale.id);
      const codigo: string = sale.codigoVenda;
      expect(codigo).toMatch(/^CP-\d{4}-\d+/);

      const ganho = await findStage(page, /ganho|fechado/i);
      expect((await getLead(page, id)).stage.id).toBe(ganho.id);

      const card = await openLeadCard(page, nome);
      const column = page.getByTestId("kanban-column").filter({ has: card });
      await expect(column).toHaveAttribute("data-stage-name", ganho.nome);
      await expect(card.getByText(/Aguardando Financeiro|Pendência Financeira/i)).toHaveCount(0);

      await card.getByRole("heading", { name: nome }).click();
      await page.getByRole("button", { name: /Histórico & Timeline/ }).click();
      await expect(page.getByText(new RegExp(`Venda ${codigo} registrada com sucesso`))).toBeVisible({
        timeout: 15000,
      });
    } finally {
      await cleanupAsAdmin(page, { sales: salesToDelete, leads: leadsToDelete });
    }
  });
});
