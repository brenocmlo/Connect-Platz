// lib/utils/phone.ts
// Normalização de telefones brasileiros e links diretos wa.me (sem WhatsApp embutido).

/**
 * Retorna apenas DDD + número (10 ou 11 dígitos), removendo máscara e o DDI 55.
 * Ex.: "+55 (85) 99123-4567" -> "85991234567"
 */
export function normalizeBrPhone(input: string | null | undefined): string {
  let digits = String(input || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    digits = digits.slice(2);
  }
  return digits;
}

/** Link direto https://wa.me/55<DDD><número> com mensagem opcional. */
export function buildWhatsAppUrl(phone: string | null | undefined, text?: string): string {
  const local = normalizeBrPhone(phone);
  const base = local ? `https://wa.me/55${local}` : "https://wa.me/";
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Mensagem padrão de primeiro contato com o lead. */
export function defaultLeadGreeting(nome?: string | null): string {
  const first = String(nome || "").trim().split(/\s+/)[0];
  return `Olá${first ? ` ${first}` : ""}, tudo bem? Sou consultor(a) da Connect Platz.`;
}
