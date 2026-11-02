// app/api/ranking/tv/tvKpiHelper.ts
// Utilitários de consolidação de KPIs e taxas de conversão para o Modo TV.

import type { TvHeaderKpis } from "@/components/crm/ranking/tv/types";

export interface TvUserSummary {
  id: string;
  nome: string;
  photoUrl: string | null;
}

export interface ComputeKpisParams {
  totalVgvSemana: number;
  totalVendasSemana: number;
  totalAnalises: number;
  totalAprovacoes: number;
  totalCorretoresAtivos: number;
  users: TvUserSummary[];
  brokerVendas: Map<string, { vd: number; vgv: number }>;
  brokerAprovacoes: Map<string, { hoje: number; mes: number }>;
  brokerAnalises: Map<string, { hoje: number; mes: number }>;
}

export function computeTvKpis(params: ComputeKpisParams): TvHeaderKpis {
  const {
    totalVgvSemana,
    totalVendasSemana,
    totalAnalises,
    totalAprovacoes,
    totalCorretoresAtivos,
    users,
    brokerVendas,
    brokerAprovacoes,
    brokerAnalises,
  } = params;

  const ticketMedio =
    totalVendasSemana > 0 ? Math.round(totalVgvSemana / totalVendasSemana) : 0;

  const taxaConversaoAnaliseAprovacao =
    totalAnalises > 0 ? Number(((totalAprovacoes / totalAnalises) * 100).toFixed(1)) : 0;

  const taxaConversaoAprovacaoVenda =
    totalAprovacoes > 0 ? Number(((totalVendasSemana / totalAprovacoes) * 100).toFixed(1)) : 0;

  const ipc =
    totalCorretoresAtivos > 0
      ? Number((totalVendasSemana / totalCorretoresAtivos).toFixed(2))
      : 0;

  let corretoresProdutivosQtd = 0;
  for (const u of users) {
    const vd = brokerVendas.get(u.id)?.vd || 0;
    const ap = brokerAprovacoes.get(u.id)?.mes || 0;
    const an = brokerAnalises.get(u.id)?.mes || 0;
    if (vd > 0 || ap > 0 || an > 0) corretoresProdutivosQtd += 1;
  }

  const corretoresProdutivosPct =
    totalCorretoresAtivos > 0
      ? Number(((corretoresProdutivosQtd / totalCorretoresAtivos) * 100).toFixed(1))
      : 0;

  return {
    vgvTotal: totalVgvSemana,
    ticketMedio,
    analisesTotal: totalAnalises,
    aprovacoesTotal: totalAprovacoes,
    taxaConversaoAnaliseAprovacao,
    vendasTotal: totalVendasSemana,
    taxaConversaoAprovacaoVenda,
    ipc,
    totalCorretoresAtivos,
    corretoresProdutivosPct,
    corretoresProdutivosQtd,
  };
}
