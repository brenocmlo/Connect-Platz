import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession, isAdmin } from "@/lib/auth/session";
import { buildLeadRLSWhere } from "@/lib/db/rls";
import { Role, CreditAnalysisStatus, PaymentMethod } from "@prisma/client";

const ActionSchema = z.object({
  action: z.enum([
    "SOLICITAR_FECHAMENTO",
    "CONFIRMAR_PAGAMENTO_RESERVA",
    "VALIDAR_CREDITO_BANCARIO",
    "FECHAR_RESERVA_DIRETA",
  ]),
  leadId: z.string().uuid("ID de lead inválido."),
  payload: z.record(z.any()),
});

/**
 * POST /api/extension/actions
 * Executa ações rápidas de negócio diretamente pelo WhatsApp Web de acordo com a Role do usuário.
 */
export async function POST(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const session = auth.session;

  try {
    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const { action, leadId, payload } = parsed.data;

    const rlsWhere = buildLeadRLSWhere({
      userId: session.userId,
      organizationId: session.organizationId,
      role: session.role,
    });

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, ...rlsWhere },
      include: { funnel: { include: { stages: true } } },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado ou acesso não autorizado." }, { status: 404 });
    }

    // 1. SOLICITAR FECHAMENTO (CORRETOR_VENDA ou ADMINISTRADOR)
    if (action === "SOLICITAR_FECHAMENTO") {
      if (session.role !== Role.CORRETOR_VENDA && !isAdmin(session.role)) {
        return NextResponse.json({ error: "Apenas corretores de venda ou administradores podem solicitar fechamento." }, { status: 403 });
      }

      const valor = payload.valorProposta ? ` Valor Proposta: R$ ${payload.valorProposta}.` : "";
      const obs = payload.observacoes ? ` Obs: ${payload.observacoes}` : "";

      await prisma.leadTimeline.create({
        data: {
          leadId: lead.id,
          tipo: "nota",
          conteudo: `[SOLICITAÇÃO DE FECHAMENTO] Corretor ${session.nome} solicitou formalização comercial ao setor Financeiro.${valor}${obs}`,
          userId: session.userId,
          metadata: { autorNome: session.nome, valorProposta: payload.valorProposta },
        },
      });

      // Mover para etapa de fechamento/proposta se existir no funil
      const targetStage = lead.funnel.stages.find((s) =>
        /fechamento|proposta|financeiro|contrato/i.test(s.nome)
      );
      if (targetStage && targetStage.id !== lead.stageId) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { stageId: targetStage.id },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Solicitação de fechamento enviada com sucesso ao setor Financeiro!",
      });
    }

    // 2. VALIDAR CRÉDITO BANCÁRIO (FINANCEIRO_VENDA ou ADMINISTRADOR)
    if (action === "VALIDAR_CREDITO_BANCARIO") {
      if (session.role !== Role.FINANCEIRO_VENDA && !isAdmin(session.role)) {
        return NextResponse.json({ error: "Apenas financeiro de vendas ou administradores podem aprovar crédito." }, { status: 403 });
      }

      const status = (payload.statusCredito as CreditAnalysisStatus) || CreditAnalysisStatus.APROVADO;
      const banco = payload.banco || "Banco Parceiro";

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          statusCredito: status,
          financialApprovalStatus: "APROVADO",
        },
      });

      await prisma.leadTimeline.create({
        data: {
          leadId: lead.id,
          tipo: "nota",
          conteudo: `[CRÉDITO APROVADO] Financeiro ${session.nome} aprovou o crédito do lead junto ao ${banco}.`,
          userId: session.userId,
          metadata: { autorNome: session.nome, banco },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Análise de crédito validada com sucesso!",
      });
    }

    // 3. CONFIRMAR PAGAMENTO DE RESERVA (FINANCEIRO_ALUGUEL ou ADMINISTRADOR)
    if (action === "CONFIRMAR_PAGAMENTO_RESERVA") {
      if (session.role !== Role.FINANCEIRO_ALUGUEL && !isAdmin(session.role)) {
        return NextResponse.json({ error: "Apenas financeiro de aluguel ou administradores podem confirmar pagamentos." }, { status: 403 });
      }

      const booking = await prisma.seasonBooking.findFirst({
        where: { leadId: lead.id, organizationId: session.organizationId },
        orderBy: { createdAt: "desc" },
      });

      if (booking) {
        await prisma.seasonBooking.update({
          where: { id: booking.id },
          data: { status: "CONFIRMADA" },
        });
      }

      await prisma.leadTimeline.create({
        data: {
          leadId: lead.id,
          tipo: "nota",
          conteudo: `[PAGAMENTO CONFIRMADO] Financeiro ${session.nome} confirmou o recebimento da reserva de temporada.`,
          userId: session.userId,
          metadata: { autorNome: session.nome },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Pagamento de reserva confirmado e voucher liberado!",
      });
    }

    // 4. FECHAR RESERVA DIRETA (CORRETOR_ALUGUEL ou ADMINISTRADOR)
    if (action === "FECHAR_RESERVA_DIRETA") {
      if (session.role !== Role.CORRETOR_ALUGUEL && !isAdmin(session.role)) {
        return NextResponse.json({ error: "Apenas corretores de aluguel ou administradores podem fechar reservas." }, { status: 403 });
      }

      const propertyId = payload.propertyId;
      if (!propertyId) {
        return NextResponse.json({ error: "Propriedade / Imóvel é obrigatório." }, { status: 400 });
      }

      const checkIn = new Date(payload.checkInDate);
      const checkOut = new Date(payload.checkOutDate);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const totalNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      const valorDiarias = Number(payload.valorDiarias || 0);
      const taxaLimpeza = Number(payload.taxaLimpeza || 0);
      const valorTotal = valorDiarias + taxaLimpeza;

      const booking = await prisma.seasonBooking.create({
        data: {
          organizationId: session.organizationId,
          leadId: lead.id,
          propertyId,
          corretorId: session.userId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          totalNights,
          valorDiarias,
          taxaLimpeza,
          valorTotal,
          meioPagamento: (payload.meioPagamento as PaymentMethod) || PaymentMethod.PIX,
          status: "CONFIRMADA",
          observacoes: payload.observacoes || "Reserva direta via WhatsApp Web",
        },
      });

      await prisma.leadTimeline.create({
        data: {
          leadId: lead.id,
          tipo: "nota",
          conteudo: `[RESERVA FECHADA] Corretor ${session.nome} confirmou reserva de temporada (Check-in: ${checkIn.toLocaleDateString("pt-BR")}, Check-out: ${checkOut.toLocaleDateString("pt-BR")}, Total: R$ ${valorTotal.toFixed(2)}).`,
          userId: session.userId,
          metadata: { autorNome: session.nome, bookingId: booking.id },
        },
      });

      return NextResponse.json({
        success: true,
        bookingId: booking.id,
        message: "Reserva de temporada confirmada com sucesso!",
      });
    }

    return NextResponse.json({ error: "Ação não suportada." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao executar ação.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
