// app/api/financeiro/route.ts
// Fluxo de Caixa (ERP): listagem com KPIs reais e criação de lançamentos.
// Acesso exclusivo do ADMINISTRADOR. Sem dados de exemplo.

import { getAccount } from "@/lib/services/dre";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CashFlowType, PaymentStatus, Role, BusinessModality } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession, FINANCE_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { serializeCashFlow, parseDateOnly, paymentMethodValues } from "./shared";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireSession(req, FINANCE_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  const modalityFilter =
    session.role === Role.FINANCEIRO_VENDA
      ? "VENDA"
      : session.role === Role.FINANCEIRO_ALUGUEL
      ? "ALUGUEL"
      : undefined;

  try {
    const entries = await prisma.cashFlow.findMany({
      where: {
        organizationId: session.organizationId,
        status: { not: PaymentStatus.CANCELADO },
        ...(modalityFilter ? { modalidade: modalityFilter as BusinessModality } : {}),
      },
      orderBy: { dataVencimento: "desc" },
      take: 1000,
    });

    let receitasPagas = 0;
    let despesasPagas = 0;
    let receitasPendentes = 0;
    let despesasPendentes = 0;
    for (const item of entries) {
      const val = Number(item.valor);
      const pago = item.status === PaymentStatus.PAGO;
      if (item.tipo === CashFlowType.RECEITA) {
        if (pago) receitasPagas += val;
        else receitasPendentes += val;
      } else if (pago) despesasPagas += val;
      else despesasPendentes += val;
    }

    return NextResponse.json(
      {
        kpis: {
          saldoAtual: receitasPagas - despesasPagas,
          totalReceitasPagas: receitasPagas,
          totalDespesasPagas: despesasPagas,
          totalReceitasPendentes: receitasPendentes,
          totalDespesasPendentes: despesasPendentes,
        },
        entries: entries.map(serializeCashFlow),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[FINANCEIRO] Erro ao listar lançamentos:", error?.message);
    return NextResponse.json({ error: "Erro ao carregar o fluxo de caixa." }, { status: 500 });
  }
}

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD).");

const CreateSchema = z
  .object({
    tipo: z.enum(["RECEITA", "DESPESA"]),
    categoria: z.string().trim().min(2, "Informe a conta/categoria.").max(80),
    descricao: z.string().trim().min(3, "Informe a descrição.").max(300),
    valor: z.number().positive("O valor deve ser maior que zero."),
    dataVencimento: dateOnly,
    status: z.enum(["PENDENTE", "PAGO"]).default("PENDENTE"),
    dataPagamento: dateOnly.optional(),
    meioPagamento: z.enum(paymentMethodValues).nullable().optional(),
    isRecorrente: z.boolean().optional().default(false),
    modalidade: z.enum(["VENDA", "ALUGUEL"]).optional(),
  });

export async function POST(req: NextRequest) {
  const auth = requireSession(req, FINANCE_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados do lançamento inválidos." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const entryModality: BusinessModality =
    session.role === Role.FINANCEIRO_ALUGUEL
      ? "ALUGUEL"
      : session.role === Role.FINANCEIRO_VENDA
      ? "VENDA"
      : data.modalidade || "VENDA";

  try {
    const pago = data.status === "PAGO";
    const created = await prisma.cashFlow.create({
      data: {
        organizationId: session.organizationId,
        tipo: data.tipo as CashFlowType,
        categoria: data.categoria,
        descricao: data.descricao,
        valor: data.valor,
        dataVencimento: parseDateOnly(data.dataVencimento),
        status: pago ? PaymentStatus.PAGO : PaymentStatus.PENDENTE,
        dataPagamento: pago ? (data.dataPagamento ? parseDateOnly(data.dataPagamento) : new Date()) : null,
        meioPagamento: data.meioPagamento ?? null,
        isRecorrente: data.isRecorrente,
        centroCusto: getAccount(data.categoria, data.tipo).centroCustoPadrao,
        modalidade: entryModality,
      },
    });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Lançamento financeiro criado",
      tipoAcao: "CREATE",
      modulo: "FLUXO_DE_CAIXA",
      entidade: "CashFlow",
      entidadeId: created.id,
      entidadeNome: created.descricao,
      descricao: `${data.tipo === "RECEITA" ? "Receita" : "Despesa"} "${created.descricao}" de R$ ${data.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} lançada por ${session.nome}.`,
      dadosDepois: serializeCashFlow(created) as Record<string, unknown>,
    });

    return NextResponse.json({ entry: serializeCashFlow(created) }, { status: 201 });
  } catch (error: any) {
    console.error("[FINANCEIRO] Erro ao criar lançamento:", error);
    return NextResponse.json({ error: "Erro interno ao criar o lançamento." }, { status: 500 });
  }
}
