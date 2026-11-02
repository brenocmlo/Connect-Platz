// app/crm/ranking/tv/page.tsx
// Rota dedicada de tela cheia para o Modo TV / Sala de Vendas.

import { Metadata } from "next";
import { TvRankingContainer } from "@/components/crm/ranking/tv/TvRankingContainer";

export const metadata: Metadata = {
  title: "Modo TV — Sala de Vendas & Ranking | Connect Platz",
  description: "Painel de TV e War Room de vendas para projeção em telões de salas comerciais.",
};

export default function TvRankingPage() {
  return <TvRankingContainer />;
}
