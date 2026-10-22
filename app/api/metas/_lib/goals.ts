// app/api/metas/_lib/goals.ts
// Validação das metas (Organization.settings.goals) e cálculo de progresso a partir de dados reais.

import type { GoalConfig } from "@/lib/domain/settings/orgSettings";
import type { GoalIncentive, GoalMetric } from "@/components/crm/ranking/types";
import { computeUserMetrics, UserMetrics } from "@/app/api/dashboard/_lib/userMetrics";

const METRICS: GoalMetric[] = ["VENDAS", "VGV", "VISITAS", "CAPTACOES"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type GoalFields = Omit<GoalConfig, "id">;

function optionalText(value: unknown, max: number): string | undefined {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  return text ? text.slice(0, max) : undefined;
}

/** Valida o payload (parcial no PATCH). Retorna os campos normalizados ou a mensagem de erro (400). */
export function validateGoal(
  body: any,
  base?: GoalFields
): { goal: GoalFields; error?: undefined } | { goal?: undefined; error: string } {
  const pick = <K extends keyof GoalFields>(key: K) => (body?.[key] !== undefined ? body[key] : base?.[key]);

  const titulo = optionalText(pick("titulo"), 120);
  if (!titulo) return { error: "Informe o título da meta." };

  const metrica = String(pick("metrica") || "").toUpperCase() as GoalMetric;
  if (!METRICS.includes(metrica)) return { error: "Métrica inválida. Use VENDAS, VGV, VISITAS ou CAPTACOES." };

  const objetivo = Number(pick("objetivo"));
  if (!Number.isFinite(objetivo) || objetivo <= 0) return { error: "O objetivo deve ser um número maior que zero." };
  if (metrica !== "VGV" && !Number.isInteger(objetivo)) return { error: "O objetivo deve ser um número inteiro." };

  const inicio = String(pick("inicio") || "");
  const fim = String(pick("fim") || "");
  if (!DATE_RE.test(inicio) || Number.isNaN(Date.parse(inicio))) return { error: "Data de início inválida." };
  if (!DATE_RE.test(fim) || Number.isNaN(Date.parse(fim))) return { error: "Data de término inválida." };
  if (fim < inicio) return { error: "A data de término deve ser igual ou posterior ao início." };

  const imagemUrl = optionalText(pick("imagemUrl"), 500);
  if (imagemUrl && !/^(https?:\/\/|\/)/i.test(imagemUrl)) return { error: "URL da imagem do prêmio inválida." };

  return {
    goal: {
      titulo,
      descricao: optionalText(pick("descricao"), 500),
      premio: optionalText(pick("premio"), 120),
      imagemUrl,
      metrica,
      objetivo,
      inicio,
      fim,
    },
  };
}

function localDate(isoDate: string, endOfDay: boolean): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return endOfDay ? new Date(y, m - 1, d, 23, 59, 59, 999) : new Date(y, m - 1, d, 0, 0, 0, 0);
}

function todayKey(now: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

function metricValue(m: UserMetrics, metrica: GoalMetric): number {
  switch (metrica) {
    case "VENDAS":
      return m.vendas;
    case "VGV":
      return m.vgv;
    case "VISITAS":
      return m.visitas;
    case "CAPTACOES":
      return m.captacoes;
  }
}

/**
 * Progresso real de cada meta no seu intervalo.
 * Corretor: somente os próprios resultados. Gestor: soma da organização.
 */
export async function withProgress(
  organizationId: string,
  goals: GoalConfig[],
  viewer: { userId: string; manager: boolean },
  now: Date = new Date()
): Promise<GoalIncentive[]> {
  const today = todayKey(now);
  const items = await Promise.all(
    goals.map(async (g) => {
      const range = { start: localDate(g.inicio, false), end: localDate(g.fim, true) };
      const metrics = await computeUserMetrics(organizationId, range, viewer.manager ? undefined : [viewer.userId]);
      let progresso = 0;
      metrics.forEach((m) => {
        progresso += metricValue(m, g.metrica);
      });
      const status: GoalIncentive["status"] = today < g.inicio ? "agendada" : today > g.fim ? "encerrada" : "ativa";
      return {
        ...g,
        progressoAtual: Math.round(progresso * 100) / 100,
        progressScope: viewer.manager ? "equipe" : "individual",
        status,
      } as GoalIncentive;
    })
  );

  const order = { ativa: 0, agendada: 1, encerrada: 2 } as const;
  return items.sort(
    (a, b) =>
      order[a.status] - order[b.status] ||
      (a.status === "encerrada" ? b.fim.localeCompare(a.fim) : a.inicio.localeCompare(b.inicio)) ||
      a.titulo.localeCompare(b.titulo, "pt-BR")
  );
}
