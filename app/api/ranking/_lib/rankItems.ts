// app/api/ranking/_lib/rankItems.ts
// Montagem determinística do ranking e dos destaques por categoria.

import type { BrokerRankItem, HighlightItem, HighlightKey } from "@/components/crm/ranking/types";
import {
  UserMetrics,
  compareByPerformance,
  conversionRate,
  emptyMetrics,
  slaAdherence,
} from "@/app/api/dashboard/_lib/userMetrics";

export interface RankUser {
  id: string;
  nome: string;
  role: string;
  photoUrl: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  CORRETOR: "Corretor",
  GERENTE: "Gerente",
  DIRETOR: "Diretor",
  ADMINISTRADOR: "Administrador",
};

export function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return ((parts[0][0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Ordena (VGV, vendas, visitas, captações, nome) e numera as posições 1..n. */
export function buildRanking(
  users: RankUser[],
  metrics: Map<string, UserMetrics>,
  asManager = false
): BrokerRankItem[] {
  return users
    .map((u) => {
      const raw = metrics.get(u.id) || emptyMetrics();
      // Gerente é avaliado pelas vendas em que participa como gerente no split de comissão
      const m = asManager ? { ...raw, vgv: raw.vgvGerencia, vendas: raw.vendasGerencia } : raw;
      return { u, nome: u.nome, m };
    })
    .sort(compareByPerformance)
    .map(({ u, m }, idx) => ({
      id: u.id,
      posicao: idx + 1,
      nome: u.nome,
      avatar: initials(u.nome),
      photoUrl: u.photoUrl,
      cargo: ROLE_LABELS[u.role] || u.role,
      vgv: m.vgv,
      vendas: m.vendas,
      visitas: m.visitas,
      documentos: m.documentos,
      captacoes: m.captacoes,
      compromissos: m.compromissos,
      taxaConversao: conversionRate(m),
      leads: m.leads,
      aderenciaSla: slaAdherence(m),
      noPodio: m.vendas > 0 || m.vgv > 0,
    }));
}

const HIGHLIGHTS: { key: HighlightKey; titulo: string; rotulo: string; value: (b: BrokerRankItem) => number }[] = [
  { key: "leads", titulo: "Mais Leads", rotulo: "leads recebidos", value: (b) => b.leads },
  { key: "visitas", titulo: "Mais Visitas", rotulo: "visitas realizadas", value: (b) => b.visitas },
  { key: "documentos", titulo: "Mais Documentações", rotulo: "documentações concluídas", value: (b) => b.documentos },
  { key: "captacoes", titulo: "Mais Captações", rotulo: "captações em vendas", value: (b) => b.captacoes },
  { key: "taxa", titulo: "Melhor Taxa", rotulo: "de conversão", value: (b) => (b.leads > 0 ? b.taxaConversao : 0) },
  { key: "compromissos", titulo: "Mais Compromissos", rotulo: "compromissos concluídos", value: (b) => b.compromissos },
];

/** Destaque = maior valor da categoria; empate resolvido pela posição no ranking geral. */
export function buildHighlights(ranking: BrokerRankItem[]): HighlightItem[] {
  return HIGHLIGHTS.map((h) => {
    let best: BrokerRankItem | null = null;
    for (const b of ranking) {
      if (h.value(b) > 0 && (!best || h.value(b) > h.value(best))) best = b;
    }
    const value = best ? h.value(best) : 0;
    return {
      titulo: h.titulo,
      icone: h.key,
      nome: best?.nome ?? null,
      avatar: best?.avatar ?? "",
      metrica: h.key === "taxa" ? `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : String(value),
      rotuloMetrica: h.rotulo,
    };
  });
}
