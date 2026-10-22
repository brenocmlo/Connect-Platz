// app/api/dashboard/_lib/scope.ts
// Filtros de escopo (RBAC) e de vendas válidas usados pelos agregadores de BI.

import { Prisma } from "@prisma/client";
import { SessionPayload } from "@/lib/auth/jwt";
import { isDirector, isManager } from "@/lib/auth/session";

/**
 * Venda válida = qualquer status que não seja cancelamento/estorno.
 * (O cadastro de vendas grava "ativa" ou "APROVADA"; ambos contam.)
 */
const CANCELLED_SALE_STATUSES = [
  "cancelada",
  "CANCELADA",
  "cancelado",
  "CANCELADO",
  "estornada",
  "ESTORNADA",
  "distratada",
  "DISTRATADA",
];

export const ACTIVE_SALE_WHERE: Prisma.SaleWhereInput = {
  status: { notIn: CANCELLED_SALE_STATUSES },
};

export interface AnalyticsScope {
  organizationId: string;
  userId: string;
  manager: boolean;
  director: boolean;
  /** Filtro aplicado em Sale (corretor = só as vendas em que é titular) */
  sale: Prisma.SaleWhereInput;
  /** Filtro aplicado em Lead (corretor = só os leads atribuídos a ele) */
  lead: Prisma.LeadWhereInput;
  /** Filtro aplicado em Appointment (corretor = só a própria agenda) */
  appointment: Prisma.AppointmentWhereInput;
}

export function buildScope(session: SessionPayload): AnalyticsScope {
  const manager = isManager(session.role);
  return {
    organizationId: session.organizationId,
    userId: session.userId,
    manager,
    director: isDirector(session.role),
    sale: manager ? {} : { corretorId: session.userId },
    lead: manager ? {} : { corretorId: session.userId },
    appointment: manager ? {} : { userId: session.userId },
  };
}

export function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}
