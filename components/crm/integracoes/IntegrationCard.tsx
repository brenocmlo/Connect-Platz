"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Unlink,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Copy,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { IntegrationItem, IntegrationStatus } from "./types";

interface IntegrationCardProps {
  item: IntegrationItem;
  onToggleActive: (id: string, active: boolean) => void;
  onSyncNow: (id: string) => void;
  onDisconnect: (id: string) => void;
}

export function IntegrationCard({
  item,
  onToggleActive,
  onSyncNow,
  onDisconnect,
}: IntegrationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subTab, setSubTab] = useState<"integracao" | "leads" | "instrucoes">("integracao");
  const [ruleDistribuicao, setRuleDistribuicao] = useState<string>(
    item.regras?.distribuicao || "roleta"
  );
  const [autoReceive, setAutoReceive] = useState<boolean>(item.ativo);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case "Conectado":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800";
      case "Plugin Oficial":
        return "bg-connect-blue/15 text-connect-blue dark:text-blue-300 border-connect-blue/30";
      case "Avançado":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400 border-amber-300 dark:border-amber-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(`https://crm.connectplatz.com.br/api/webhooks/${item.id}`);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 3000);
  };

  return (
    <div
      className={`bg-white dark:bg-[#0A0E17] border rounded-2xl transition-all shadow-sm ${
        isExpanded
          ? "border-connect-blue/50 dark:border-connect-blue/50 shadow-md ring-1 ring-connect-blue/10"
          : "border-slate-200 dark:border-[#1C2537] hover:border-connect-blue/30"
      }`}
    >
      {/* Accordion Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-connect-blue/10 dark:bg-[#161F30] border border-connect-blue/20 dark:border-[#242C3D] flex items-center justify-center font-bold text-connect-blue shrink-0">
            <Layers className="w-5 h-5 text-connect-blue" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.nome}</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                  item.status
                )}`}
              >
                {item.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {item.descricao}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          aria-label={isExpanded ? "Recolher" : "Expandir"}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Accordion Expanded Body */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-[#1C2537] p-5 space-y-4 text-xs animate-in slide-in-from-top-2 duration-200">
          {/* Connection Meta Details */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] text-slate-600 dark:text-slate-400">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Conta: </span>
              <span>{item.contaConectada || "Não vinculada"}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Última Sincronização: </span>
              <span>{item.ultimaSincronizacao || "Hoje às 18:42"}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Leads Captados: </span>
              <span className="font-bold text-connect-blue">{item.leadsRecebidos || 0}</span>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex border-b border-slate-200 dark:border-[#1C2537] gap-4">
            {[
              { id: "integracao", label: "Integração" },
              { id: "leads", label: "Leads em tempo real" },
              { id: "instrucoes", label: "Instruções" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`pb-2 text-xs font-semibold capitalize border-b-2 transition-all ${
                  subTab === tab.id
                    ? "border-connect-blue text-connect-blue font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-tab 1: Integração */}
          {subTab === "integracao" && (
            <div className="space-y-4">
              {/* Callout Âmbar de Ação Pendente */}
              {item.acaoPendente && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Ação recomendada</span>
                    <p className="text-[11px] opacity-90">{item.acaoPendente}</p>
                  </div>
                </div>
              )}

              {/* Radios de Regras de Distribuição */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 dark:text-white block uppercase tracking-wider text-[11px]">
                  Regra de Distribuição de Leads Recebidos
                </label>
                <div className="space-y-1.5">
                  {[
                    {
                      id: "roleta",
                      label: "Distribuir automaticamente pela Roleta de Corretores Ativos (SLA 20 min)",
                    },
                    {
                      id: "fila_geral",
                      label: "Enviar para o Bolsão Geral (Leads disponíveis para captura voluntária)",
                    },
                    {
                      id: "gestor",
                      label: "Atribuir diretamente à gerência comercial responsável",
                    },
                  ].map((r) => (
                    <label
                      key={r.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-[#1F2937] hover:bg-slate-50 dark:hover:bg-[#0E1624] cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`regra-${item.id}`}
                        value={r.id}
                        checked={ruleDistribuicao === r.id}
                        onChange={() => setRuleDistribuicao(r.id)}
                        className="text-connect-blue focus:ring-connect-blue"
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {r.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Switch "Recebendo leads automaticamente" */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937]">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Recebendo leads automaticamente
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Novas conversões disparam notificações no CRM imediatamente.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !autoReceive;
                    setAutoReceive(next);
                    onToggleActive(item.id, next);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    autoReceive ? "bg-connect-blue justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Botão Primário Full-Width */}
              <button
                type="button"
                onClick={() => onSyncNow(item.id)}
                className="w-full bg-connect-blue hover:bg-connect-deep-blue text-white font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Salvar Configurações da Integração
              </button>

              {/* Ações Secundárias */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#1C2537]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSyncNow(item.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1F2937] hover:bg-slate-100 dark:hover:bg-[#161F30] text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-connect-blue" />
                    Sincronizar agora
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1F2937] hover:bg-slate-100 dark:hover:bg-[#161F30] text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Reconectar
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onDisconnect(item.id)}
                  className="px-3 py-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  Desconectar integração
                </button>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Leads em tempo real */}
          {subTab === "leads" && (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block">
                    Dr. Eduardo Siqueira
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Origem: Formulário Instantâneo • há 14 minutos
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 text-[10px] font-bold">
                  Sincronizado
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937] flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block">
                    Camila Barreto
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Origem: Campanha Meireles • há 2 horas
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 text-[10px] font-bold">
                  Sincronizado
                </span>
              </div>
            </div>
          )}

          {/* Sub-tab 3: Instruções */}
          {subTab === "instrucoes" && (
            <div className="space-y-3">
              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <p>1. Acesse o painel de desenvolvedores ou configurações de webhook da plataforma parceira.</p>
                <p>2. Cole a URL de Webhook segura abaixo no campo correspondente de disparo de leads:</p>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937]">
                  <code className="text-xs font-mono text-connect-blue flex-1 truncate">
                    https://crm.connectplatz.com.br/api/webhooks/{item.id}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyWebhook}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#161F30] text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copiedWebhook && (
                  <span className="text-[11px] text-emerald-600 font-semibold block">
                    ✓ Link copiado para a área de transferência!
                  </span>
                )}
                <p>3. Selecione o evento <code>lead.created</code> ou <code>new_lead</code> para entrega instantânea.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
