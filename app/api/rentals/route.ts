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

function serializeRentalContract(c: any) {
  const valorAluguel = Number(c.valorAluguelMensal);
  const taxaPerc = Number(c.taxaAdministracaoPerc);
  return {
    id: c.id,
    codigoContrato: c.codigoContrato,
    propertyId: c.propertyId,
    imovelNome: c.property?.nome || "Imóvel",
    imovelBairro: c.property?.bairro || null,
    locatarioNome: c.lead?.nome || "Locatário",
    locatarioTelefone: c.lead?.telefone || null,
    corretorNome: c.corretorTitular?.nome || "Corretor",
    valorAluguelMensal: valorAluguel,
    taxaAdministracaoPerc: taxaPerc,
    taxaAdministracaoValor: (valorAluguel * taxaPerc) / 100,
    diaVencimento: c.diaVencimento,
    duracaoMeses: c.duracaoMeses,
    dataInicio: c.dataInicio.toISOString().slice(0, 10),
    dataFim: c.dataFim.toISOString().slice(0, 10),
    tipoGarantia: c.tipoGarantia,
    valorGarantia: c.valorGarantia ? Number(c.valorGarantia) : null,
    status: c.status,
    contratoPdfUrl: c.contratoPdfUrl ?? null,
    observacoes: c.observacoes,
  };
}

function buildMonthlyCashFlowEntries(contract: {
  id: string;
  organizationId: string;
  codigoContrato: string;
  dataInicio: Date;
  diaVencimento: number;
  duracaoMeses: number;
  taxaAdmValor: number;
}) {
  const vencimentoBase = new Date(contract.dataInicio);
  vencimentoBase.setUTCDate(contract.diaVencimento);
  if (vencimentoBase < contract.dataInicio) {
    vencimentoBase.setUTCMonth(vencimentoBase.getUTCMonth() + 1);
  }
  return Array.from({ length: contract.duracaoMeses }, (_, idx) => {
    const vencimentoMes = new Date(vencimentoBase);
    vencimentoMes.setUTCMonth(vencimentoBase.getUTCMonth() + idx);
    return {
      organizationId: contract.organizationId,
      tipo: CashFlowType.RECEITA,
      categoria: "Taxa Administração Aluguel",
      descricao: `Taxa Adm ${contract.codigoContrato} • Mensalidade ${idx + 1}/${contract.duracaoMeses}`,
      valor: contract.taxaAdmValor,
      dataVencimento: vencimentoMes,
      status: PaymentStatus.PENDENTE,
      modalidade: "ALUGUEL" as const,
      rentalContractId: contract.id,
    };
  });
}

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
      where: {
        organizationId: context.organizationId,
        ...(context.role === "CORRETOR_ALUGUEL" ? { corretorId: context.userId } : {}),
      },
      include: {
        property: { select: { id: true, nome: true, bairro: true, endereco: true } },
        lead: { select: { id: true, nome: true, telefone: true, email: true } },
        corretorTitular: { select: { id: true, nome: true } },
      },
      orderBy: { dataInicio: "desc" },
    });

    const serialized = contracts.map(serializeRentalContract);

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
    const initialStatus =
      context.role === "CORRETOR_ALUGUEL"
        ? RentalContractStatus.PENDENTE_APROVACAO
        : RentalContractStatus.ATIVO;

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
          status: initialStatus,
          observacoes: data.observacoes || null,
        },
        include: {
          property: { select: { id: true, nome: true, bairro: true, endereco: true } },
          lead: { select: { id: true, nome: true, telefone: true, email: true } },
          corretorTitular: { select: { id: true, nome: true } },
        },
      });

      if (initialStatus === RentalContractStatus.ATIVO) {
        await tx.cashFlow.createMany({
          data: buildMonthlyCashFlowEntries({
            id: created.id,
            organizationId: context.organizationId,
            codigoContrato,
            dataInicio,
            diaVencimento: data.diaVencimento,
            duracaoMeses: data.duracaoMeses,
            taxaAdmValor,
          }),
        });
      }

      return created;
    });

    await recordAudit({
      req,
      organizationId: context.organizationId,
      userId: context.userId,
      acao:
        initialStatus === RentalContractStatus.PENDENTE_APROVACAO
          ? "Contrato de Aluguel Enviado para Validação"
          : "Contrato de Aluguel Firmado",
      tipoAcao: "CREATE",
      modulo: "LOCACAO",
      entidade: "RentalContract",
      entidadeId: contract.id,
      entidadeNome: contract.codigoContrato,
      descricao: `Contrato de locação ${contract.codigoContrato} registrado (${initialStatus}) por ${context.role}.`,
      dadosDepois: { status: contract.status, valorAluguelMensal: data.valorAluguelMensal },
    });

    return NextResponse.json(
      { success: true, contract: serializeRentalContract(contract) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[RENTALS] Erro ao cadastrar contrato:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao registrar contrato de aluguel." },
      { status: 500 }
    );
  }
}

const PatchRentalSchema = z.object({
  id: z.string().uuid("Identificador do contrato inválido."),
  status: z.nativeEnum(RentalContractStatus).optional(),
  valorAluguelMensal: z.number().positive().optional(),
  taxaAdministracaoPerc: z.number().min(0).max(100).optional(),
  diaVencimento: z.number().int().min(1).max(31).optional(),
  observacoes: z.string().trim().max(5000).optional().nullable(),
});

export async function PATCH(req: NextRequest) {
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
    const input = PatchRentalSchema.parse(body);

    if (input.status === RentalContractStatus.ATIVO && context.role === "CORRETOR_ALUGUEL") {
      return NextResponse.json(
        { error: "Apenas o Financeiro ou Administrador de Aluguel pode validar ou reativar contratos." },
        { status: 403 }
      );
    }

    const existing = await prisma.rentalContract.findFirst({
      where: {
        id: input.id,
        organizationId: context.organizationId,
        ...(context.role === "CORRETOR_ALUGUEL" ? { corretorId: context.userId } : {}),
      },
      include: {
        property: { select: { id: true, nome: true, bairro: true } },
        lead: { select: { id: true, nome: true, telefone: true } },
        corretorTitular: { select: { id: true, nome: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Contrato de locação não encontrado." }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const nextContract = await tx.rentalContract.update({
        where: { id: existing.id },
        data: {
          ...(input.status ? { status: input.status } : {}),
          ...(input.valorAluguelMensal !== undefined ? { valorAluguelMensal: input.valorAluguelMensal } : {}),
          ...(input.taxaAdministracaoPerc !== undefined ? { taxaAdministracaoPerc: input.taxaAdministracaoPerc } : {}),
          ...(input.diaVencimento !== undefined ? { diaVencimento: input.diaVencimento } : {}),
          ...(input.observacoes !== undefined ? { observacoes: input.observacoes } : {}),
        },
        include: {
          property: { select: { id: true, nome: true, bairro: true } },
          lead: { select: { id: true, nome: true, telefone: true } },
          corretorTitular: { select: { id: true, nome: true } },
        },
      });

      if (input.status === RentalContractStatus.CANCELADO) {
        await tx.cashFlow.updateMany({
          where: { rentalContractId: existing.id, status: PaymentStatus.PENDENTE },
          data: { status: PaymentStatus.CANCELADO },
        });
      } else if (input.status === RentalContractStatus.ATIVO) {
        if (existing.status === RentalContractStatus.CANCELADO) {
          await tx.cashFlow.updateMany({
            where: { rentalContractId: existing.id, status: PaymentStatus.CANCELADO },
            data: { status: PaymentStatus.PENDENTE },
          });
        }
        const cfCount = await tx.cashFlow.count({ where: { rentalContractId: existing.id } });
        if (cfCount === 0) {
          const taxaAdmValor = (Number(nextContract.valorAluguelMensal) * Number(nextContract.taxaAdministracaoPerc)) / 100;
          await tx.cashFlow.createMany({
            data: buildMonthlyCashFlowEntries({
              id: nextContract.id,
              organizationId: context.organizationId,
              codigoContrato: nextContract.codigoContrato,
              dataInicio: nextContract.dataInicio,
              diaVencimento: nextContract.diaVencimento,
              duracaoMeses: nextContract.duracaoMeses,
              taxaAdmValor,
            }),
          });
        }
      }

      return nextContract;
    });

    await recordAudit({
      req,
      organizationId: context.organizationId,
      userId: context.userId,
      acao:
        input.status === RentalContractStatus.CANCELADO
          ? "Contrato de Aluguel Cancelado"
          : input.status === RentalContractStatus.ATIVO && existing.status === RentalContractStatus.PENDENTE_APROVACAO
          ? "Contrato de Aluguel Validado"
          : input.status === RentalContractStatus.ATIVO && existing.status === RentalContractStatus.CANCELADO
          ? "Contrato de Aluguel Reativado"
          : "Contrato de Aluguel Atualizado",
      tipoAcao: input.status && input.status !== existing.status ? "STATUS_CHANGE" : "UPDATE",
      modulo: "LOCACAO",
      entidade: "RentalContract",
      entidadeId: updated.id,
      entidadeNome: updated.codigoContrato,
      descricao: `Contrato de locação ${updated.codigoContrato} alterado de ${existing.status} para ${updated.status} por ${context.role}.`,
      dadosAntes: { status: existing.status, valorAluguelMensal: Number(existing.valorAluguelMensal) },
      dadosDepois: { status: updated.status, valorAluguelMensal: Number(updated.valorAluguelMensal) },
    });

    return NextResponse.json({
      success: true,
      contract: serializeRentalContract(updated),
    });
  } catch (error: any) {
    console.error("[RENTALS] Erro ao atualizar contrato:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao atualizar contrato de locação." },
      { status: 500 }
    );
  }
}
