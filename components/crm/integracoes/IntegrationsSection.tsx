"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Search, RefreshCw, AlertCircle } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { IntegrationCard } from "./IntegrationCard";
import { integrationCatalog } from "./initialIntegrations";
import { ChannelId, ChannelStatus } from "./channels";

const CATEGORIES = ["ALL", "Mídia Paga", "Portais Imobiliários", "Site e Landing Pages", "Desenvolvimento"];

export function IntegrationsSection() {
  const { user } = useCrm();
  const canRevealKeys = user?.role === "ADMINISTRADOR" || user?.role === "DIRETOR";

  const [statuses, setStatuses] = useState<Partial<Record<ChannelId, ChannelStatus>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<Partial<Record<ChannelId, string | null>> | null>(null);
  const [keysError, setKeysError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/integracoes/status", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Não foi possível carregar o status das integrações.");
      setStatuses(data.channels || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar o status das integrações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const revealKeys = async () => {
    setKeysError(null);
    try {
      const res = await fetch("/api/integracoes/chaves", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Não foi possível carregar as chaves.");
      setKeys(data.keys || {});
    } catch (err) {
      setKeysError(err instanceof Error ? err.message : "Não foi possível carregar as chaves.");
    }
  };

  const filtered = integrationCatalog.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = item.nome.toLowerCase().includes(term) || item.descricao.toLowerCase().includes(term);
    return matchesSearch && (selectedCategory === "ALL" || item.categoria === selectedCategory);
  });

  const all = Object.values(statuses) as ChannelStatus[];
  const connected = all.filter((s) => s.leadsRecebidos > 0).length;
  const totalLeads = all.reduce((acc, s) => acc + s.leadsRecebidos, 0);
  const pendingKeys = all.filter((s) => !s.keyConfigured).length;

  const kpi = (label: string, value: React.ReactNode, hint: string) => (
    <div className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-connect-blue/40 transition-colors animate-fade-in-up">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">{label}</span>
      {loading && all.length === 0 ? (
        <div className="h-7 w-16 rounded-md bg-muted animate-pulse" />
      ) : (
        <span className="text-2xl font-bold text-foreground">{value}</span>
      )}
      <span className="text-[11px] text-muted-foreground block mt-0.5">{hint}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpi("Canais Conectados", `${connected} de ${integrationCatalog.length}`, "Com ao menos um lead recebido")}
        {kpi("Leads via Integrações", totalLeads, "Total recebido pelos webhooks")}
        {kpi("Chaves Pendentes", pendingKeys, "Canais sem chave configurada no servidor")}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar canal ou portal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue"
            />
          </div>
          <button
            type="button"
            onClick={loadStatus}
            disabled={loading}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            title="Atualizar status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-connect-blue text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "ALL" ? "Todas as Categorias" : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {filtered.map((item) => (
          <IntegrationCard
            key={item.id}
            item={item}
            status={statuses[item.id] || null}
            loading={loading}
            canRevealKeys={canRevealKeys}
            channelKey={keys ? keys[item.id] ?? null : undefined}
            keysError={keysError}
            onRevealKeys={revealKeys}
          />
        ))}
      </div>
    </div>
  );
}
