import { expect, test } from "@playwright/test";
import { ADMIN_EMAIL, cleanupAsAdmin, createLead, login } from "./helpers";

test.describe("E2E — Vendas & Fluxo de Caixa / DRE UI", () => {
  test("Cria venda com splits, valida persistência pós-reload, dá baixa e estorna em SaleDetailModal", async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    const lead = await createLead(page, "VendaUI");
    let saleId = "";

    try {
      await page.goto("/crm/vendas");
      await expect(page.getByRole("heading", { name: /Vendas e Comissões/i })).toBeVisible({ timeout: 15000 });

      await page.getByRole("button", { name: /Nova Venda/i }).click();
      await expect(page.getByRole("heading", { name: /Nova Venda & Split de Comissões/i })).toBeVisible();

      // Empreendimento e Comprador via SearchCombobox
      const propInput = page.getByPlaceholder("Busque o empreendimento...");
      await propInput.click();
      await page.locator('[role="listbox"] [role="option"]').first().click();

      const leadInput = page.getByPlaceholder("Busque o lead por nome, telefone ou e-mail...");
      await leadInput.click();
      await leadInput.fill(lead.nome);
      await page.locator('[role="listbox"] [role="option"]').filter({ hasText: lead.nome }).first().click();

      const brokerSelect = page.locator("select").filter({ has: page.locator("option", { hasText: /Selecione o corretor/i }) }).first();
      await brokerSelect.selectOption({ label: "Lucas Santos" });

      // Conferir aba determinística de Resumo e Cálculos
      await page.getByRole("button", { name: /Resumo e Cálculos/i }).click();
      await expect(page.getByText(/Imobiliária|Comissão Líquida|VGV/i).first()).toBeVisible();

      const [saleRes] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith("/api/vendas") && r.request().method() === "POST"),
        page.getByRole("button", { name: /Cadastrar Fechamento/i }).click(),
      ]);
      expect(saleRes.status(), await saleRes.text()).toBe(201);
      const createdSale = (await saleRes.json()).sale;
      saleId = createdSale.id;
      const codigoVenda = createdSale.codigoVenda as string;
      expect(saleId).toBeTruthy();

      // Reload para validar persistência real no PostgreSQL
      await page.reload();
      const row = page.locator("table tbody tr").filter({ hasText: lead.nome }).first();
      await expect(row).toBeVisible({ timeout: 15000 });
      await expect(row).toContainText(codigoVenda);

      // Detalhes da venda -> dar baixa e estornar split
      await row.getByRole("button", { name: /Abrir ações da venda/i }).click();
      await page.getByRole("button", { name: /^Ver detalhes$/i }).click();
      await expect(page.getByRole("heading", { name: new RegExp(`Venda ${codigoVenda}`) })).toBeVisible();

      await page.getByRole("button", { name: /^Dar Baixa$/i }).first().click();
      await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/vendas/splits/") && r.request().method() === "PATCH"),
        page.getByRole("button", { name: /Confirmar Baixa com Comprovante/i }).click(),
      ]);
      await expect(page.getByText(/^Liquidado$/i).first()).toBeVisible();

      await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/vendas/splits/") && r.request().method() === "PATCH"),
        page.getByRole("button", { name: /^Estornar$/i }).first().click(),
      ]);
      await expect(page.getByRole("button", { name: /^Dar Baixa$/i }).first()).toBeVisible();
      await page.getByRole("button", { name: /^Fechar$/i }).last().click();
    } finally {
      await cleanupAsAdmin(page, {
        sales: saleId ? [saleId] : [],
        leads: [lead.id],
      });
    }
  });

  test("Movimenta Fluxo de Caixa, liquida lançamento, alterna escopos/DRE/Projeção e exclui", async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    let cashFlowId = "";

    try {
      await page.goto("/crm/fluxo-de-caixa");
      await expect(page.getByRole("heading", { name: /Fluxo de Caixa & DRE/i })).toBeVisible({ timeout: 15000 });

      // Alternar escopos gerenciais
      await page.getByRole("button", { name: /^Vendas$/i }).click();
      await page.getByRole("button", { name: /Locação & Temporada/i }).click();
      await page.getByRole("button", { name: /Consolidado Geral/i }).click();

      // Criar novo lançamento pendente pela UI
      const desc = `E2E Lançamento ${Date.now()}`;
      await page.getByRole("button", { name: /Novo Lançamento/i }).click();
      await expect(page.getByRole("heading", { name: /Novo Lançamento Financeiro/i })).toBeVisible();

      await page.getByPlaceholder("0,00").fill("1250");
      await page.getByPlaceholder(/Diárias Veraneio|Comissão Venda/i).fill(desc);

      const [cfRes] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith("/api/financeiro") && r.request().method() === "POST"),
        page.getByRole("button", { name: /Salvar Lançamento/i }).click(),
      ]);
      expect(cfRes.ok(), await cfRes.text()).toBeTruthy();
      cashFlowId = (await cfRes.json()).entry?.id || "";
      expect(cashFlowId).toBeTruthy();

      const cfRow = page.locator("table tbody tr").filter({ hasText: desc }).first();
      await expect(cfRow).toBeVisible({ timeout: 10000 });

      // Liquidar lançamento pelo ConfirmCashMovementModal
      await cfRow.getByRole("button", { name: /Confirmar (Saída|Entrada)/i }).click();
      await expect(page.getByRole("heading", { name: /Confirmar (Saída|Entrada)/i })).toBeVisible();
      await page.getByPlaceholder(/Quitado via PIX/i).fill("Liquidado via E2E");
      await Promise.all([
        page.waitForResponse((r) => r.url().includes(`/api/financeiro/${cashFlowId}`) && r.request().method() === "PATCH"),
        page.getByRole("button", { name: /Confirmar Baixa/i }).click(),
      ]);
      await expect(cfRow).toContainText(/Liquidado/i);

      // Conferir abas DRE e Projeção de Saldo
      await page.getByRole("button", { name: /DRE Gerencial em Tempo Real/i }).click();
      await expect(page.getByText(/Receita|Resultado|DRE/i).first()).toBeVisible();
      await page.getByRole("button", { name: /Projeção de Saldo \(90 Dias\)/i }).click();
      await page.getByRole("button", { name: /Contas a Pagar & Receber/i }).click();

      // Excluir lançamento criado pela lixeira
      page.once("dialog", (d) => d.accept());
      const [delCf] = await Promise.all([
        page.waitForResponse((r) => r.url().includes(`/api/financeiro/${cashFlowId}`) && r.request().method() === "DELETE"),
        cfRow.locator('button[title="Excluir lançamento"]').click(),
      ]);
      expect(delCf.ok()).toBeTruthy();
      cashFlowId = "";
    } finally {
      if (cashFlowId) {
        await cleanupAsAdmin(page, { cashFlows: [cashFlowId] });
      }
    }
  });
});
