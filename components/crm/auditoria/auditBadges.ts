// components/crm/auditoria/auditBadges.ts
// Cores semânticas dos tipos de ação da auditoria (light + dark).

export function getAuditActionBadge(type: string): string {
  switch (type) {
    case "CREATE":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "UPDATE":
    case "STATUS_CHANGE":
      return "bg-connect-blue/10 text-connect-blue border-connect-blue/30";
    case "DELETE":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
    case "LOGIN":
    case "LOGOUT":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "PASSWORD_CHANGE":
    case "INVITE":
      return "bg-platz-gold/15 text-amber-700 dark:text-platz-gold border-platz-gold/40";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getInitials(nome: string): string {
  return (
    nome
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "—"
  );
}
