import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { RLSUserContext } from "@/lib/db/rls";
import { PaymentMethod } from "@prisma/client";
import { container } from "@/lib/container";
import { z } from "zod";

function getSessionContext(req: NextRequest): RLSUserContext | null {
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("connect_platz_token")?.value;
  const token = authHeader?.replace("Bearer ", "") || cookieToken;

  if (!token) return null;
  const session = verifySessionToken(token);
  if (!session) return null;

  return {
    userId: session.userId,
    organizationId: session.organizationId,
    role: session.role,
  };
}

const BookingSchema = z.object({
  propertyId: z.string().uuid("Imóvel inválido"),
  leadId: z.string().uuid("Lead inválido"),
  checkInDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Data de check-in inválida"),
  checkOutDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Data de check-out inválida"),
  valorDiarias: z.number().positive("Valor das diárias deve ser maior que zero"),
  taxaLimpeza: z.number().default(0),
  meioPagamento: z.enum([
    PaymentMethod.PIX,
    PaymentMethod.CARTAO_CREDITO,
    PaymentMethod.CARTAO_DEBITO,
    PaymentMethod.BOLETO,
    PaymentMethod.TED,
  ]),
  observacoes: z.string().optional(),
});

/**
 * POST: Criação de Reserva de Veraneio (Temporada)
 * - Bloqueio automático de disponibilidade no calendário (prevenção de overbooking)
 * - Registro obrigatório de meio de pagamento
 * - Conciliação automática imediata no Módulo ERP / Fluxo de Caixa
 */
export async function POST(req: NextRequest) {
  try {
    const context = getSessionContext(req);
    if (!context) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const data = BookingSchema.parse(body);

    const booking = await container.createSeasonBookingUseCase.execute({
      organizationId: context.organizationId,
      propertyId: data.propertyId,
      leadId: data.leadId,
      corretorId: context.userId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      valorDiarias: data.valorDiarias,
      taxaLimpeza: data.taxaLimpeza,
      meioPagamento: data.meioPagamento,
      observacoes: data.observacoes,
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao registrar reserva de veraneio." },
      { status: 500 }
    );
  }
}
