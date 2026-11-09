// app/api/dashboard/_lib/scope.ts
// Filtros de escopo (RBAC) e de vendas válidas usados pelos agregadores de BI.

import { Prisma, Role } from "@prisma/client";
import { SessionPayload } from "@/lib/auth/jwt";
import { isAdmin, isFinanceiro } from "@/lib/auth/session";

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
  const manager = isAdmin(session.role) || isFinanceiro(session.role);
  const isSaleScoped =
    session.role === "ADMINISTRADOR_VENDA" ||
    session.role === "FINANCEIRO_VENDA" ||
    session.role === "CORRETOR_VENDA";
  const isRentScoped =
    session.role === "ADMINISTRADOR_ALUGUEL" ||
    session.role === "FINANCEIRO_ALUGUEL" ||
    session.role === "CORRETOR_ALUGUEL";

  const saleFilter: Prisma.SaleWhereInput = isRentScoped
    ? { id: "__none__" }
    : manager
    ? {}
    : { corretorId: session.userId };

  const leadFilter: Prisma.LeadWhereInput = {
    ...(manager ? {} : { corretorId: session.userId }),
    ...(isSaleScoped ? { modalidade: "VENDA" } : isRentScoped ? { modalidade: "ALUGUEL" } : {}),
  };

  const appointmentFilter: Prisma.AppointmentWhereInput = !manager
    ? { userId: session.userId }
    : isSaleScoped
    ? {
        user: {
          role: {
            in: [Role.ADMINISTRADOR, Role.ADMINISTRADOR_VENDA, Role.FINANCEIRO_VENDA, Role.CORRETOR_VENDA],
          },
        },
      }
    : isRentScoped
    ? {
        user: {
          role: {
            in: [Role.ADMINISTRADOR, Role.ADMINISTRADOR_ALUGUEL, Role.FINANCEIRO_ALUGUEL, Role.CORRETOR_ALUGUEL],
          },
        },
      }
    : {};

  return {
    organizationId: session.organizationId,
    userId: session.userId,
    manager,
    director: isAdmin(session.role),
    sale: saleFilter,
    lead: leadFilter,
    appointment: appointmentFilter,
  };
}

export function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}
