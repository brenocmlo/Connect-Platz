// Meios de pagamento aceitos pelo banco (enum PaymentMethod) com rótulos de exibição.

export const PAYMENT_METHOD_OPTIONS = [
  { id: "PIX", label: "PIX" },
  { id: "TED", label: "TED" },
  { id: "BOLETO", label: "Boleto" },
  { id: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { id: "CARTAO_DEBITO", label: "Cartão de Débito" },
] as const;

export function paymentMethodLabel(value?: string | null): string {
  if (!value) return "—";
  return PAYMENT_METHOD_OPTIONS.find((o) => o.id === value)?.label || value;
}

/** "AAAA-MM-DD" → "DD/MM/AAAA" (sem conversão de fuso). */
export function formatDateBr(value?: string | null): string {
  if (!value) return "—";
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
}
