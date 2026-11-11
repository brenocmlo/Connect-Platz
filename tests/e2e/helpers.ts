import { expect, Page } from "@playwright/test";

export const PASSWORD = process.env.TEST_PASSWORD || "ConnectPlatz2026@";

export const ROLE_EMAILS = {
  ADMINISTRADOR: process.env.TEST_ADMIN_EMAIL || "admin@connectplatz.com.br",
  ADMINISTRADOR_VENDA: "admin.venda@connectplatz.com.br",
  ADMINISTRADOR_ALUGUEL: "admin.aluguel@connectplatz.com.br",
  FINANCEIRO_VENDA: "financeiro.venda@connectplatz.com.br",
  FINANCEIRO_ALUGUEL: "financeiro.aluguel@connectplatz.com.br",
  CORRETOR_VENDA: process.env.TEST_CORRETOR_EMAIL || "corretor.venda@connectplatz.com.br",
  CORRETOR_ALUGUEL: "corretor.aluguel@connectplatz.com.br",
} as const;

export const ADMIN_EMAIL = ROLE_EMAILS.ADMINISTRADOR;
export const CORRETOR_EMAIL = ROLE_EMAILS.CORRETOR_VENDA;

export function uniquePhone(): string {
  const eightDigits = String(Math.floor(10_000_000 + Math.random() * 89_999_999));
  return `(85) 9${eightDigits.slice(0, 4)}-${eightDigits.slice(4)}`;
}

/** Login via API (cookies compartilhados com a page) — evita corrida de hidratação quando foco não é o form. */
export async function login(page: Page, email: string, password = PASSWORD) {
  const res = await page.request.post("/api/auth/login", { data: { email, password } });
  expect(res.ok(), `login ${email}`).toBeTruthy();
  return (await res.json()).user as { id: string; nome: string; role: string; email: string };
}

/** Login completo via formulário UI /login. */
export async function uiLogin(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByPlaceholder(/seu\.email@connectplatz\.com\.br/i).fill(email);
  await page.getByPlaceholder(/••••••••/i).fill(password);
  await Promise.all([
    page.waitForURL(/\/crm/, { timeout: 20000 }),
    page.getByRole("button", { name: /Entrar no Sistema/i }).click(),
  ]);
}

/** Cria um lead novo e único via API; devolve id/nome/telefone. */
export async function createLead(
  page: Page,
  prefix = "E2E",
  extra?: { funnelId?: string; empreendimentoInteresse?: string; observacoes?: string }
) {
  const stamp = `${Date.now()}-${Math.floor(100 + Math.random() * 899)}`;
  const nome = `${prefix} Lead ${stamp}`;
  const telefone = uniquePhone();
  const res = await page.request.post("/api/leads", {
    data: {
      nome,
      telefone,
      email: `e2e.${stamp}@teste.com`,
      ...(extra ?? {}),
    },
  });
  expect(res.status(), await res.text()).toBe(201);
  const body = await res.json();
  const id: string = (body.lead ?? body).id;
  return { id, nome, telefone };
}

export async function getLead(page: Page, id: string) {
  const res = await page.request.get(`/api/leads/${id}`);
  expect(res.ok()).toBeTruthy();
  return (await res.json()).lead;
}

export async function getFunnels(page: Page): Promise<{ id: string; nome: string; modalidade: string }[]> {
  const res = await page.request.get("/api/leads");
  expect(res.ok()).toBeTruthy();
  return (await res.json()).funnels || [];
}

export async function getStages(page: Page, funnelId?: string): Promise<{ id: string; nome: string }[]> {
  const url = funnelId ? `/api/leads?funnelId=${encodeURIComponent(funnelId)}` : "/api/leads";
  const res = await page.request.get(url);
  expect(res.ok()).toBeTruthy();
  return (await res.json()).stages || [];
}

export async function findStage(page: Page, fragment: RegExp, funnelId?: string) {
  const stage = (await getStages(page, funnelId)).find((s) => fragment.test(s.nome));
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

/** Helpers seguros para limpeza em finally (re-autenticam como admin se necessário). */
export async function cleanupAsAdmin(
  page: Page,
  ids: {
    leads?: string[];
    sales?: string[];
    bookings?: string[];
    appointments?: string[];
    cashFlows?: string[];
    properties?: string[];
  }
) {
  await page.request.post("/api/auth/login", { data: { email: ADMIN_EMAIL, password: PASSWORD } }).catch(() => {});
  for (const id of ids.appointments ?? []) {
    await page.request.delete(`/api/agenda/${id}`).catch(() => {});
  }
  for (const id of ids.sales ?? []) {
    await page.request.delete(`/api/vendas/${id}`).catch(() => {});
  }
  for (const id of ids.bookings ?? []) {
    await page.request.delete(`/api/bookings/${id}`).catch(() => {});
  }
  for (const id of ids.cashFlows ?? []) {
    await page.request.delete(`/api/financeiro/${id}`).catch(() => {});
  }
  for (const id of ids.properties ?? []) {
    await page.request.delete(`/api/properties/${id}?permanent=true`).catch(() => {});
  }
  for (const id of ids.leads ?? []) {
    await page.request.delete(`/api/leads/${id}`).catch(() => {});
  }
}
