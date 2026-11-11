import { BookingItem } from "./types";

interface CreateBookingParams {
  selectedPropertyId: string;
  imovelFallbackNome: string;
  selectedLeadId: string;
  locatarioNome: string;
  locatarioTelefone: string;
  leadDefaultTelefone?: string | null;
  checkIn: string;
  checkOut: string;
  calculatedNights: number;
  valorDiaria: number;
  taxaLimpeza: number;
  totalCalculado: number;
  meioPagamento: BookingItem["meioPagamento"];
}

export async function submitNewBooking(
  params: CreateBookingParams
): Promise<{ booking?: BookingItem; error?: string }> {
  let effectiveLeadId = params.selectedLeadId;
  let effectivePhone: string | null = params.leadDefaultTelefone ?? null;

  if (params.selectedLeadId === "MANUAL") {
    if (!params.locatarioNome.trim() || params.locatarioTelefone.replace(/\D/g, "").length < 10) {
      return { error: "Informe nome completo e WhatsApp (com DDD) do hóspede avulso." };
    }
    const leadRes = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: params.locatarioNome.trim(),
        telefone: params.locatarioTelefone.trim(),
        origem: "Temporada / Reserva Direta",
      }),
    });
    const leadData = await leadRes.json().catch(() => ({}));
    if (!leadRes.ok || !leadData?.lead?.id) {
      return { error: leadData?.error || "Não foi possível cadastrar o hóspede avulso." };
    }
    effectiveLeadId = leadData.lead.id;
    effectivePhone = leadData.lead.telefone || params.locatarioTelefone.trim();
  }

  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      propertyId: params.selectedPropertyId,
      leadId: effectiveLeadId,
      checkInDate: params.checkIn,
      checkOutDate: params.checkOut,
      valorDiarias: params.valorDiaria * params.calculatedNights,
      taxaLimpeza: params.taxaLimpeza,
      meioPagamento: params.meioPagamento,
      observacoes: "Reserva de temporada confirmada pelo Corretor de Aluguel.",
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.booking?.id) {
    return { error: data?.error || "Não foi possível confirmar a reserva. Verifique as datas." };
  }

  const saved = data.booking;
  return {
    booking: {
      id: saved.id,
      imovelNome: saved.property?.nome || params.imovelFallbackNome || "Imóvel de Temporada",
      locatarioNome: saved.lead?.nome || params.locatarioNome.trim() || "Hóspede Cadastrado",
      locatarioTelefone: saved.lead?.telefone ?? effectivePhone,
      checkIn: saved.checkInDate ? String(saved.checkInDate).slice(0, 10) : params.checkIn,
      checkOut: saved.checkOutDate ? String(saved.checkOutDate).slice(0, 10) : params.checkOut,
      diarias: saved.totalNights ?? params.calculatedNights,
      valorDiaria: params.valorDiaria,
      taxaLimpeza: Number(saved.taxaLimpeza ?? params.taxaLimpeza),
      valorTotal: Number(saved.valorTotal ?? params.totalCalculado),
      meioPagamento: params.meioPagamento,
      status: saved.status || "CONFIRMADA",
    },
  };
}
