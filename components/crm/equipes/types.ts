// components/crm/equipes/types.ts

export type MemberRole = "ADMINISTRADOR" | "DIRETOR" | "GERENTE" | "CORRETOR";
export type MemberStatus = "DISPONIVEL" | "EM_VISITA" | "PAUSA" | "OFFLINE";

export interface TeamMember {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  creci: string | null;
  photoUrl: string | null;
  role: MemberRole;
  status: MemberStatus;
  leadsAtivos: number;
  hasCheckedInToday: boolean;
  lastLeadAssignedAt: string | null;
}

export const ROLE_LABEL: Record<MemberRole, string> = {
  ADMINISTRADOR: "Administrador",
  DIRETOR: "Diretor",
  GERENTE: "Gerente",
  CORRETOR: "Corretor",
};

export const STATUS_META: Record<MemberStatus, { label: string; cls: string }> = {
  DISPONIVEL: {
    label: "Disponível",
    cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  EM_VISITA: {
    label: "Em Visita",
    cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  PAUSA: { label: "Em Pausa", cls: "bg-muted text-muted-foreground border-border" },
  OFFLINE: { label: "Offline", cls: "bg-muted text-muted-foreground border-border" },
};

/** Corretor apto à roleta: ativo, Disponível e com check-in feito hoje. */
export function isRoletaEligible(m: TeamMember): boolean {
  return m.role === "CORRETOR" && m.status === "DISPONIVEL" && m.hasCheckedInToday;
}

/** Mesma ordenação da roleta do servidor: quem está há mais tempo sem receber lead primeiro. */
export function sortRoletaQueue(members: TeamMember[]): TeamMember[] {
  return [...members].sort((a, b) => {
    if (!a.lastLeadAssignedAt && !b.lastLeadAssignedAt) return a.nome.localeCompare(b.nome);
    if (!a.lastLeadAssignedAt) return -1;
    if (!b.lastLeadAssignedAt) return 1;
    return new Date(a.lastLeadAssignedAt).getTime() - new Date(b.lastLeadAssignedAt).getTime();
  });
}

export function formatRelative(iso: string | null): string {
  if (!iso) return "ainda não recebeu leads";
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.round(h / 24)} dia(s)`;
}
