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
  user?: { id: string; nome: string; avatarUrl?: string };
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

export const APPOINTMENT_TYPE_CONFIG: Record<string, TypeConfig> = {
  VISITA: {
    label: "Visita",
    border: "border-l-[#1266C7]",
    bgTint: "bg-[#1266C7]/5 dark:bg-[#1266C7]/10",
    text: "text-[#1266C7] dark:text-blue-400",
    dot: "bg-[#1266C7]",
    badgeBg: "bg-[#1266C7]/15",
    badgeText: "text-[#1266C7] dark:text-blue-300",
    rawHex: "#1266C7",
  },
  DOCUMENTACAO: {
    label: "Documentação",
    border: "border-l-[#6366F1]",
    bgTint: "bg-[#6366F1]/5 dark:bg-[#6366F1]/10",
    text: "text-[#6366F1] dark:text-indigo-400",
    dot: "bg-[#6366F1]",
    badgeBg: "bg-[#6366F1]/15",
    badgeText: "text-[#6366F1] dark:text-indigo-300",
    rawHex: "#6366F1",
  },
  RETORNO: {
    label: "Retorno / Follow-up",
    border: "border-l-[#D97706]",
    bgTint: "bg-[#D97706]/5 dark:bg-[#D97706]/10",
    text: "text-[#D97706] dark:text-amber-400",
    dot: "bg-[#D97706]",
    badgeBg: "bg-[#D97706]/15",
    badgeText: "text-[#D97706] dark:text-amber-300",
    rawHex: "#D97706",
  },
  PROPOSTA: {
    label: "Proposta / Apresentação",
    border: "border-l-[#DB2777]",
    bgTint: "bg-[#DB2777]/5 dark:bg-[#DB2777]/10",
    text: "text-[#DB2777] dark:text-pink-400",
    dot: "bg-[#DB2777]",
    badgeBg: "bg-[#DB2777]/15",
    badgeText: "text-[#DB2777] dark:text-pink-300",
    rawHex: "#DB2777",
  },
  LEMBRETE: {
    label: "Lembrete",
    border: "border-l-[#64748B]",
    bgTint: "bg-[#64748B]/5 dark:bg-[#64748B]/10",
    text: "text-[#64748B] dark:text-slate-400",
    dot: "bg-[#64748B]",
    badgeBg: "bg-[#64748B]/15",
    badgeText: "text-[#64748B] dark:text-slate-300",
    rawHex: "#64748B",
  },
  REUNIAO: {
    label: "Reunião",
    border: "border-l-[#6366F1]",
    bgTint: "bg-[#6366F1]/5 dark:bg-[#6366F1]/10",
    text: "text-[#6366F1] dark:text-indigo-400",
    dot: "bg-[#6366F1]",
    badgeBg: "bg-[#6366F1]/15",
    badgeText: "text-[#6366F1] dark:text-indigo-300",
    rawHex: "#6366F1",
  },
  ENTREGA_CHAVES: {
    label: "Entrega de Chaves",
    border: "border-l-[#22C55E]",
    bgTint: "bg-[#22C55E]/5 dark:bg-[#22C55E]/10",
    text: "text-[#22C55E] dark:text-emerald-400",
    dot: "bg-[#22C55E]",
    badgeBg: "bg-[#22C55E]/15",
    badgeText: "text-[#22C55E] dark:text-emerald-300",
    rawHex: "#22C55E",
  },
};

export function getTypeConfig(tipo: string): TypeConfig {
  const normalized = tipo.toUpperCase();
  return (
    APPOINTMENT_TYPE_CONFIG[normalized] || {
      label: tipo,
      border: "border-l-slate-500",
      bgTint: "bg-slate-500/5 dark:bg-slate-500/10",
      text: "text-slate-500",
      dot: "bg-slate-500",
      badgeBg: "bg-slate-500/15",
      badgeText: "text-slate-400",
      rawHex: "#64748B",
    }
  );
}
