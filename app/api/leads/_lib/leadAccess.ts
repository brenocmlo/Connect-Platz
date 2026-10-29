// app/api/leads/_lib/leadAccess.ts
// Regras compartilhadas das rotas de Leads: contexto RLS, permissões de dono/gestor e serialização.

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { SessionPayload } from "@/lib/auth/jwt";
import { isAdmin } from "@/lib/auth/session";
import { maskLeadSensitiveData, RLSUserContext } from "@/lib/db/rls";
import { sourceLabel } from "@/components/crm/leads/leadSource";

export function toRlsContext(session: SessionPayload): RLSUserContext {
  return { userId: session.userId, organizationId: session.organizationId, role: session.role };
}

/** Include padrão para listagem/retorno de leads (etapa, corretor e contagens). */
export const leadInclude = {
  stage: true,
  corretor: { select: { id: true, nome: true, email: true, photoUrl: true } },
  sales: {
    orderBy: { dataVenda: "desc" },
    select: {
      id: true,
      codigoVenda: true,
      valorVendaVGV: true,
      valorComissaoTotal: true,
      percentualComissao: true,
      status: true,
      statusComissao: true,
      dataVenda: true,
      property: { select: { id: true, nome: true } },
      corretorTitular: { select: { id: true, nome: true } },
    },
  },
  _count: {
    select: {
      appointments: { where: { status: "AGENDADO" as const } },
      documents: true,
      sales: true,
    },
  },
} satisfies Prisma.LeadInclude;

export type LeadWithInclude = Prisma.LeadGetPayload<{ include: typeof leadInclude }>;

/** Prefixo usado para guardar o empreendimento de interesse no campo adName. */
export const INTERESSE_PREFIX = "Interesse: ";

function toNumber(value: Prisma.Decimal | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Converte o registro do Prisma no formato consumido pela interface (com máscara LGPD). */
export function serializeLead(lead: LeadWithInclude, ctx: RLSUserContext) {
  const { _count, sales: rawSales, ...rest } = lead;
  const masked = maskLeadSensitiveData(rest, ctx);
  const adName = lead.adName || "";
  const sales = rawSales?.map((s) => ({
    id: s.id,
    codigoVenda: s.codigoVenda,
    valorVendaVGV: toNumber(s.valorVendaVGV) ?? 0,
    valorComissaoTotal: toNumber(s.valorComissaoTotal) ?? 0,
    percentualComissao: toNumber(s.percentualComissao) ?? 0,
    status: s.status,
    statusComissao: s.statusComissao,
    dataVenda: s.dataVenda instanceof Date ? s.dataVenda.toISOString() : String(s.dataVenda),
    property: s.property,
    corretorTitular: s.corretorTitular,
  }));

  return {
    ...masked,
    rendaDeclarada: toNumber(lead.rendaDeclarada),
    rendaInformal: toNumber(lead.rendaInformal),
    rendaEspecificaAutonomo: toNumber(lead.rendaEspecificaAutonomo),
    sourceLabel: sourceLabel(lead.source, lead.utmSource),
    empreendimentoInteresse: adName.startsWith(INTERESSE_PREFIX)
      ? adName.slice(INTERESSE_PREFIX.length)
      : null,
    compromissosCount: _count?.appointments ?? 0,
    documentsCount: _count?.documents ?? 0,
    salesCount: _count?.sales ?? (sales?.length ?? 0),
    sales,
    modalidade: lead.modalidade,
    financialApprovalStatus: lead.financialApprovalStatus,
  };
}

export function canViewLead(
  lead: { corretorId: string | null; isBolsao: boolean; isClosed: boolean; modalidade?: string },
  session: SessionPayload
): boolean {
  if (isAdmin(session.role)) return true;
  if (session.role === "FINANCEIRO_VENDA") {
    return !lead.modalidade || lead.modalidade === "VENDA";
  }
  if (session.role === "FINANCEIRO_ALUGUEL") {
    return lead.modalidade === "ALUGUEL";
  }
  if (session.role === "CORRETOR_VENDA") {
    if (lead.modalidade && lead.modalidade !== "VENDA") return false;
    if (lead.corretorId === session.userId) return true;
    return lead.isBolsao && !lead.isClosed;
  }
  if (session.role === "CORRETOR_ALUGUEL") {
    if (lead.modalidade !== "ALUGUEL") return false;
    if (lead.corretorId === session.userId) return true;
    return lead.isBolsao && !lead.isClosed;
  }
  if (lead.corretorId === session.userId) return true;
  return lead.isBolsao && !lead.isClosed;
}

/**
 * Administradores alteram qualquer lead; corretores só alteram os seus próprios da sua modalidade
 * (ou assumem bolsão da sua modalidade).
 */
export function canModifyLead(
  lead: { corretorId: string | null; isBolsao: boolean; isClosed: boolean; modalidade?: string },
  session: SessionPayload,
  action?: string
): boolean {
  if (isAdmin(session.role)) return true;
  if (session.role === "FINANCEIRO_VENDA") {
    return !lead.modalidade || lead.modalidade === "VENDA";
  }
  if (session.role === "FINANCEIRO_ALUGUEL") {
    return lead.modalidade === "ALUGUEL";
  }
  if (session.role === "CORRETOR_VENDA") {
    if (lead.modalidade && lead.modalidade !== "VENDA") return false;
    if (action === "ASSUMIR_BOLSAO") return lead.isBolsao && !lead.isClosed;
    return lead.corretorId === session.userId;
  }
  if (session.role === "CORRETOR_ALUGUEL") {
    if (lead.modalidade !== "ALUGUEL") return false;
    if (action === "ASSUMIR_BOLSAO") return lead.isBolsao && !lead.isClosed;
    return lead.corretorId === session.userId;
  }
  if (action === "ASSUMIR_BOLSAO") return lead.isBolsao && !lead.isClosed;
  return lead.corretorId === session.userId;
}

/** Busca o lead garantindo a organização da sessão; 404 quando não existe ou é de outra org. */
export async function findOrgLead(id: string, session: SessionPayload) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { stage: true, corretor: { select: { id: true, nome: true } } },
  });
  if (!lead || lead.organizationId !== session.organizationId) {
    return { error: NextResponse.json({ error: "Lead não encontrado." }, { status: 404 }) };
  }
  return { lead };
}

/** Recarrega o lead com o include padrão e serializa. */
export async function loadSerializedLead(id: string, ctx: RLSUserContext) {
  const lead = await prisma.lead.findUnique({ where: { id }, include: leadInclude });
  return lead ? serializeLead(lead, ctx) : null;
}

export function isUuid(value: string | null | undefined): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""));
}

export const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 });
export const forbidden = (error = "Você não tem permissão para alterar este lead.") =>
  NextResponse.json({ error }, { status: 403 });
