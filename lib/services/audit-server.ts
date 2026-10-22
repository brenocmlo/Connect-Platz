// lib/services/audit-server.ts
// Registro de auditoria no PostgreSQL (server-side). Falhas de log nunca derrubam a operação principal.

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getClientIp } from "@/lib/auth/session";

export type AuditTipoAcao = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "STATUS_CHANGE" | "EXPORT";
export type AuditModulo =
  | "AUTENTICACAO"
  | "LEADS"
  | "VENDAS"
  | "FLUXO_DE_CAIXA"
  | "EQUIPES"
  | "METAS"
  | "AGENDA"
  | "EMPREENDIMENTOS"
  | "CONFIGURACOES"
  | "INTEGRACOES"
  | "SISTEMA";

export interface RecordAuditInput {
  req?: NextRequest;
  organizationId: string;
  userId?: string | null; // null = sistema/integração
  acao: string;
  tipoAcao: AuditTipoAcao;
  modulo: AuditModulo;
  entidade: string;
  entidadeId?: string | null;
  entidadeNome?: string | null;
  descricao: string;
  dadosAntes?: Record<string, unknown> | null;
  dadosDepois?: Record<string, unknown> | null;
  ator?: string; // rótulo quando não há usuário (ex.: "Integração: Meta Ads")
}

export async function recordAudit(input: RecordAuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId || null,
        acao: input.acao,
        entidade: input.entidade,
        entidadeId: input.entidadeId || null,
        ipAddress: input.req ? getClientIp(input.req) : null,
        detalhes: {
          tipoAcao: input.tipoAcao,
          modulo: input.modulo,
          descricao: input.descricao,
          entidadeNome: input.entidadeNome || undefined,
          dispositivo: input.req?.headers.get("user-agent") || (input.ator ? "Integração" : "Servidor"),
          ator: input.ator,
          dadosAntes: input.dadosAntes ?? undefined,
          dadosDepois: input.dadosDepois ?? undefined,
        } as any,
      },
    });
  } catch (err) {
    console.error("[AUDIT] Falha ao registrar evento de auditoria:", err);
  }
}
