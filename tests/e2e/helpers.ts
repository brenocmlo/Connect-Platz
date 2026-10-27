import { expect, Page } from "@playwright/test";

export const PASSWORD = process.env.TEST_PASSWORD || "ConnectPlatz2026@";
export const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "robson@connectplatz.com.br";
export const CORRETOR_EMAIL = process.env.TEST_CORRETOR_EMAIL || "lucas.corretor@connectplatz.com.br";

/** Login via API (o contexto de request compartilha cookies com a page) — evita corrida de hidratação do form. */
export async function login(page: Page, email: string) {
  const res = await page.request.post("/api/auth/login", { data: { email, password: PASSWORD } });
  expect(res.ok(), `login ${email}`).toBeTruthy();
  return (await res.json()).user as { id: string; nome: string; role: string };
}

/** Cria um lead novo e único; devolve id/nome. */
export async function createLead(page: Page, prefix = "E2E") {
  const stamp = Date.now();
  const nome = `${prefix} Lead ${stamp}`;
  const res = await page.request.post("/api/leads", {
    data: { nome, telefone: `(85) 9${String(stamp).slice(-8)}`, email: `e2e.${stamp}@teste.com` },
  });
  expect(res.status(), await res.text()).toBe(201);
  const body = await res.json();
  const id: string = (body.lead ?? body).id;
  return { id, nome };
}

export async function getLead(page: Page, id: string) {
  const res = await page.request.get(`/api/leads/${id}`);
  expect(res.ok()).toBeTruthy();
  return (await res.json()).lead;
}

export async function getStages(page: Page): Promise<{ id: string; nome: string }[]> {
  const res = await page.request.get("/api/leads");
  return (await res.json()).stages;
}

export async function findStage(page: Page, fragment: RegExp) {
  const stage = (await getStages(page)).find((s) => fragment.test(s.nome));
  expect(stage, `etapa ${fragment}`).toBeTruthy();
  return stage!;
}

export async function moveLead(page: Page, id: string, stageId: string) {
  const res = await page.request.patch(`/api/leads/${id}`, { data: { stageId } });
  expect(res.ok(), await res.text()).toBeTruthy();
}

/** Abre /crm/leads, filtra pelo nome e devolve o card do lead. */
export async function openLeadCard(page: Page, nome: string) {
  await page.goto("/crm/leads");
  await page.getByPlaceholder(/busque por nome/i).fill(nome);
  const card = page.getByTestId("lead-card").filter({ hasText: nome });
  await expect(card).toHaveCount(1, { timeout: 15000 });
  return card;
}
