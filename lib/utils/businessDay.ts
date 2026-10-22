// lib/utils/businessDay.ts
// "Dia útil" da imobiliária no fuso America/Fortaleza, independente do fuso do servidor.
// Retorna 00:00 UTC da data local de Fortaleza — formato correto para colunas @db.Date.

export const BUSINESS_TIMEZONE = "America/Fortaleza";

export function businessDay(at: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at); // YYYY-MM-DD
  return new Date(`${parts}T00:00:00.000Z`);
}
