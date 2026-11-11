import { expect, test } from "@playwright/test";
import { ADMIN_EMAIL, login } from "./helpers";

test.describe("E2E — Smoke Modules (Dashboard, Empreendimentos, Equipe, Ranking, Relatórios, Auditoria, Integrações)", () => {
  test("Todas as rotas administrativas carregam sem erros 500 ou uncaught pageerror", async ({ page }) => {
    const pageErrors: string[] = [];
    const serverErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));
    page.on("response", (res) => {
      if (res.status() >= 500) {
        serverErrors.push(`${res.status()} ${res.url()}`);
      }
    });

    await login(page, ADMIN_EMAIL);

    // 1. Dashboard + alternância de segmento
    await page.goto("/crm");
    await expect(page.getByRole("heading", { name: /^Dashboard$/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: /Vendas/i }).first().click();
    await page.getByRole("button", { name: /Aluguel & Temporada/i }).click();
    await page.getByRole("button", { name: /Consolidado/i }).click();

    // 2. Empreendimentos & Catálogo
    await page.goto("/crm/empreendimentos");
    await expect(page.getByRole("heading", { name: /Empreendimentos & Catálogo/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: /Configurações Site/i }).click();
    await page.getByRole("button", { name: /Lista de Empreendimentos/i }).click();

    // 3. Equipe & Roleta
    await page.goto("/crm/equipes");
    await expect(page.getByRole("heading", { name: /Equipe & Roleta Comercial/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: /Roleta de Distribuição & Fila/i }).click();
    await page.getByRole("button", { name: /Quadro de Colaboradores/i }).click();

    // 4. Ranking & Gamificação
    await page.goto("/crm/ranking");
    await expect(page.getByRole("heading", { name: /Ranking & Gamificação/i })).toBeVisible({ timeout: 15000 });

    // 5. Relatórios BI
    await page.goto("/crm/relatorios");
    await expect(page.getByRole("heading", { name: /Relatórios BI/i })).toBeVisible({ timeout: 15000 });

    // 6. Log & Auditoria
    await page.goto("/crm/auditoria");
    await expect(page.getByRole("heading", { name: /Log & Auditoria do Sistema/i })).toBeVisible({ timeout: 15000 });

    // 7. Integrações & Rastreamento
    await page.goto("/crm/integracoes");
    await expect(page.getByRole("heading", { name: /Integrações & Rastreamento/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: /Canais & Webhooks/i }).click();
    await page.getByRole("button", { name: /Meta Pixel & CAPI/i }).click();

    expect(pageErrors, `Page errors: ${pageErrors.join("; ")}`).toEqual([]);
    expect(serverErrors, `HTTP >= 500: ${serverErrors.join("; ")}`).toEqual([]);
  });
});
