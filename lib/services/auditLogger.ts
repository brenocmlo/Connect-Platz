// lib/services/auditLogger.ts
// Serviço central de Auditoria e Registro de Logs do Connect Platz CRM

export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "STATUS_CHANGE"
  | "PASSWORD_CHANGE"
  | "INVITE"
  | "EXPORT";

export type AuditModule =
  | "AUTENTICACAO"
  | "LEADS"
  | "VENDAS"
  | "FLUXO_DE_CAIXA"
  | "EQUIPES"
  | "METAS"
  | "AGENDA"
  | "CONFIGURACOES"
  | "SISTEMA";

export interface AuditLogUser {
  id: string;
  nome: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO
  dataHoraFormatada: string;
  usuario: AuditLogUser;
  acao: string;
  tipoAcao: AuditActionType;
  modulo: AuditModule;
  detalhes: string;
  ipOrigem?: string;
  dispositivo?: string;
  entidadeAfetada?: {
    tipo: string;
    id?: string;
    nome?: string;
  };
  dadosAntes?: Record<string, unknown> | null;
  dadosDepois?: Record<string, unknown> | null;
}

const STORAGE_KEY = "connect_platz_audit_logs";

export const initialMockAuditLogs: AuditLogEntry[] = [
  {
    id: "log-101",
    timestamp: "2026-10-06T15:45:12.000Z",
    dataHoraFormatada: "06/10/2026 12:45",
    usuario: {
      id: "u-1",
      nome: "Robson Carvalho",
      email: "robson@connectplatz.com.br",
      role: "ADMINISTRADOR",
      avatar: "RC",
    },
    acao: "Login Efetuado",
    tipoAcao: "LOGIN",
    modulo: "AUTENTICACAO",
    detalhes: "Autenticação biométrica bem-sucedida via Painel Web.",
    ipOrigem: "177.18.240.12",
    dispositivo: "macOS · Chrome 129",
  },
  {
    id: "log-102",
    timestamp: "2026-10-06T15:30:00.000Z",
    dataHoraFormatada: "06/10/2026 12:30",
    usuario: {
      id: "u-2",
      nome: "Juliana Mendes",
      email: "juliana.mendes@connectplatz.com.br",
      role: "CORRETOR",
      avatar: "JM",
    },
    acao: "Avanço de Etapa de Lead",
    tipoAcao: "UPDATE",
    modulo: "LEADS",
    detalhes: "Lead 'Mariana Duarte' avançado de 'Visita Realizada' para 'Proposta em Negociação'.",
    ipOrigem: "189.40.112.55",
    dispositivo: "iOS 18 · Safari Mobile",
    entidadeAfetada: {
      tipo: "Lead",
      id: "lead-402",
      nome: "Mariana Duarte",
    },
  },
  {
    id: "log-103",
    timestamp: "2026-10-06T14:15:20.000Z",
    dataHoraFormatada: "06/10/2026 11:15",
    usuario: {
      id: "u-1",
      nome: "Robson Carvalho",
      email: "robson@connectplatz.com.br",
      role: "ADMINISTRADOR",
      avatar: "RC",
    },
    acao: "Baixa em Fluxo de Caixa",
    tipoAcao: "UPDATE",
    modulo: "FLUXO_DE_CAIXA",
    detalhes: "Confirmação manual de entrada antecipada de R$ 42.500,00 ref. Comissão Venda Reserva Praia.",
    ipOrigem: "177.18.240.12",
    dispositivo: "macOS · Chrome 129",
  },
  {
    id: "log-104",
    timestamp: "2026-10-06T13:05:40.000Z",
    dataHoraFormatada: "06/10/2026 10:05",
    usuario: {
      id: "u-3",
      nome: "Carlos Eduardo",
      email: "carlos.eduardo@connectplatz.com.br",
      role: "GERENTE",
      avatar: "CE",
    },
    acao: "Novo Lançamento de Venda",
    tipoAcao: "CREATE",
    modulo: "VENDAS",
    detalhes: "Registro de fechamento da Unidade 1402 do Platz Ocean Park (VGV R$ 1.850.000,00).",
    ipOrigem: "201.23.45.67",
    dispositivo: "Windows 11 · Edge 128",
  },
  {
    id: "log-105",
    timestamp: "2026-10-06T11:50:00.000Z",
    dataHoraFormatada: "06/10/2026 08:50",
    usuario: {
      id: "u-1",
      nome: "Robson Carvalho",
      email: "robson@connectplatz.com.br",
      role: "ADMINISTRADOR",
      avatar: "RC",
    },
    acao: "Convite de Colaborador",
    tipoAcao: "INVITE",
    modulo: "EQUIPES",
    detalhes: "Convite enviado para fernanda.lima@connectplatz.com.br com perfil CORRETOR e senha provisória.",
    ipOrigem: "177.18.240.12",
    dispositivo: "macOS · Chrome 129",
  },
  {
    id: "log-106",
    timestamp: "2026-10-05T19:22:15.000Z",
    dataHoraFormatada: "05/10/2026 16:22",
    usuario: {
      id: "u-2",
      nome: "Juliana Mendes",
      email: "juliana.mendes@connectplatz.com.br",
      role: "CORRETOR",
      avatar: "JM",
    },
    acao: "Alteração de Senha",
    tipoAcao: "PASSWORD_CHANGE",
    modulo: "CONFIGURACOES",
    detalhes: "Senha de acesso atualizada pelo próprio usuário.",
    ipOrigem: "189.40.112.55",
    dispositivo: "macOS · Safari 17",
  },
  {
    id: "log-107",
    timestamp: "2026-10-05T17:10:00.000Z",
    dataHoraFormatada: "05/10/2026 14:10",
    usuario: {
      id: "u-1",
      nome: "Robson Carvalho",
      email: "robson@connectplatz.com.br",
      role: "ADMINISTRADOR",
      avatar: "RC",
    },
    acao: "Ajuste de SLA Global",
    tipoAcao: "UPDATE",
    modulo: "CONFIGURACOES",
    detalhes: "Tempo máximo de primeiro atendimento redefinido para 15 minutos.",
    ipOrigem: "177.18.240.12",
    dispositivo: "macOS · Chrome 129",
  },
  {
    id: "log-108",
    timestamp: "2026-10-05T14:40:00.000Z",
    dataHoraFormatada: "05/10/2026 11:40",
    usuario: {
      id: "u-4",
      nome: "Lucas Santos",
      email: "lucas.santos@connectplatz.com.br",
      role: "CORRETOR",
      avatar: "LS",
    },
    acao: "Agendamento de Visita",
    tipoAcao: "CREATE",
    modulo: "AGENDA",
    detalhes: "Visita marcada com cliente 'Rodrigo Ferreira' no stand Platz Tower para 08/10.",
    ipOrigem: "179.108.12.90",
    dispositivo: "Android 14 · Chrome Mobile",
  },
  {
    id: "log-109",
    timestamp: "2026-10-05T11:00:00.000Z",
    dataHoraFormatada: "05/10/2026 08:00",
    usuario: {
      id: "u-1",
      nome: "Robson Carvalho",
      email: "robson@connectplatz.com.br",
      role: "ADMINISTRADOR",
      avatar: "RC",
    },
    acao: "Exportação de Relatório Financeiro",
    tipoAcao: "EXPORT",
    modulo: "VENDAS",
    detalhes: "Download de planilha consolidada de VGV e comissões do 3º Trimestre.",
    ipOrigem: "177.18.240.12",
    dispositivo: "macOS · Chrome 129",
  },
  {
    id: "log-110",
    timestamp: "2026-10-04T18:15:00.000Z",
    dataHoraFormatada: "04/10/2026 15:15",
    usuario: {
      id: "u-1",
      nome: "Robson Carvalho",
      email: "robson@connectplatz.com.br",
      role: "ADMINISTRADOR",
      avatar: "RC",
    },
    acao: "Criação de Campanha de Incentivo",
    tipoAcao: "CREATE",
    modulo: "METAS",
    detalhes: "Campanha 'Festival de Primavera Platz' cadastrada e ativada para toda a equipe.",
    ipOrigem: "177.18.240.12",
    dispositivo: "macOS · Chrome 129",
  },
];

export function getAuditLogs(): AuditLogEntry[] {
  if (typeof window === "undefined") return initialMockAuditLogs;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockAuditLogs));
      return initialMockAuditLogs;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialMockAuditLogs;
  } catch {
    return initialMockAuditLogs;
  }
}

export function logAuditEvent(
  entry: Omit<AuditLogEntry, "id" | "timestamp" | "dataHoraFormatada">
): AuditLogEntry {
  const now = new Date();
  const formatted = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(
    2,
    "0"
  )}:${String(now.getMinutes()).padStart(2, "0")}`;

  const newLog: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now.toISOString(),
    dataHoraFormatada: formatted,
    ipOrigem: entry.ipOrigem || "177.18.240.12",
    dispositivo: entry.dispositivo || "macOS · Chrome 129",
    ...entry,
  };

  if (typeof window !== "undefined") {
    try {
      const current = getAuditLogs();
      const updated = [newLog, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // fallback silencioso
    }
  }

  return newLog;
}

export function clearAuditLogs(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}

export function resetAuditLogsToMock(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockAuditLogs));
  }
}
