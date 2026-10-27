import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, CORRETOR_EMAIL, login, createLead, getLead, openLeadCard } from "./helpers";

test.describe("E2E-01: Mudar corretor / RBAC", () => {
  test("Administrador transfere um lead para outro corretor e o card reflete a mudança", async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    const { id, nome } = await createLead(page, "Transf");
    const before = await getLead(page, id);

    const card = await openLeadCard(page, nome);
    await card.getByRole("button", { name: "Abrir menu do lead" }).click();
    await page.getByRole("button", { name: /mudar corretor/i }).click();

    await expect(page.getByText("Mudar Corretor Responsável")).toBeVisible();
    // Escolhe um corretor que não seja o atual responsável
    const options = page.getByTestId("broker-option").filter({ hasNotText: "(Atual responsável)" });
    await expect(options.first()).toBeVisible();
    const target = options.first();
    const newName = (await target.getByTestId("broker-name").innerText()).trim();
    await target.click();
    await page.getByRole("button", { name: /confirmar transferência/i }).click();

    await expect(page.getByText(`Lead transferido com sucesso para ${newName}!`)).toBeVisible();
    await expect(card.getByText(newName.split(" ")[0], { exact: true })).toBeVisible();

    const after = await getLead(page, id);
    expect(after.corretor?.nome).toBe(newName);
    expect(after.corretor?.id).not.toBe(before.corretor?.id);
  });

  test("Corretor comum NÃO visualiza a opção 'Mudar corretor' no menu do card (RBAC)", async ({ page }) => {
    await login(page, CORRETOR_EMAIL);
    await page.goto("/crm/leads");

    const menuButton = page.locator('button[aria-label="Abrir menu do lead"]').first();
    await expect(menuButton).toBeVisible({ timeout: 15000 });
    await menuButton.click();
    await expect(page.getByRole("button", { name: /ver detalhes/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /mudar corretor/i })).toHaveCount(0);
  });
});
