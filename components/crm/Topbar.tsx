"use client";

import React, { useState } from "react";
import {
  Bell,
  Sun,
  Moon,
  PlusCircle,
  CheckCircle2,
  X,
  AlertTriangle,
  Menu,
} from "lucide-react";
import { useCrm } from "./CrmContext";

export function Topbar() {
  const {
    token,
    theme,
    toggleTheme,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    slaBreachedCount,
    notifications,
    unreadCount,
    markNotificationsAsRead,
    actionMessage,
    setActionMessage,
  } = useCrm();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSimulatingLead, setIsSimulatingLead] = useState(false);

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
        setActionMessage("Novo lead recebido e distribuído na Roleta Round-Robin!");
        setTimeout(() => setActionMessage(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingLead(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-14 bg-card/80 backdrop-blur-md border-b border-border px-4 md:px-6 flex items-center justify-between gap-4">
      {/* 1. LADO ESQUERDO: BOTÃO MOBILE MENU + FEEDBACK DE AÇÃO OU SLA DISCRETO */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={isSidebarCollapsed ? "Abrir menu lateral" : "Fechar menu lateral"}
          aria-label="Menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        {actionMessage && (
          <div className="text-xs bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
        )}

        {slaBreachedCount > 0 && !actionMessage && (
          <a
            href="/crm/leads"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/70 border border-red-800 text-red-300 text-[11px] font-semibold hover:bg-red-900/60 transition-colors animate-pulse"
            title="Leads com SLA estourado"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>{slaBreachedCount} SLA Crítico</span>
          </a>
        )}
      </div>

      {/* 2. LADO DIREITO (5.2): TOGGLE TEMA ☀/☾ + SINO 99+ + DEMO META */}
      <div className="flex items-center gap-2.5 ml-auto">
        {/* Simulação rápida Meta Ads */}
        <button
          onClick={handleSimulateMetaLead}
          disabled={isSimulatingLead}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all"
          title="Simular ingestão de lead Meta Ads"
        >
          <PlusCircle className={`w-3.5 h-3.5 ${isSimulatingLead ? "animate-spin" : ""}`} />
          <span>+ Lead Demo</span>
        </button>

        {/* Toggle de Tema Light / Dark (5.2) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors"
          title={theme === "dark" ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
          aria-label="Alternar tema"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-[#F8DA56]" />
          ) : (
            <Moon className="w-4 h-4 text-connect-blue" />
          )}
        </button>

        {/* Sino de Notificações com badge vermelho 99+ (5.2) */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              if (!isNotifOpen) markNotificationsAsRead();
            }}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border relative transition-colors"
            title="Notificações do Sistema"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Popover de Notificações */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl p-3 z-50 animate-fade-in-up">
              <div className="flex items-center justify-between pb-2.5 border-b border-border mb-2.5">
                <span className="text-xs font-bold text-foreground">Notificações Recentes</span>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                  aria-label="Fechar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg bg-muted/50 border border-border/60 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-bold text-foreground">{n.title}</span>
                      <span className="text-[9px] text-muted-foreground">{n.createdAt}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{n.message}</p>
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

