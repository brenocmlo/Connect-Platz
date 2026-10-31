// app/api/vendas/leadSync.ts
// Sincronização automática entre fechamento de venda e o funil Kanban do Lead.

import { Prisma } from "@prisma/client";

interface SyncLeadSaleParams {
  tx: Prisma.TransactionClient;
  leadId: string;
  userId: string;
  saleId: string;
  codigoVenda: string;
  propertyName: string;
  vgv: number;
  comissaoBruta: number;
}

/**
 * Ao registrar ou fechar uma venda, sincroniza o lead com o funil:
 * 1. Move o lead para a etapa de "Ganho" / "Fechado" do seu funil (se não estiver nela).
 * 2. Zera estouro de SLA.
 * 3. Registra na timeline do lead o fechamento da venda.
 */
export async function syncLeadSaleCompletion({
  tx,
  leadId,
  userId,
  saleId,
  codigoVenda,
  propertyName,
  vgv,
  comissaoBruta,
}: SyncLeadSaleParams) {
  const lead = await tx.lead.findUnique({
    where: { id: leadId },
    include: {
      funnel: {
        include: { stages: { orderBy: { posicao: "asc" } } },
      },
      stage: true,
    },
  });

  if (!lead) return;

  // Localiza a etapa de fechamento/ganho do funil
  const winStage =
    lead.funnel.stages.find((st) => /vend|fechad|ganh/i.test(st.nome)) ||
    lead.funnel.stages[lead.funnel.stages.length - 1];

  if (winStage && lead.stageId !== winStage.id) {
    await tx.lead.update({
      where: { id: leadId },
      data: {
        stageId: winStage.id,
        slaBreached: false,
        financialApprovalStatus: "APROVADO",
      },
    });
  } else {
    await tx.lead.update({
      where: { id: leadId },
      data: {
        financialApprovalStatus: "APROVADO",
      },
    });
  }

  const vgvFmt = vgv.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  const etapaMsg = winStage && winStage.id !== lead.stageId ? ` • Lead movido para "${winStage.nome}"` : "";

  await tx.leadTimeline.create({
    data: {
      leadId,
      userId,
      tipo: "venda",
      conteudo: `Venda ${codigoVenda} registrada com sucesso (${propertyName} • VGV R$ ${vgvFmt})${etapaMsg}.`,
      metadata: {
        saleId,
        codigoVenda,
        vgv,
        comissaoBruta,
      },
    },
  });
}
