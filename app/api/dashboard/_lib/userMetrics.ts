// app/api/dashboard/_lib/userMetrics.ts
// Métricas determinísticas por colaborador (ranking, performance da equipe e progresso de metas).

import { AppointmentStatus, AppointmentType, CommissionBeneficiaryType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ACTIVE_SALE_WHERE, toNumber } from "./scope";
import { DateRange, dateOnlyFilter, rangeFilter } from "./period";

export interface UserMetrics {
  vgv: number;
  vendas: number;
  leads: number;
  leadsNoSla: number;
  visitas: number;
  documentos: number;
  compromissos: number;
  captacoes: number;
  /** VGV/vendas em que o usuário figura como gerente no split de comissão */
  vgvGerencia: number;
  vendasGerencia: number;
}

export function emptyMetrics(): UserMetrics {
  return {
    vgv: 0,
    vendas: 0,
    leads: 0,
    leadsNoSla: 0,
    visitas: 0,
    documentos: 0,
    compromissos: 0,
    captacoes: 0,
    vgvGerencia: 0,
    vendasGerencia: 0,
  };
}

/**
 * Agrega, por usuário, vendas (titular), captações (split CAPTACAO), gerência (split GERENTE),
 * leads recebidos, aderência ao SLA e compromissos concluídos no intervalo.
 * `userIds` restringe o resultado (ex.: corretor consultando apenas a si mesmo).
 */
export async function computeUserMetrics(
  organizationId: string,
  range: DateRange | null,
  userIds?: string[]
): Promise<Map<string, UserMetrics>> {
  const result = new Map<string, UserMetrics>();
  const get = (id: string | null | undefined): UserMetrics | null => {
    if (!id) return null;
    if (userIds && !userIds.includes(id)) return null;
    if (!result.has(id)) result.set(id, emptyMetrics());
    return result.get(id)!;
  };

  const [sales, leadGroups, appointmentGroups] = await Promise.all([
    prisma.sale.findMany({
      where: { organizationId, ...ACTIVE_SALE_WHERE, dataVenda: dateOnlyFilter(range) },
      select: {
        id: true,
        corretorId: true,
        valorVendaVGV: true,
        commissionSplits: { select: { userId: true, beneficiarioTipo: true } },
      },
    }),
    prisma.lead.groupBy({
      by: ["corretorId", "slaBreached"],
      where: {
        organizationId,
        corretorId: userIds ? { in: userIds } : { not: null },
        createdAt: rangeFilter(range),
      },
      _count: { _all: true },
    }),
    prisma.appointment.groupBy({
      by: ["userId", "tipo"],
      where: {
        organizationId,
        status: AppointmentStatus.CONCLUIDO,
        ...(userIds ? { userId: { in: userIds } } : {}),
        dataInicio: rangeFilter(range),
      },
      _count: { _all: true },
    }),
  ]);

  for (const sale of sales) {
    const vgv = toNumber(sale.valorVendaVGV);
    const titular = get(sale.corretorId);
    if (titular) {
      titular.vgv += vgv;
      titular.vendas += 1;
    }

    // Um mesmo usuário conta no máximo uma vez por venda em cada papel
    const captadores = new Set<string>();
    const gerentes = new Set<string>();
    for (const split of sale.commissionSplits) {
      if (!split.userId) continue;
      if (split.beneficiarioTipo === CommissionBeneficiaryType.CAPTACAO) captadores.add(split.userId);
      if (split.beneficiarioTipo === CommissionBeneficiaryType.GERENTE) gerentes.add(split.userId);
    }
    captadores.forEach((id) => {
      const m = get(id);
      if (m) m.captacoes += 1;
    });
    gerentes.forEach((id) => {
      const m = get(id);
      if (m) {
        m.vgvGerencia += vgv;
        m.vendasGerencia += 1;
      }
    });
  }

  for (const group of leadGroups) {
    const m = get(group.corretorId);
    if (!m) continue;
    m.leads += group._count._all;
    if (!group.slaBreached) m.leadsNoSla += group._count._all;
  }

  for (const group of appointmentGroups) {
    const m = get(group.userId);
    if (!m) continue;
    m.compromissos += group._count._all;
    if (group.tipo === AppointmentType.VISITA) m.visitas += group._count._all;
    if (group.tipo === AppointmentType.DOCUMENTACAO) m.documentos += group._count._all;
  }

  return result;
}

export function conversionRate(m: UserMetrics): number {
  return m.leads > 0 ? Math.round((m.vendas / m.leads) * 1000) / 10 : 0;
}

export function slaAdherence(m: UserMetrics): number | null {
  return m.leads > 0 ? Math.round((m.leadsNoSla / m.leads) * 1000) / 10 : null;
}

/** Ordenação determinística: VGV, nº de vendas, visitas, captações e nome. */
export function compareByPerformance(
  a: { nome: string; m: UserMetrics },
  b: { nome: string; m: UserMetrics }
): number {
  return (
    b.m.vgv - a.m.vgv ||
    b.m.vendas - a.m.vendas ||
    b.m.visitas - a.m.visitas ||
    b.m.captacoes - a.m.captacoes ||
    a.nome.localeCompare(b.nome, "pt-BR")
  );
}
