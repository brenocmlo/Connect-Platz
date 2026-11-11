import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";
import { RLSUserContext } from "@/lib/db/rls";
import { PaymentMethod, BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { container } from "@/lib/container";
import { z } from "zod";

export const dynamic = "force-dynamic";

function getSessionContext(req: NextRequest): RLSUserContext | null {
  const session = getRequestSession(req);
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
 * GET: Listagem de Reservas de Temporada e Veraneio
 * Resolve o gargalo de dados persistidos no banco e no caixa, permitindo carregamento dinâmico no CRM.
 */
export async function GET(req: NextRequest) {
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
        { error: "Acesso restrito ao departamento de Aluguel e Locações. Vendas não pode acessar reservas." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    const bookings = await prisma.seasonBooking.findMany({
      where: {
        organizationId: context.organizationId,
        ...(statusParam ? { status: statusParam as BookingStatus } : {}),
      },
      include: {
        property: { select: { id: true, nome: true, bairro: true, endereco: true } },
        lead: { select: { id: true, nome: true, telefone: true, email: true } },
        corretor: { select: { id: true, nome: true } },
      },
      orderBy: { checkInDate: "desc" },
    });

    const isRentBroker = context.role === "CORRETOR_ALUGUEL";
    const serialized = bookings.map((b) => {
      const isOwnBooking = !isRentBroker || b.corretorId === context.userId;
      return {
        id: b.id,
        propertyId: b.propertyId,
        leadId: isOwnBooking ? b.leadId : null,
        imovelNome: b.property?.nome || "Imóvel",
        locatarioNome: isOwnBooking ? b.lead?.nome || "Hóspede" : "Reservado (Outro Corretor)",
        locatarioTelefone: isOwnBooking ? b.lead?.telefone || null : null,
        corretorNome: b.corretor?.nome || null,
        checkIn: b.checkInDate.toISOString().slice(0, 10),
        checkOut: b.checkOutDate.toISOString().slice(0, 10),
        diarias: b.totalNights,
        valorDiaria: Number(b.valorDiarias) / Math.max(1, b.totalNights),
        taxaLimpeza: Number(b.taxaLimpeza),
        valorTotal: Number(b.valorTotal),
        meioPagamento: b.meioPagamento,
        status: b.status,
        observacoes: isOwnBooking ? b.observacoes || null : null,
        createdAt: b.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ bookings: serialized }, { status: 200 });
  } catch (error: any) {
    console.error("[BOOKINGS] Erro ao listar reservas:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao listar reservas de veraneio." },
      { status: 500 }
    );
  }
}

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

    if (
      context.role === "ADMINISTRADOR_VENDA" ||
      context.role === "FINANCEIRO_VENDA" ||
      context.role === "CORRETOR_VENDA"
    ) {
      return NextResponse.json(
        { error: "Acesso restrito ao departamento de Aluguel e Locações. Vendas não pode alugar." },
        { status: 403 }
      );
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Dados da reserva inválidos." },
        { status: 400 }
      );
    }
    const message = String(error?.message || "");
    if (/overbooking|choque de disponibilidade/i.test(message)) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    if (/check-out|check-in|posterior|inval/i.test(message)) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json(
      { error: message || "Erro ao registrar reserva de veraneio." },
      { status: 500 }
    );
  }
}
