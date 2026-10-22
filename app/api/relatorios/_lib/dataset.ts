// app/api/relatorios/_lib/dataset.ts
// Carrega, em poucas consultas, o conjunto de vendas, leads e comissões usado pelos relatórios BI.

import { CommissionBeneficiaryType, LeadSource, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ACTIVE_SALE_WHERE, AnalyticsScope, toNumber } from "@/app/api/dashboard/_lib/scope";
import { PeriodRange } from "@/app/api/dashboard/_lib/period";

export interface BiSale {
  dataVenda: Date; // @db.Date
  vgv: number;
  comissao: number;
  source: LeadSource | null;
  campaign: string | null;
}

export interface BiLead {
  createdAt: Date;
  source: LeadSource;
  campaign: string | null;
}

export interface BiSplit {
  dataVenda: Date; // @db.Date da venda
  valor: number;
  pago: boolean;
}

export interface BiDataset {
  sales: BiSale[];
  leads: BiLead[];
  /** Gestor: repasses a terceiros (exceto imobiliária). Corretor: parcelas destinadas a ele. */
  splits: BiSplit[];
}

/** Janela mínima: 24 meses (séries com comparação anual) ou o período anterior, o que for mais antigo. */
export function datasetSince(period: PeriodRange, now: Date = new Date()): Date | null {
  if (!period.current) return null;
  const twoYears = new Date(now.getFullYear(), now.getMonth() - 23, 1);
  const prevStart = period.previous?.start || period.current.start;
  return new Date(Math.min(twoYears.getTime(), prevStart.getTime()));
}

export async function loadBiDataset(scope: AnalyticsScope, period: PeriodRange): Promise<BiDataset> {
  const since = datasetSince(period);
  const saleDate = since
    ? { gte: new Date(Date.UTC(since.getFullYear(), since.getMonth(), since.getDate())) }
    : undefined;

  const saleWhere: Prisma.SaleWhereInput = {
    organizationId: scope.organizationId,
    ...ACTIVE_SALE_WHERE,
    ...scope.sale,
    dataVenda: saleDate,
  };

  const splitWhere: Prisma.CommissionSplitWhereInput = {
    ...(scope.manager
      ? { beneficiarioTipo: { not: CommissionBeneficiaryType.IMOBILIARIA } }
      : { userId: scope.userId }),
    status: { not: PaymentStatus.CANCELADO },
    sale: { organizationId: scope.organizationId, ...ACTIVE_SALE_WHERE, dataVenda: saleDate },
  };

  const [sales, leads, splits] = await Promise.all([
    prisma.sale.findMany({
      where: saleWhere,
      select: {
        dataVenda: true,
        valorVendaVGV: true,
        valorComissaoTotal: true,
        lead: { select: { source: true, campaignName: true } },
      },
    }),
    prisma.lead.findMany({
      where: {
        organizationId: scope.organizationId,
        ...scope.lead,
        ...(since ? { createdAt: { gte: since } } : {}),
      },
      select: { createdAt: true, source: true, campaignName: true },
    }),
    prisma.commissionSplit.findMany({
      where: splitWhere,
      select: { valor: true, status: true, sale: { select: { dataVenda: true } } },
    }),
  ]);

  return {
    sales: sales.map((s) => ({
      dataVenda: s.dataVenda,
      vgv: toNumber(s.valorVendaVGV),
      comissao: toNumber(s.valorComissaoTotal),
      source: s.lead?.source || null,
      campaign: s.lead?.campaignName?.trim() || null,
    })),
    leads: leads.map((l) => ({ createdAt: l.createdAt, source: l.source, campaign: l.campaignName?.trim() || null })),
    splits: splits.map((s) => ({
      dataVenda: s.sale.dataVenda,
      valor: toNumber(s.valor),
      pago: s.status === PaymentStatus.PAGO,
    })),
  };
}
