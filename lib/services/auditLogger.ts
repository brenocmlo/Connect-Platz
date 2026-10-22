// lib/services/auditLogger.ts
// Cliente da trilha de auditoria. A fonte da verdade é a tabela audit_logs (via /api/auditoria).
// No servidor, use recordAudit (lib/services/audit-server.ts); aqui logAuditEvent é no-op.

export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "STATUS_CHANGE"
  | "PASSWORD_CHANGE"
  | "INVITE"
  | "EXPORT"
  | "OUTRO";

export type AuditModule =
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

export interface AuditLogUser {
  id: string | null;
  nome: string;
  email: string | null;
  role: string;
  avatar?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO
  dataHoraFormatada: string;
  usuario: AuditLogUser;
  acao: string;
  tipoAcao: AuditActionType | string;
  modulo: AuditModule | string;
  detalhes: string;
  ipOrigem: string | null;
  dispositivo: string | null;
  entidadeAfetada?: {
    tipo: string;
    id?: string;
    nome?: string;
  };
  dadosAntes?: Record<string, unknown> | null;
  dadosDepois?: Record<string, unknown> | null;
}

export interface AuditQuery {
  page?: number;
  pageSize?: number;
  modulo?: string;
  tipoAcao?: string;
  userId?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  q?: string;
}

export interface AuditStats {
  total: number;
  logins: number;
  sensiveis: number;
  usuariosComAcoes: number;
}

export interface AuditPage {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: AuditStats;
  usuarios: { id: string; nome: string }[];
}

/** Busca uma página da trilha de auditoria. Lança erro com a mensagem da API em caso de falha. */
export async function fetchAuditLogsFromApi(query: AuditQuery = {}): Promise<AuditPage> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== "ALL") params.set(k, String(v));
  });
  const res = await fetch(`/api/auditoria?${params.toString()}`, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Não foi possível carregar a auditoria.");
  }
  return data as AuditPage;
}

/** Evento originado no cliente. O usuário, IP e dispositivo são definidos pelo servidor a partir da sessão. */
export interface ClientAuditEvent {
  acao: string;
  tipoAcao: AuditActionType | string;
  modulo: AuditModule | string;
  detalhes: string;
  entidadeAfetada?: { tipo: string; id?: string; nome?: string };
  dadosAntes?: Record<string, unknown> | null;
  dadosDepois?: Record<string, unknown> | null;
  /** Ignorado: mantido apenas por compatibilidade com chamadas antigas. */
  usuario?: unknown;
  ipOrigem?: unknown;
  dispositivo?: unknown;
}

/**
 * Registra um evento de auditoria do cliente via POST /api/auditoria.
 * Retorna true se o servidor confirmou a gravação. No servidor é no-op silencioso.
 */
export async function logAuditEvent(entry: ClientAuditEvent): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const { usuario: _u, ipOrigem: _ip, dispositivo: _d, ...payload } = entry;
  try {
    const res = await fetch("/api/auditoria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn("[AUDIT] Evento não registrado:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[AUDIT] Falha de rede ao registrar evento:", err);
    return false;
  }
}
