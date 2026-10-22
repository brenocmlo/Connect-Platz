// app/api/vendas/serialize.ts
// Formatação das vendas do banco para o shape usado pela tela de Vendas e Comissões.

import { Prisma, PaymentStatus } from "@prisma/client";
import { BENEFICIARY_LABEL } from "@/components/crm/vendas/saleSplitHelper";

export const saleInclude = {
  corretorTitular: { select: { id: true, nome: true } },
  property: { select: { id: true, nome: true, construtora: true } },
  unit: { select: { id: true, numeroUnidade: true, bloco: true } },
  lead: { select: { id: true, nome: true } },
  commissionSplits: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.SaleInclude;

export type SaleWithRelations = Prisma.SaleGetPayload<{ include: typeof saleInclude }>;

const fmtDate = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Descrição determinística do lançamento de repasse (DESPESA) vinculado a um split. */
export function splitCashFlowDescription(tipo: string, nome: string, codigoVenda: string) {
  return `Repasse ${BENEFICIARY_LABEL[tipo] || tipo} — ${nome} • ${codigoVenda}`;
}

/** Status de comissão da venda a partir dos splits de participantes (exclui a parcela da imobiliária). */
export function computeStatusComissao(splits: { beneficiarioTipo: string; status: PaymentStatus }[]) {
  const payouts = splits.filter((s) => s.beneficiarioTipo !== "IMOBILIARIA" && s.status !== "CANCELADO");
  if (payouts.length === 0) return "pendente";
  const pagos = payouts.filter((s) => s.status === "PAGO").length;
  if (pagos === payouts.length) return "paga";
  return pagos > 0 ? "parcial" : "pendente";
}

export function serializeSale(s: SaleWithRelations) {
  const splits = s.commissionSplits;
  const comissaoTotal = Number(s.valorComissaoTotal);
  // Imposto = comissão bruta − soma de todos os splits (participantes + imobiliária)
  const somaSplits = splits.reduce((acc, sp) => acc + Number(sp.valor), 0);
  const impostoValor = splits.length > 0 ? Math.max(0, round2(comissaoTotal - somaSplits)) : 0;
  const nameOf = (tipo: string) => splits.find((sp) => sp.beneficiarioTipo === tipo)?.nomeBeneficiario;

  const pendentes = splits
    .filter((sp) => sp.status === PaymentStatus.PENDENTE)
    .sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime());

  return {
    id: s.id,
    codigoVenda: s.codigoVenda,
    imovelNome: s.property?.nome || "—",
    construtora: s.property?.construtora || null,
    unidadeNumero: s.unit ? `${s.unit.numeroUnidade}${s.unit.bloco ? ` (${s.unit.bloco})` : ""}` : null,
    compradorNome: s.lead?.nome || "—",
    corretorId: s.corretorId,
    corretorTitular: s.corretorTitular?.nome || nameOf("CORRETOR_TITULAR") || "—",
    segundoCorretor: nameOf("CO_CORRETOR"),
    gerente: nameOf("GERENTE"),
    gestor: nameOf("DIRETOR"),
    captador: nameOf("CAPTACAO"),
    dataVenda: fmtDate(s.dataVenda),
    dataVendaIso: isoDate(s.dataVenda),
    vgv: Number(s.valorVendaVGV),
    valorAvaliacao: s.valorAvaliacao != null ? Number(s.valorAvaliacao) : null,
    comissaoTotal,
    percentualComissao: Number(s.percentualComissao),
    impostoValor,
    impostoPercentual: comissaoTotal > 0 ? round2((impostoValor / comissaoTotal) * 100) : 0,
    proximoPagamento: pendentes[0] ? fmtDate(pendentes[0].dataVencimento) : null,
    meioPagamento: s.meioPagamento,
    status: s.status,
    statusComissao: s.statusComissao,
    splits: splits.map((sp) => ({
      id: sp.id,
      beneficiario: sp.nomeBeneficiario,
      categoria: BENEFICIARY_LABEL[sp.beneficiarioTipo] || sp.beneficiarioTipo,
      tipo: sp.beneficiarioTipo,
      userId: sp.userId,
      percentual: sp.percentual != null ? Number(sp.percentual) : 0,
      valor: Number(sp.valor),
      status: sp.status,
      pix: sp.documentoPix || undefined,
      dataVencimento: fmtDate(sp.dataVencimento),
      dataPagamento: sp.dataPagamento ? fmtDate(sp.dataPagamento) : null,
    })),
  };
}
