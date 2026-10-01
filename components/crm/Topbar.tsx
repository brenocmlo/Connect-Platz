"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Clock,
  PlusCircle,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Flame,
  UserCheck,
  Check,
  X,
} from "lucide-react";
import { useCrm, PeriodFilter } from "./CrmContext";

const routeNames: Record<string, string> = {
  "/crm": "Dashboard Executiva",
  "/crm/leads": "Gestão de Leads & Funis",
  "/crm/agenda": "Agenda & Visitas",
  "/crm/vendas": "Vendas & Split de Comissões",
  "/crm/fluxo-de-caixa": "Fluxo de Caixa & DRE",
  "/crm/empreendimentos": "Empreendimentos & Espelho de Vendas",
  "/crm/temporada": "Aluguel de Temporada (Veraneio)",
  "/crm/ranking": "Ranking & Gamificação",
  "/crm/relatorios": "BI & Relatórios de SLA",
  "/crm/equipes": "Gestão de Equipes",
  "/crm/configuracoes": "Configurações White-Label",
};

export function Topbar() {
  const pathname = usePathname();
  const {
    user,
    token,
    selectedPeriod,
    setSelectedPeriod,
    slaBreachedCount,
    notifications,
    unreadCount,
    markNotificationsAsRead,
    actionMessage,
    setActionMessage,
  } = useCrm();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSimulatingLead, setIsSimulatingLead] = useState(false);

  const currentRouteName = routeNames[pathname] || "Painel CRM";

  // Simular ingestão de lead em tempo real do Meta Ads
  const handleSimulateMetaLead = async () => {
    if (!token || isSimulatingLead) return;
    setIsSimulatingLead(true);
    try {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: `Comprador Meta Ads #${randomId}`,
          telefone: `8598877${randomId}`,
          email: `lead.meta${randomId}@gmail.com`,
          faixaRenda: "10 a 20 SM",
          tipoOcupacaoCredito: "CLT",
          rendaDeclarada: 16500,
          bairrosInteresse: ["Meireles", "Aldeota", "Porto das Dunas"],
          observacoes: "Lead captado pelo criativo 'Villa Platz Beach Frente Mar'",
        }),
      });

      if (res.ok) {
        setActionMessage("Novo lead recebido em tempo real e atribuído via Roleta Round-Robin!");
        setTimeout(() => setActionMessage(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingLead(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#080C14]/90 backdrop-blur-md border-b border-[#1C2537] px-6 flex items-center justify-between gap-4">
      {/* 1. BREADCRUMB */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400">Connect Platz CRM</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <h1 className="text-sm font-bold text-white tracking-tight">{currentRouteName}</h1>

        {/* Feedback visual de ações rápidas */}
        {actionMessage && (
          <div className="ml-4 text-xs bg-emerald-950/90 border border-emerald-700 text-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
        )}
      </div>

      {/* 2. CONTROLES CENTRAIS E DIREITOS */}
      <div className="flex items-center gap-3">
        {/* SELETOR DE PERÍODO RÁPIDO NO PADRÃO HABITUS */}
        <div className="hidden lg:flex items-center bg-[#0F1624] border border-[#1C2537] rounded-xl p-1 text-xs">
          {(
            [
              { key: "hoje", label: "Hoje" },
              { key: "7d", label: "7 Dias" },
              { key: "mes", label: "Este Mês" },
              { key: "30d", label: "30 Dias" },
              { key: "ano", label: "Ano" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedPeriod(item.key as PeriodFilter)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedPeriod === item.key
                  ? "bg-connect-blue text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ALERTA DE SLA CRÍTICO COM PULSO */}
        {slaBreachedCount > 0 && (
          <a
            href="/crm/leads"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs font-semibold hover:bg-red-900/60 transition-colors animate-pulse"
            title="Leads com tempo de SLA estourado"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>{slaBreachedCount} SLA em Risco</span>
          </a>
        )}

        {/* BOTÃO DE DEMONSTRAÇÃO / WEBHOOK META ADS */}
        <button
          onClick={handleSimulateMetaLead}
          disabled={isSimulatingLead}
          className="bg-connect-blue/15 hover:bg-connect-blue/25 border border-connect-blue/40 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
        >
          <PlusCircle className={`w-3.5 h-3.5 text-connect-blue ${isSimulatingLead ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Simular Webhook Meta</span>
        </button>

        {/* NOTIFICAÇÕES COM BADGE */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              if (!isNotifOpen) markNotificationsAsRead();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#131B2A] border border-[#1C2537] relative transition-colors"
            title="Notificações do Sistema"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* POPOVER DE NOTIFICAÇÕES */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0F1624] border border-[#1C2537] rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-[#1C2537] mb-3">
                <span className="text-xs font-bold text-white">Notificações Recentes</span>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-[#090D15] border border-[#1C2537] hover:border-connect-blue/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-white">{n.title}</span>
                      <span className="text-[9px] text-slate-500">{n.createdAt}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
