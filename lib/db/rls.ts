import { PrismaClient, Prisma, Role } from "@prisma/client";
import { prisma } from "./prisma";

export interface RLSUserContext {
  userId: string;
  organizationId: string;
  role: Role;
}

/**
 * Executa uma transação no PostgreSQL configurando as variáveis de sessão de RLS:
 * - app.current_organization_id
 * - app.current_user_id
 * - app.current_user_role
 * 
 * Isso garante que as políticas de ROW LEVEL SECURITY (RLS) do PostgreSQL sejam aplicadas nativamente
 * a cada query executada nesta transação.
 */
export async function withRLS<T>(
  context: RLSUserContext,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Define as variáveis de sessão no PostgreSQL para a transação atual
    await tx.$executeRawUnsafe(
      `SELECT 
        set_config('app.current_organization_id', $1, true),
        set_config('app.current_user_id', $2, true),
        set_config('app.current_user_role', $3, true);`,
      context.organizationId,
      context.userId,
      context.role
    );

    return fn(tx);
  });
}

/**
 * Filtro de defesa em profundidade para consultas de Leads.
 * Garante em tempo de aplicação e em nível de banco que corretores só recebam seus próprios leads
 * da sua modalidade (ou bolsão da sua modalidade), e financeiros vejam leads da sua modalidade.
 */
export function buildLeadRLSWhere(context: RLSUserContext): Prisma.LeadWhereInput {
  const baseWhere: Prisma.LeadWhereInput = {
    organizationId: context.organizationId,
  };

  if (context.role === Role.CORRETOR_VENDA) {
    return {
      ...baseWhere,
      modalidade: "VENDA",
      OR: [
        { corretorId: context.userId },
        { isBolsao: true, isClosed: false },
      ],
    };
  }

  if (context.role === Role.CORRETOR_ALUGUEL) {
    return {
      ...baseWhere,
      modalidade: "ALUGUEL",
      OR: [
        { corretorId: context.userId },
        { isBolsao: true, isClosed: false },
      ],
    };
  }

  if (context.role === Role.FINANCEIRO_VENDA) {
    return {
      ...baseWhere,
      modalidade: "VENDA",
    };
  }

  if (context.role === Role.FINANCEIRO_ALUGUEL) {
    return {
      ...baseWhere,
      modalidade: "ALUGUEL",
    };
  }

  // Administradores visualizam toda a organização (todas as modalidades)
  return baseWhere;
}

/**
 * Aplica máscara de privacidade no número de telefone do lead caso o usuário atual
 * não seja o corretor titular ou administrador / financeiro autorizado (Regra de Ouro LGPD).
 */
export function maskLeadSensitiveData<
  T extends { telefone: string; email?: string | null; corretorId?: string | null; modalidade?: string }
>(lead: T, context: RLSUserContext): T {
  const isOwner = lead.corretorId === context.userId;
  const isAdmin = context.role === Role.ADMINISTRADOR;
  const isFinVenda = context.role === Role.FINANCEIRO_VENDA && (!lead.modalidade || lead.modalidade === "VENDA");
  const isFinAluguel = context.role === Role.FINANCEIRO_ALUGUEL && lead.modalidade === "ALUGUEL";

  if (isOwner || isAdmin || isFinVenda || isFinAluguel) {
    return lead;
  }

  // Mascarar telefone: (85) 9****-1234
  const tel = lead.telefone.replace(/\D/g, "");
  let maskedPhone = "(**) *****-****";
  if (tel.length >= 10) {
    const ddd = tel.slice(0, 2);
    const last4 = tel.slice(-4);
    maskedPhone = `(${ddd}) 9****-${last4}`;
  }

  // Mascarar email
  let maskedEmail = lead.email;
  if (lead.email && lead.email.includes("@")) {
    const [user, domain] = lead.email.split("@");
    maskedEmail = `${user.slice(0, 2)}***@${domain}`;
  }

  return {
    ...lead,
    telefone: maskedPhone,
    email: maskedEmail,
  };
}
