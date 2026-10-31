// scripts/qa/qa-helpers.ts
// Utilitários de execução e assertions para QA de Homologação

export const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
export const PASSWORD = process.env.TEST_PASSWORD || "ConnectPlatz2026@";

export interface TestResult {
  scenario: string;
  item: string;
  status: "APROVADO" | "REPROVADO";
  details: string;
}

export const results: TestResult[] = [];

export function record(scenario: string, item: string, ok: boolean, details: string) {
  const status: "APROVADO" | "REPROVADO" = ok ? "APROVADO" : "REPROVADO";
  results.push({ scenario, item, status, details });
  const icon = ok ? "✅" : "❌";
  console.log(`[${status}] ${icon} [${scenario}] ${item} — ${details}`);
}

export async function login(email: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  if (res.status !== 200) {
    throw new Error(`Falha no login com ${email}: HTTP ${res.status}`);
  }
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) throw new Error(`Cookie não retornado no login de ${email}`);
  return setCookie.split(";")[0];
}

export async function request(cookie: string | null, method: string, path: string, body?: any) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookie) headers["Cookie"] = cookie;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data, headers: res.headers };
}
