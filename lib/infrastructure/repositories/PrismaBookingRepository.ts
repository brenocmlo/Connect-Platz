import { PrismaClient, SeasonBooking, BookingStatus, CashFlowType, PaymentStatus } from "@prisma/client";
import { IBookingRepository, CreateBookingDto } from "@/lib/core/interfaces/IBookingRepository";

export class PrismaBookingRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findConflictingBooking(
    propertyId: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<SeasonBooking | null> {
    return this.prisma.seasonBooking.findFirst({
      where: {
        propertyId,
        status: { not: BookingStatus.CANCELADA },
        AND: [
          { checkInDate: { lt: checkOutDate } },
          { checkOutDate: { gt: checkInDate } },
        ],
      },
    });
  }

  async createBookingWithCashFlow(
    data: CreateBookingDto,
    cashFlowDescription: string
  ): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.seasonBooking.create({
        data: {
          organizationId: data.organizationId,
          propertyId: data.propertyId,
          leadId: data.leadId,
          corretorId: data.corretorId || null,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          totalNights: data.totalNights,
          valorDiarias: data.valorDiarias,
          taxaLimpeza: data.taxaLimpeza,
          valorTotal: data.valorTotal,
          meioPagamento: data.meioPagamento,
          status: BookingStatus.CONFIRMADA,
          observacoes: data.observacoes,
        },
        include: {
          property: true,
          lead: true,
        },
      });

      await tx.cashFlow.create({
        data: {
          organizationId: data.organizationId,
          tipo: CashFlowType.RECEITA,
          categoria: "Aluguel Veraneio",
          descricao: cashFlowDescription,
          valor: data.valorTotal,
          dataVencimento: data.checkInDate,
          dataPagamento: new Date(),
          status: PaymentStatus.PAGO,
          meioPagamento: data.meioPagamento,
          bookingId: booking.id,
        },
      });

      return booking;
    });
  }
}
