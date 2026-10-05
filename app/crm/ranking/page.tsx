"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Calendar } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { BrokerRankItem, HighlightItem, GoalIncentive } from "@/components/crm/ranking/types";
import { GoalIncentiveCard } from "@/components/crm/ranking/GoalIncentiveCard";
import { BrokerOfTheMonthCard } from "@/components/crm/ranking/BrokerOfTheMonthCard";
import { HighlightsGrid } from "@/components/crm/ranking/HighlightsGrid";
import { RankingTable } from "@/components/crm/ranking/RankingTable";

const mockBrokers: BrokerRankItem[] = [
  {
    id: "b-1",
    posicao: 1,
    nome: "Lucas Santos",
    avatar: "L",
    cargo: "Corretor Sênior",
    vgv: 3650000,
    vendas: 4,
    visitas: 18,
    documentos: 6,
    captacoes: 5,
    compromissos: 22,
    taxaConversao: 28,
    leads: 45,
    aderenciaSla: 98.5,
  },
  {
    id: "b-2",
    posicao: 2,
    nome: "Mariana Oliveira",
    avatar: "M",
    cargo: "Corretora Plena",
    vgv: 2450000,
    vendas: 3,
    visitas: 15,
    documentos: 4,
    captacoes: 7,
    compromissos: 19,
    taxaConversao: 24,
    leads: 38,
    aderenciaSla: 96.0,
  },
  {
    id: "b-3",
    posicao: 3,
    nome: "Rafael Mendes",
    avatar: "R",
    cargo: "Especialista Meireles",
    vgv: 1850000,
    vendas: 2,
    visitas: 12,
    documentos: 3,
    captacoes: 3,
    compromissos: 14,
    taxaConversao: 20,
    leads: 30,
    aderenciaSla: 94.2,
  },
  {
    id: "b-4",
    posicao: 4,
    nome: "Patrícia Dantas",
    avatar: "P",
    cargo: "Corretora Associada",
    vgv: 1200000,
    vendas: 1,
    visitas: 9,
    documentos: 2,
    captacoes: 2,
    compromissos: 11,
    taxaConversao: 16,
    leads: 22,
    aderenciaSla: 92.0,
  },
  {
    id: "b-5",
    posicao: 5,
    nome: "Diego Barreto",
    avatar: "D",
    cargo: "Corretor Júnior",
    vgv: 950000,
    vendas: 1,
    visitas: 8,
    documentos: 1,
    captacoes: 2,
    compromissos: 9,
    taxaConversao: 14,
    leads: 18,
    aderenciaSla: 90.5,
  },
];

const mockHighlights: HighlightItem[] = [
  {
    titulo: "MAIS LEADS ATENDIDOS",
    icone: "leads",
    nome: "Lucas Santos",
    avatar: "L",
    metrica: "45",
    rotuloMetrica: "leads captados",
  },
  {
    titulo: "MAIS VISITAS REALIZADAS",
    icone: "visitas",
    nome: "Lucas Santos",
    avatar: "L",
    metrica: "18",
    rotuloMetrica: "visitas a decorados",
  },
  {
    titulo: "MAIS DOCUMENTAÇÕES",
    icone: "documentos",
    nome: "Lucas Santos",
    avatar: "L",
    metrica: "6",
    rotuloMetrica: "pastas aprovadas",
  },
  {
    titulo: "MAIS CAPTAÇÕES DE IMÓVEIS",
    icone: "captacoes",
    nome: "Mariana Oliveira",
    avatar: "M",
    metrica: "7",
    rotuloMetrica: "novas exclusividades",
  },
  {
    titulo: "MELHOR TAXA DE CONVERSÃO",
    icone: "taxa",
    nome: "Lucas Santos",
    avatar: "L",
    metrica: "28%",
    rotuloMetrica: "conversão geral",
  },
  {
    titulo: "MAIS COMPROMISSOS",
    icone: "compromissos",
    nome: "Lucas Santos",
    avatar: "L",
    metrica: "22",
    rotuloMetrica: "agendas cumpridas",
  },
];

const mockGoalIncentive: GoalIncentive = {
  titulo: "Campanha Acelera Platz — Q4",
  premio: "Viagem com Acompanhante para Resort em Porto das Dunas + iPhone 16 Pro",
  descricao: "Premiação exclusiva para corretores que atingirem o marco mínimo de 2 fechamentos de alto padrão.",
  objetivoMeta: 2,
  progressoAtual: 1,
  unidade: "Vendas",
  periodoValidade: "31/10/2026",
};

export default function RankingGamificacaoPage() {
  const { user, setActionMessage } = useCrm();
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>("b-1");
  const [activeGoal, setActiveGoal] = useState<GoalIncentive>(mockGoalIncentive);

  const isAdmin = user ? user.role === "ADMINISTRADOR" || user.role === "DIRETOR" || user.role === "GERENTE" : true;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("connect_platz_active_goal");
      if (saved) {
        setActiveGoal(JSON.parse(saved));
      }
    } catch (e) {
      // fallback silencioso
    }
  }, []);

  const handleUpdateGoal = (updated: GoalIncentive) => {
    setActiveGoal(updated);
    try {
      localStorage.setItem("connect_platz_active_goal", JSON.stringify(updated));
    } catch (e) {
      // fallback
    }
    setActionMessage(`Meta "${updated.titulo}" atualizada e ativada pelo Administrador!`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-platz-gold/15 border border-platz-gold/30 text-amber-600 dark:text-[#F8DA56]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Ranking & Gamificação
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Desempenho da equipe, metas de incentivo e reconhecimento dos campeões de vendas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1F2937] px-3 py-1.5 rounded-xl shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-connect-blue" />
          <span>Mês Vigente: Outubro / 2026</span>
        </div>
      </div>

      {/* 2. Bloco Metas e Incentivos */}
      <GoalIncentiveCard
        incentive={activeGoal}
        isAdmin={isAdmin}
        onUpdateIncentive={handleUpdateGoal}
      />

      {/* 3. Card Corretor do Mês com Coroa Animada e Anel Dourado */}
      <BrokerOfTheMonthCard
        brokers={mockBrokers}
        selectedBrokerId={selectedBrokerId}
        onSelectBroker={setSelectedBrokerId}
      />

      {/* 4. Grid 3x2 de Destaques */}
      <HighlightsGrid highlights={mockHighlights} />

      {/* 5. Tabela Completa com Tabs e 1º lugar Ouro com Coroa */}
      <RankingTable brokers={mockBrokers} />
    </div>
  );
}
