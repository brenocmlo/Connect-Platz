"use client";

import React, { useState, useEffect } from "react";
import { Search, Layers, CheckCircle2, RefreshCw } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { IntegrationItem } from "./types";
import { IntegrationCard } from "./IntegrationCard";
import { logAuditEvent } from "@/lib/services/auditLogger";
import { initialIntegrations } from "./initialIntegrations";

const STORAGE_KEY = "connect_platz_integrations_config";

export function IntegrationsSection() {
  const { user, setActionMessage } = useCrm();
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(initialIntegrations);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setIntegrations(parsed);
        }
      }
    } catch {
      // fallback
    }
  }, []);

  const saveToStorage = (updated: IntegrationItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    setIntegrations((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, ativo: active } : item
      );
      saveToStorage(updated);
      return updated;
    });

    setActionMessage(
      active
        ? "Canal ativado: recebendo leads automaticamente."
        : "Canal pausado temporariamente."
    );
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleSaveConfig = (
    id: string,
    rule: "roleta" | "fila_geral" | "gestor" | string,
    active: boolean
  ) => {
    let channelName = id;
    const typedRule: "roleta" | "fila_geral" | "gestor" =
      rule === "fila_geral" || rule === "gestor" ? rule : "roleta";

    setIntegrations((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          channelName = item.nome;
          return {
            ...item,
            ativo: active,
            regras: {
              ...item.regras,
              distribuicao: typedRule,
              etapaInicial: item.regras?.etapaInicial || "Novo Lead",
            },
          };
        }
        return item;
      });
      saveToStorage(updated);
      return updated;
    });

    logAuditEvent({
      usuario: {
        id: user?.id || "u-1",
        nome: user?.nome || "Administrador",
        email: user?.email || "admin@connectplatz.com.br",
        role: user?.role || "ADMINISTRADOR",
      },
      acao: "Configuração de Canal de Integração",
      tipoAcao: "UPDATE",
      modulo: "CONFIGURACOES",
      detalhes: `Configurações do canal '${channelName}' atualizadas. Regra de distribuição: ${rule}. Recebimento automático: ${active ? "Ativo" : "Pausado"}.`,
    });

    setActionMessage(`Configurações de '${channelName}' salvas com sucesso!`);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleSyncNow = (id: string) => {
    const now = new Date();
    const timeStr = `Hoje às ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    let channelName = id;
    setIntegrations((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          channelName = item.nome;
          return {
            ...item,
            ultimaSincronizacao: timeStr,
          };
        }
        return item;
      });
      saveToStorage(updated);
      return updated;
    });

    logAuditEvent({
      usuario: {
        id: user?.id || "u-1",
        nome: user?.nome || "Administrador",
        email: user?.email || "admin@connectplatz.com.br",
        role: user?.role || "ADMINISTRADOR",
      },
      acao: "Sincronização Manual de Integração",
      tipoAcao: "UPDATE",
      modulo: "LEADS",
      detalhes: `Sincronização manual executada no canal '${channelName}'. Trilha de eventos validada.`,
    });

    setActionMessage(`Canal '${channelName}' sincronizado com sucesso!`);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleReconnect = (id: string) => {
    const now = new Date();
    const timeStr = `Hoje às ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    let channelName = id;
    setIntegrations((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          channelName = item.nome;
          return {
            ...item,
            status: "Conectado" as const,
            ativo: true,
            ultimaSincronizacao: timeStr,
          };
        }
        return item;
      });
      saveToStorage(updated);
      return updated;
    });

    logAuditEvent({
      usuario: {
        id: user?.id || "u-1",
        nome: user?.nome || "Administrador",
        email: user?.email || "admin@connectplatz.com.br",
        role: user?.role || "ADMINISTRADOR",
      },
      acao: "Reconexão de Canal",
      tipoAcao: "UPDATE",
      modulo: "CONFIGURACOES",
      detalhes: `Canal '${channelName}' reconectado e ativado pelo Administrador.`,
    });

    setActionMessage(`Canal '${channelName}' reconectado com sucesso!`);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleDisconnect = (id: string) => {
    let channelName = id;
    setIntegrations((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          channelName = item.nome;
          return { ...item, status: "Disponível" as const, ativo: false };
        }
        return item;
      });
      saveToStorage(updated);
      return updated;
    });

    logAuditEvent({
      usuario: {
        id: user?.id || "u-1",
        nome: user?.nome || "Administrador",
        email: user?.email || "admin@connectplatz.com.br",
        role: user?.role || "ADMINISTRADOR",
      },
      acao: "Desconexão de Canal",
      tipoAcao: "UPDATE",
      modulo: "CONFIGURACOES",
      detalhes: `Canal '${channelName}' desconectado pelo Administrador.`,
    });

    setActionMessage(`Canal '${channelName}' desconectado com segurança.`);
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
            onSaveConfig={handleSaveConfig}
            onReconnect={handleReconnect}
          />
        ))}
      </div>
    </div>
  );
}
