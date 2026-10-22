export interface AppointmentItem {
  id: string;
  titulo: string;
  tipo: string;
  dataInicio: string;
  dataFim: string;
  status: "AGENDADO" | "CONCLUIDO" | "CANCELADO" | "NAO_COMPARECEU";
  resultadoVisita?: string | null;
  observacoes?: string | null;
  lead?: { id: string; nome: string; telefone: string } | null;
  property?: { id: string; nome: string; endereco?: string | null; bairro?: string | null } | null;
  user?: { id: string; nome: string; avatarUrl?: string; photoUrl?: string | null };
}

export interface TypeConfig {
  label: string;
  border: string;
  bgTint: string;
  text: string;
  dot: string;
  badgeBg: string;
  badgeText: string;
  rawHex: string;
}

/**
 * Tipos de compromisso persistidos (enum AppointmentType do Prisma).
 * A UI trabalha sempre com os valores do enum; aliases antigos do modal
 * (RETORNO, PROPOSTA) são normalizados por `normalizeAppointmentType`.
 */
export const APPOINTMENT_ENUM_VALUES = [
  "VISITA",
  "LEMBRETE",
  "DOCUMENTACAO",
  "RETORNO_FOLLOWUP",
  "REUNIAO",
  "LIGACAO",
  "APRESENTACAO_PROPOSTA",
  "ASSINATURA_CONTRATO",
  "ENTREGA_CHAVES",
  "PLANTAO_VENDAS",
] as const;

export type AppointmentEnumType = (typeof APPOINTMENT_ENUM_VALUES)[number];

const TYPE_ALIASES: Record<string, AppointmentEnumType> = {
  RETORNO: "RETORNO_FOLLOWUP",
  FOLLOWUP: "RETORNO_FOLLOWUP",
  FOLLOW_UP: "RETORNO_FOLLOWUP",
  PROPOSTA: "APRESENTACAO_PROPOSTA",
  APRESENTACAO: "APRESENTACAO_PROPOSTA",
};

/** Converte o tipo vindo da UI (ou legado) para o valor do enum. Retorna null se desconhecido. */
export function normalizeAppointmentType(tipo: string | null | undefined): AppointmentEnumType | null {
  if (!tipo) return null;
  const upper = tipo.trim().toUpperCase();
  if ((APPOINTMENT_ENUM_VALUES as readonly string[]).includes(upper)) {
    return upper as AppointmentEnumType;
  }
  return TYPE_ALIASES[upper] || null;
}

function buildConfig(label: string, hex: string, darkText: string, darkBadge: string): TypeConfig {
  return {
    label,
    border: `border-l-[${hex}]`,
    bgTint: `bg-[${hex}]/5 dark:bg-[${hex}]/10`,
    text: `text-[${hex}] ${darkText}`,
    dot: `bg-[${hex}]`,
    badgeBg: `bg-[${hex}]/15`,
    badgeText: `text-[${hex}] ${darkBadge}`,
    rawHex: hex,
  };
}

// Classes literais (o Tailwind precisa enxergá-las no código-fonte):
// border-l-[#1266C7] bg-[#1266C7]/5 dark:bg-[#1266C7]/10 text-[#1266C7] bg-[#1266C7] bg-[#1266C7]/15
// border-l-[#6366F1] bg-[#6366F1]/5 dark:bg-[#6366F1]/10 text-[#6366F1] bg-[#6366F1] bg-[#6366F1]/15
// border-l-[#D97706] bg-[#D97706]/5 dark:bg-[#D97706]/10 text-[#D97706] bg-[#D97706] bg-[#D97706]/15
// border-l-[#DB2777] bg-[#DB2777]/5 dark:bg-[#DB2777]/10 text-[#DB2777] bg-[#DB2777] bg-[#DB2777]/15
// border-l-[#64748B] bg-[#64748B]/5 dark:bg-[#64748B]/10 text-[#64748B] bg-[#64748B] bg-[#64748B]/15
// border-l-[#22C55E] bg-[#22C55E]/5 dark:bg-[#22C55E]/10 text-[#22C55E] bg-[#22C55E] bg-[#22C55E]/15
// border-l-[#0EA5E9] bg-[#0EA5E9]/5 dark:bg-[#0EA5E9]/10 text-[#0EA5E9] bg-[#0EA5E9] bg-[#0EA5E9]/15
export const APPOINTMENT_TYPE_CONFIG: Partial<Record<AppointmentEnumType, TypeConfig>> = {
  VISITA: buildConfig("Visita", "#1266C7", "dark:text-blue-400", "dark:text-blue-300"),
  DOCUMENTACAO: buildConfig("Documentação", "#6366F1", "dark:text-indigo-400", "dark:text-indigo-300"),
  RETORNO_FOLLOWUP: buildConfig("Retorno / Follow-up", "#D97706", "dark:text-amber-400", "dark:text-amber-300"),
  APRESENTACAO_PROPOSTA: buildConfig("Proposta / Apresentação", "#DB2777", "dark:text-pink-400", "dark:text-pink-300"),
  LEMBRETE: buildConfig("Lembrete", "#64748B", "dark:text-slate-400", "dark:text-slate-300"),
  REUNIAO: buildConfig("Reunião", "#6366F1", "dark:text-indigo-400", "dark:text-indigo-300"),
  LIGACAO: buildConfig("Ligação", "#0EA5E9", "dark:text-sky-400", "dark:text-sky-300"),
  ENTREGA_CHAVES: buildConfig("Entrega de Chaves", "#22C55E", "dark:text-emerald-400", "dark:text-emerald-300"),
};

/** Tipos oferecidos no modal "Novo compromisso" (seção 5.5 do AGENTS.md). */
export const APPOINTMENT_FORM_TYPES: { id: AppointmentEnumType; label: string; color: string }[] = [
  { id: "VISITA", label: "Visita", color: "#1266C7" },
  { id: "LEMBRETE", label: "Lembrete", color: "#64748B" },
  { id: "DOCUMENTACAO", label: "Documentação", color: "#6366F1" },
  { id: "RETORNO_FOLLOWUP", label: "Retorno / Follow-up", color: "#D97706" },
  { id: "APRESENTACAO_PROPOSTA", label: "Proposta / Apresentação", color: "#DB2777" },
];

export function getTypeConfig(tipo: string): TypeConfig {
  const normalized = normalizeAppointmentType(tipo);
  const config = normalized ? APPOINTMENT_TYPE_CONFIG[normalized] : undefined;
  return config || buildConfig(tipo, "#64748B", "dark:text-slate-400", "dark:text-slate-300");
}

/** Chave de dia (AAAA-MM-DD) no fuso local do navegador — evita deslocamento de UTC. */
export function localDateKey(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
