import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { RLSUserContext } from "@/lib/db/rls";
import { CashFlowType, PaymentStatus } from "@prisma/client";

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

export async function GET(req: NextRequest) {
  try {
    const context = getSessionContext(req);
    if (!context) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    // Regra RLS: Apenas Administradores e Diretores acessam o ERP / Fluxo de Caixa
    if (!["ADMINISTRADOR", "DIRETOR"].includes(context.role)) {
      return NextResponse.json(
        { error: "Acesso negado: Visualização do ERP restrita à diretoria." },
        { status: 403 }
      );
    }

    const entries = await prisma.cashFlow.findMany({
      where: { organizationId: context.organizationId },
      orderBy: { dataVencimento: "desc" },
      take: 100,
    });

    // Calcular KPIs Financeiros
    let totalReceitasPagas = 0;
    let totalDespesasPagas = 0;
    let totalReceitasPendentes = 0;
    let totalDespesasPendentes = 0;

    for (const item of entries) {
      const val = Number(item.valor);
      if (item.tipo === CashFlowType.RECEITA) {
        if (item.status === PaymentStatus.PAGO) totalReceitasPagas += val;
        else if (item.status === PaymentStatus.PENDENTE) totalReceitasPendentes += val;
      } else {
        if (item.status === PaymentStatus.PAGO) totalDespesasPagas += val;
        else if (item.status === PaymentStatus.PENDENTE) totalDespesasPendentes += val;
      }
    }

    const saldoAtual = totalReceitasPagas - totalDespesasPagas;

    // DRE Gerencial Sintético
    const dre = {
      receitaBruta: totalReceitasPagas,
      custosVariaveisComissoes: totalDespesasPagas * 0.6, // Estimativa comissões
      margemContribuicao: totalReceitasPagas - totalDespesasPagas * 0.6,
      despesasOperacionais: totalDespesasPagas * 0.4,
      lucroLiquido: saldoAtual,
    };

    return NextResponse.json(
      {
        kpis: {
          saldoAtual,
          totalReceitasPagas,
          totalDespesasPagas,
          totalReceitasPendentes,
          totalDespesasPendentes,
        },
        dre,
        entries,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao consultar fluxo de caixa." },
      { status: 500 }
    );
  }
}
