// app/api/rentals/route.ts
// Gestão e Validação de Aluguel Comum (Locação Tradicional Anual)
// Validação de contrato, garantia (caução, fiador, seguro-fiança), vigência e lançamentos mensais.

import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";
import { RLSUserContext } from "@/lib/db/rls";
import { PaymentStatus, CashFlowType, RentalContractStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { recordAudit } from "@/lib/services/audit-server";
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

const RentalContractSchema = z.object({
  propertyId: z.string().uuid("Selecione um imóvel válido."),
  leadId: z.string().uuid("Selecione um locatário válido."),
  valorAluguelMensal: z.number().positive("Valor do aluguel mensal deve ser maior que zero."),
  taxaAdministracaoPerc: z.number().min(0).max(100).default(10.0),
  diaVencimento: z.number().int().min(1).max(31).default(10),
  duracaoMeses: z.number().int().min(1).max(120).default(12),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de início inválida."),
  tipoGarantia: z.enum(["CAUCAO", "FIADOR", "SEGURO_FIANCA", "TITULO_CAPITALIZACAO"]).default("CAUCAO"),
  valorGarantia: z.number().nonnegative().optional(),
  observacoes: z.string().trim().max(5000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const context = getSessionContext(req);
    if (!context) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    if (
      context.role === "ADMINISTRADOR_VENDA" ||
      context.role === "FINANCEIRO_VENDA" ||
      context.role === "CORRETOR_VENDA"
    ) {
      return NextResponse.json(
        { error: "Acesso restrito ao departamento de Aluguel." },
        { status: 403 }
      );
    }

    const contracts = await prisma.rentalContract.findMany({
      where: { organizationId: context.organizationId },
      include: {
        property: { select: { id: true, nome: true, bairro: true, endereco: true } },
        lead: { select: { id: true, nome: true, telefone: true, email: true } },
        corretorTitular: { select: { id: true, nome: true } },
      },
      orderBy: { dataInicio: "desc" },
    });

    const serialized = contracts.map((c) => ({
      id: c.id,
      codigoContrato: c.codigoContrato,
      propertyId: c.propertyId,
      imovelNome: c.property?.nome || "Imóvel",
      imovelBairro: c.property?.bairro || null,
      locatarioNome: c.lead?.nome || "Locatário",
      locatarioTelefone: c.lead?.telefone || null,
      corretorNome: c.corretorTitular?.nome || "Corretor",
      valorAluguelMensal: Number(c.valorAluguelMensal),
      taxaAdministracaoPerc: Number(c.taxaAdministracaoPerc),
      taxaAdministracaoValor:
        (Number(c.valorAluguelMensal) * Number(c.taxaAdministracaoPerc)) / 100,
      diaVencimento: c.diaVencimento,
      duracaoMeses: c.duracaoMeses,
      dataInicio: c.dataInicio.toISOString().slice(0, 10),
      dataFim: c.dataFim.toISOString().slice(0, 10),
      tipoGarantia: c.tipoGarantia,
      valorGarantia: c.valorGarantia ? Number(c.valorGarantia) : null,
      status: c.status,
      contratoPdfUrl: c.contratoPdfUrl,
      observacoes: c.observacoes,
    }));

    return NextResponse.json({ contracts: serialized }, { status: 200 });
  } catch (error: any) {
    console.error("[RENTALS] Erro ao listar contratos de aluguel:", error);
    return NextResponse.json({ error: "Erro ao listar contratos de locação." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = getSessionContext(req);
    if (!context) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    if (
      context.role === "ADMINISTRADOR_VENDA" ||
      context.role === "FINANCEIRO_VENDA" ||
      context.role === "CORRETOR_VENDA"
    ) {
      return NextResponse.json(
        { error: "Acesso restrito ao departamento de Aluguel." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = RentalContractSchema.parse(body);

    const dataInicio = new Date(`${data.dataInicio}T00:00:00Z`);
    const dataFim = new Date(dataInicio);
    dataFim.setMonth(dataFim.getMonth() + data.duracaoMeses);

    const year = dataInicio.getUTCFullYear();
    const count = await prisma.rentalContract.count({
      where: {
        organizationId: context.organizationId,
        codigoContrato: { startsWith: `LOC-${year}-` },
      },
    });
    const codigoContrato = `LOC-${year}-${String(count + 1).padStart(3, "0")}`;

    const taxaAdmValor = (data.valorAluguelMensal * data.taxaAdministracaoPerc) / 100;

    const contract = await prisma.$transaction(async (tx) => {
      const created = await tx.rentalContract.create({
        data: {
          organizationId: context.organizationId,
          codigoContrato,
          propertyId: data.propertyId,
          leadId: data.leadId,
          corretorId: context.userId,
          valorAluguelMensal: data.valorAluguelMensal,
          taxaAdministracaoPerc: data.taxaAdministracaoPerc,
          diaVencimento: data.diaVencimento,
          duracaoMeses: data.duracaoMeses,
          dataInicio,
          dataFim,
          tipoGarantia: data.tipoGarantia,
          valorGarantia: data.valorGarantia ?? null,
          status: RentalContractStatus.ATIVO,
          observacoes: data.observacoes || null,
        },
      });

      // Lançamento da 1ª mensalidade de taxa de administração no fluxo de caixa (RECEITA)
      const vencimentoPrimeiraMensalidade = new Date(dataInicio);
      vencimentoPrimeiraMensalidade.setDate(data.diaVencimento);
      if (vencimentoPrimeiraMensalidade < dataInicio) {
        vencimentoPrimeiraMensalidade.setMonth(vencimentoPrimeiraMensalidade.getMonth() + 1);
      }

      await tx.cashFlow.create({
        data: {
          organizationId: context.organizationId,
          tipo: CashFlowType.RECEITA,
          categoria: "Taxa Administração Aluguel",
          descricao: `Taxa Adm ${codigoContrato} • Mensalidade 1/${data.duracaoMeses}`,
          valor: taxaAdmValor,
          dataVencimento: vencimentoPrimeiraMensalidade,
          status: PaymentStatus.PENDENTE,
          modalidade: "ALUGUEL",
          rentalContractId: created.id,
        },
      });

      return created;
    });

    await recordAudit({
      req,
      organizationId: context.organizationId,
      userId: context.userId,
      acao: "Contrato de Aluguel Firmado",
      tipoAcao: "CREATE",
      modulo: "TEMPORADA",
      entidade: "RentalContract",
      entidadeId: contract.id,
      entidadeNome: contract.codigoContrato,
      descricao: `Contrato de locação anual ${contract.codigoContrato} validado e firmado por ${context.role}.`,
    });

    return NextResponse.json({ success: true, contract }, { status: 201 });
  } catch (error: any) {
    console.error("[RENTALS] Erro ao cadastrar contrato:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao registrar contrato de aluguel." },
      { status: 500 }
    );
  }
}
