// app/api/bookings/[id]/route.ts
// Edição e cancelamento de reservas de veraneio / temporada com liberação de datas e sincronização no ERP.

import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";
import { RLSUserContext } from "@/lib/db/rls";
import { PaymentMethod, BookingStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { recordAudit } from "@/lib/services/audit-server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSessionContext(req: NextRequest): RLSUserContext | null {
  const session = getRequestSession(req);
  if (!session) return null;
  return {
    userId: session.userId,
    organizationId: session.organizationId,
    role: session.role,
  };
}

const PatchBookingSchema = z.object({
  checkInDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Data de check-in inválida").optional(),
  checkOutDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Data de check-out inválida").optional(),
  valorDiarias: z.number().positive("Valor das diárias deve ser positivo").optional(),
  taxaLimpeza: z.number().nonnegative().optional(),
  meioPagamento: z.nativeEnum(PaymentMethod).optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  observacoes: z.string().trim().max(2000).optional().nullable(),
});

/**
 * PATCH /api/bookings/[id]
 * Edita check-in, check-out, diárias ou status (cancelada libera o calendário para evitar overbooking).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = getSessionContext(req);
    if (!context) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    if (
      context.role === "ADMINISTRADOR_VENDA" ||
      context.role === "FINANCEIRO_VENDA" ||
      context.role === "CORRETOR_VENDA"
    ) {
      return NextResponse.json(
        { error: "Acesso restrito ao departamento de Aluguel e Locações. Vendas não pode alterar reservas." },
        { status: 403 }
      );
    }

    if (!UUID_RE.test(params.id)) {
      return NextResponse.json({ error: "Identificador de reserva inválido." }, { status: 400 });
    }

    const booking = await prisma.seasonBooking.findFirst({
      where: { id: params.id, organizationId: context.organizationId },
      include: {
        property: { select: { nome: true } },
        lead: { select: { nome: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva de temporada não encontrada." }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const parsed = PatchBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const newCheckIn = input.checkInDate ? new Date(input.checkInDate) : booking.checkInDate;
    const newCheckOut = input.checkOutDate ? new Date(input.checkOutDate) : booking.checkOutDate;

    if (newCheckOut <= newCheckIn) {
      return NextResponse.json(
        { error: "A data de check-out deve ser posterior à data de check-in." },
        { status: 400 }
      );
    }

    // Checagem de choque de datas (Overbooking) caso as datas mudem ou reative
    const targetStatus = input.status ?? booking.status;
    if (targetStatus !== BookingStatus.CANCELADA) {
      const conflicting = await prisma.seasonBooking.findFirst({
        where: {
          id: { not: booking.id },
          propertyId: booking.propertyId,
          status: { not: BookingStatus.CANCELADA },
          AND: [
            { checkInDate: { lt: newCheckOut } },
            { checkOutDate: { gt: newCheckIn } },
          ],
        },
      });

      if (conflicting) {
        return NextResponse.json(
          {
            error:
              "Choque de disponibilidade (Overbooking): O imóvel já possui outra reserva confirmada para este período.",
          },
          { status: 409 }
        );
      }
    }

    const nights = Math.ceil((newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24));
    const valorDiarias = input.valorDiarias ?? Number(booking.valorDiarias);
    const taxaLimpeza = input.taxaLimpeza ?? Number(booking.taxaLimpeza);
    const valorTotal = valorDiarias + taxaLimpeza;

    const updated = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.seasonBooking.update({
        where: { id: booking.id },
        data: {
          checkInDate: newCheckIn,
          checkOutDate: newCheckOut,
          totalNights: nights,
          valorDiarias,
          taxaLimpeza,
          valorTotal,
          ...(input.meioPagamento ? { meioPagamento: input.meioPagamento } : {}),
          ...(input.status ? { status: input.status } : {}),
          ...(input.observacoes !== undefined ? { observacoes: input.observacoes } : {}),
        },
      });

      // Sincroniza com Fluxo de Caixa (se cancelado, cancela título; se editado valor, atualiza)
      if (input.status === BookingStatus.CANCELADA) {
        await tx.cashFlow.updateMany({
          where: { bookingId: booking.id },
          data: { status: PaymentStatus.CANCELADO },
        });
      } else {
        await tx.cashFlow.updateMany({
          where: { bookingId: booking.id },
          data: {
            valor: valorTotal,
            dataVencimento: newCheckIn,
            descricao: `Locação Temporada - Hospedagem ${nights} noites (${input.meioPagamento || booking.meioPagamento})`,
          },
        });
      }

      return updatedBooking;
    });

    await recordAudit({
      req,
      organizationId: context.organizationId,
      userId: context.userId,
      acao: input.status === BookingStatus.CANCELADA ? "Cancelamento de Reserva" : "Edição de Reserva",
      tipoAcao: input.status === BookingStatus.CANCELADA ? "STATUS_CHANGE" : "UPDATE",
      modulo: "TEMPORADA",
      entidade: "SeasonBooking",
      entidadeId: booking.id,
      entidadeNome: `${booking.property?.nome || "Imóvel"} • ${booking.lead?.nome || "Hóspede"}`,
      descricao:
        input.status === BookingStatus.CANCELADA
          ? `Reserva de temporada cancelada por ${context.role}. Calendário liberado e prevenção de overbooking mantida.`
          : `Reserva de temporada editada (${nights} diárias).`,
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    console.error("[BOOKINGS] Erro ao atualizar reserva:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno ao atualizar reserva." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bookings/[id]
 * Exclui ou cancela a reserva definitivamente do sistema.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = getSessionContext(req);
    if (!context) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    if (
      context.role === "ADMINISTRADOR_VENDA" ||
      context.role === "FINANCEIRO_VENDA" ||
      context.role === "CORRETOR_VENDA"
    ) {
      return NextResponse.json(
        { error: "Acesso restrito ao departamento de Aluguel e Locações." },
        { status: 403 }
      );
    }

    if (!UUID_RE.test(params.id)) {
      return NextResponse.json({ error: "Identificador de reserva inválido." }, { status: 400 });
    }

    const booking = await prisma.seasonBooking.findFirst({
      where: { id: params.id, organizationId: context.organizationId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva não encontrada." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.cashFlow.deleteMany({ where: { bookingId: booking.id } });
      await tx.seasonBooking.delete({ where: { id: booking.id } });
    });

    return NextResponse.json({ success: true, message: "Reserva excluída com sucesso." });
  } catch (error: any) {
    console.error("[BOOKINGS] Erro ao excluir reserva:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno ao excluir reserva." },
      { status: 500 }
    );
  }
}
