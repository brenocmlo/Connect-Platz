import { IBookingRepository, CreateBookingDto } from "@/lib/core/interfaces/IBookingRepository";
import { PaymentMethod } from "@prisma/client";

export interface CreateSeasonBookingInput {
  organizationId: string;
  propertyId: string;
  leadId: string;
  corretorId?: string | null;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  valorDiarias: number;
  taxaLimpeza?: number;
  meioPagamento: PaymentMethod;
  observacoes?: string;
}

/**
 * Single Responsibility: Criação de Reserva de Veraneio (Temporada) com bloqueio de datas e conciliação ERP.
 * Dependency Inversion: Depende da abstração IBookingRepository.
 */
export class CreateSeasonBookingUseCase {
  constructor(private readonly bookingRepo: IBookingRepository) {}

  async execute(input: CreateSeasonBookingInput) {
    const checkIn = new Date(input.checkInDate);
    const checkOut = new Date(input.checkOutDate);

    if (checkOut <= checkIn) {
      throw new Error("A data de check-out deve ser posterior à data de check-in.");
    }

    // 1. CHECAGEM DE DISPONIBILIDADE (PREVENÇÃO DE OVERBOOKING)
    const conflicting = await this.bookingRepo.findConflictingBooking(
      input.propertyId,
      checkIn,
      checkOut
    );

    if (conflicting) {
      throw new Error("Choque de disponibilidade (Overbooking): O imóvel já possui reserva confirmada para este período.");
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const taxaLimpeza = input.taxaLimpeza || 0;
    const totalAmount = input.valorDiarias + taxaLimpeza;

    const bookingDto: CreateBookingDto = {
      organizationId: input.organizationId,
      propertyId: input.propertyId,
      leadId: input.leadId,
      corretorId: input.corretorId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalNights: nights,
      valorDiarias: input.valorDiarias,
      taxaLimpeza,
      valorTotal: totalAmount,
      meioPagamento: input.meioPagamento,
      observacoes: input.observacoes,
    };

    const description = `Locação Temporada - Hospedagem ${nights} noites (${input.meioPagamento})`;

    // 2. CRIAÇÃO ATÔMICA DA RESERVA + LANÇAMENTO NO FLUXO DE CAIXA
    return this.bookingRepo.createBookingWithCashFlow(bookingDto, description);
  }
}
