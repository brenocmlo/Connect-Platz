import { SeasonBooking, PaymentMethod, BookingStatus } from "@prisma/client";

export interface CreateBookingDto {
  organizationId: string;
  propertyId: string;
  leadId: string;
  corretorId?: string | null;
  checkInDate: Date;
  checkOutDate: Date;
  totalNights: number;
  valorDiarias: number;
  taxaLimpeza: number;
  valorTotal: number;
  meioPagamento: PaymentMethod;
  observacoes?: string;
}

/**
 * Abstração para reservas de temporada e verificação de conflito de datas.
 */
export interface IBookingRepository {
  findConflictingBooking(propertyId: string, checkInDate: Date, checkOutDate: Date): Promise<SeasonBooking | null>;
  createBookingWithCashFlow(
    bookingData: CreateBookingDto,
    cashFlowDescription: string
  ): Promise<SeasonBooking & { property: any; lead: any }>;
}
