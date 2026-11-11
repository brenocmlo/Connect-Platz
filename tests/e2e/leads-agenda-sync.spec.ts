import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, cleanupAsAdmin, login, createLead, getLead, findStage, openLeadCard } from "./helpers";

test("E2E-04: Agendar VISITA move o lead para 'Visita Agendada' e o compromisso aparece no drawer", async ({ page }) => {
  const leadsToDelete: string[] = [];
  const appointmentsToDelete: string[] = [];

  try {
    await login(page, ADMIN_EMAIL);
    const { id, nome } = await createLead(page, "Visita");
    leadsToDelete.push(id);
    const titulo = `Visita Decorado ${Date.now()}`;

    const inicio = new Date(Date.now() + 2 * 24 * 3600 * 1000);
    const fim = new Date(inicio.getTime() + 3600 * 1000);
    const res = await page.request.post("/api/agenda", {
      data: { tipo: "VISITA", titulo, dataInicio: inicio.toISOString(), dataFim: fim.toISOString(), leadId: id },
    });
    expect(res.status(), await res.text()).toBe(201);
    const appData = await res.json();
    if (appData.appointment?.id) appointmentsToDelete.push(appData.appointment.id);

    const visita = await findStage(page, /visita/i);
    expect((await getLead(page, id)).stage.id).toBe(visita.id);

    const card = await openLeadCard(page, nome);
    const column = page.getByTestId("kanban-column").filter({ has: card });
    await expect(column).toHaveAttribute("data-stage-name", visita.nome);

    await card.getByRole("heading", { name: nome }).click();
    await expect(page.getByText("Compromissos Agendados")).toBeVisible();
    await expect(page.getByText(titulo)).toBeVisible({ timeout: 15000 });
  } finally {
    await cleanupAsAdmin(page, { appointments: appointmentsToDelete, leads: leadsToDelete });
  }
});
