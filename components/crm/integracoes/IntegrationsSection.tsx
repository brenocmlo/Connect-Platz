"use client";

import React, { useState } from "react";
import { Search, Layers, CheckCircle2, RefreshCw } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { IntegrationItem } from "./types";
import { IntegrationCard } from "./IntegrationCard";

const initialIntegrations: IntegrationItem[] = [
  {
    id: "meta-ads",
    nome: "Meta Ads (Facebook & Instagram)",
    descricao: "Captação automática de leads em tempo real dos formulários de cadastro do Facebook e Instagram.",
    categoria: "Mídia Paga",
    status: "Conectado",
    logo: "meta",
    ativo: true,
    contaConectada: "Connect Platz Imóveis (ID: 104928349284)",
    ultimaSincronizacao: "Hoje às 18:55",
    leadsRecebidos: 248,
    acaoPendente: "1 formulário novo detectado no Gerenciador de Anúncios precisa de validação de campos.",
    regras: {
      distribuicao: "roleta",
      etapaInicial: "Novo Lead",
    },
  },
  {
    id: "google-ads",
    nome: "Google Ads (Lead Extension)",
    descricao: "Sincronização de leads captados através de extensões de formulário da rede de pesquisa e campanhas Discovery.",
    categoria: "Mídia Paga",
    status: "Conectado",
    logo: "google",
    ativo: true,
    contaConectada: "MCC Platz Imobiliária (089-234-1122)",
    ultimaSincronizacao: "Hoje às 17:30",
    leadsRecebidos: 112,
    regras: {
      distribuicao: "roleta",
      etapaInicial: "Novo Lead",
    },
  },
  {
    id: "grupo-olx",
    nome: "Grupo OLX (Zap Imóveis & Viva Real)",
    descricao: "Integração via Carga XML e Webhook oficial para receber contatos dos maiores portais imobiliários do Brasil.",
    categoria: "Portais Imobiliários",
    status: "Plugin Oficial",
    logo: "olx",
    ativo: true,
    contaConectada: "Credencial Portal ID #884920",
    ultimaSincronizacao: "Hoje às 18:20",
    leadsRecebidos: 184,
    regras: {
      distribuicao: "roleta",
      etapaInicial: "Novo Lead",
    },
  },
  {
    id: "dream-casa",
    nome: "Dream Casa",
    descricao: "Recebimento direto de propostas e solicitações de visitas do portal Dream Casa.",
    categoria: "Portais Imobiliários",
    status: "Conectado",
    logo: "dreamcasa",
    ativo: true,
    contaConectada: "Chave API Ativa",
    ultimaSincronizacao: "Ontem às 21:00",
    leadsRecebidos: 45,
    regras: {
      distribuicao: "fila_geral",
      etapaInicial: "Novo Lead",
    },
  },
  {
    id: "chaves-na-mao",
    nome: "Chaves na Mão",
    descricao: "Portal especializado em imóveis na planta e lançamentos com disparo direto para o funil.",
    categoria: "Portais Imobiliários",
    status: "Disponível",
    logo: "chavesnamao",
    ativo: false,
    regras: {
      distribuicao: "roleta",
      etapaInicial: "Novo Lead",
    },
  },
  {
    id: "landing-page",
    nome: "Landing Page Oficial (WordPress & Elementor)",
    descricao: "Captura de leads das landing pages de lançamentos, formulários customizados e catálogos.",
    categoria: "Site e Landing Pages",
    status: "Plugin Oficial",
    logo: "wordpress",
    ativo: true,
    contaConectada: "https://connectplatz.com.br",
    ultimaSincronizacao: "Hoje às 19:04",
    leadsRecebidos: 320,
    regras: {
      distribuicao: "roleta",
      etapaInicial: "Novo Lead",
    },
  },
  {
    id: "api-webhooks",
    nome: "API & Webhooks Customizados",
    descricao: "Endpoint RESTful para conexão com ferramentas externas, n8n, Make e sistemas legados de construtoras.",
    categoria: "Desenvolvimento",
    status: "Avançado",
    logo: "webhook",
    ativo: true,
    contaConectada: "Token JWT emitido para Produção",
    ultimaSincronizacao: "Hoje às 19:10",
    leadsRecebidos: 89,
    regras: {
      distribuicao: "roleta",
      etapaInicial: "Novo Lead",
    },
  },
];

export function IntegrationsSection() {
  const { setActionMessage } = useCrm();
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(initialIntegrations);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const handleToggleActive = (id: string, active: boolean) => {
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ativo: active } : item))
    );
    setActionMessage(
      active
        ? "Integração ativada: recebendo leads automaticamente."
        : "Integração pausada temporariamente."
    );
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleSyncNow = (id: string) => {
    setActionMessage("Sincronização executada com sucesso! Todos os leads estão atualizados.");
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Disponível", ativo: false } : item
      )
    );
    setActionMessage("Integração desconectada com segurança.");
    setTimeout(() => setActionMessage(null), 3500);
  };

  const filteredIntegrations = integrations.filter((item) => {
    const matchesSearch =
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || item.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalConnected = integrations.filter((i) => i.ativo).length;

  return (
    <div className="space-y-6">
      {/* KPI Faixa de Integrações */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Canais Conectados
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {totalConnected} de {integrations.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Status do Webhook Listener
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-800 dark:text-white">Operacional (100% SLA)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Regra Inegociável de Escopo
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mt-1">
            ✓ WhatsApp via link direto (wa.me) sem embutir cliente não oficial.
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar canal ou portal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1C2537] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-connect-blue"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {["ALL", "Mídia Paga", "Portais Imobiliários", "Site e Landing Pages", "Desenvolvimento"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-connect-blue text-white shadow-xs"
                    : "bg-slate-100 dark:bg-[#080C14] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {cat === "ALL" ? "Todas as Categorias" : cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Grid 2 colunas de cards-acordeão conforme Seção 5.10 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIntegrations.map((item) => (
          <IntegrationCard
            key={item.id}
            item={item}
            onToggleActive={handleToggleActive}
            onSyncNow={handleSyncNow}
            onDisconnect={handleDisconnect}
          />
        ))}
      </div>
    </div>
  );
}
