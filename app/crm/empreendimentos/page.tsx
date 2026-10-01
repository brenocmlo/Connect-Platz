"use client";

import React, { useState, useEffect } from "react";
import { Building2, Home, Globe, Layers, Plus } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { EmpreendimentosList } from "@/components/crm/properties/EmpreendimentosList";
import { ImoveisAvulsosList } from "@/components/crm/properties/ImoveisAvulsosList";
import { NewEmpreendimentoModal } from "@/components/crm/properties/NewEmpreendimentoModal";
import { NewImovelAvulsoModal } from "@/components/crm/properties/NewImovelAvulsoModal";
import { EspelhoVendasModal, EmpreendimentoData } from "@/components/crm/properties/EspelhoVendasModal";

export default function EmpreendimentosPage() {
  const { setActionMessage } = useCrm();
  const [activeTab, setActiveTab] = useState<"EMPREENDIMENTOS" | "AVULSOS">("EMPREENDIMENTOS");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [selectedEspelhoProperty, setSelectedEspelhoProperty] = useState<EmpreendimentoData | null>(null);
  const [isNewEmpModalOpen, setIsNewEmpModalOpen] = useState(false);
  const [isNewAvulsoModalOpen, setIsNewAvulsoModalOpen] = useState(false);
  const [loadingToggleId, setLoadingToggleId] = useState<string | null>(null);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/properties");
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error("Erro ao carregar propriedades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleToggleLandingPage = async (id: string, current: boolean) => {
    try {
      setLoadingToggleId(id);
      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exibirNaLandingPage: !current }),
      });

      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, exibirNaLandingPage: !current } : p
          )
        );
        setActionMessage(
          !current
            ? "Imóvel ATIVADO na Landing Page com sucesso!"
            : "Imóvel OCULTADO da Landing Page."
        );
        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingToggleId(null);
    }
  };

  const handleDeleteImovel = async (id: string) => {
    if (!confirm("Deseja realmente remover este imóvel?")) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        setActionMessage("Imóvel removido com sucesso!");
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const empreendimentos = properties.filter((p) => p.tipoCadastro !== "AVULSO");
  const imoveisAvulsos = properties.filter((p) => p.tipoCadastro === "AVULSO");
  const totalNaLanding = properties.filter((p) => p.exibirNaLandingPage !== false).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header do Catálogo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/20 text-blue-400 border border-connect-blue/30 uppercase">
              Catálogo Imobiliário & Espelhos
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              {totalNaLanding} ativos na Landing Page
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Gestão de Imóveis & Empreendimentos
          </h1>
          <p className="text-xs text-slate-400">
            Cadastre lançamentos com espelho de vendas ou imóveis avulsos e defina quais aparecem no site público.
          </p>
        </div>

        {/* Abas Superiores no Estilo Habitus */}
        <div className="flex items-center gap-1.5 bg-[#080C14] border border-[#1C2537] p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("EMPREENDIMENTOS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "EMPREENDIMENTOS"
                ? "bg-connect-blue text-white shadow-md shadow-connect-blue/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Empreendimentos ({empreendimentos.length})
          </button>
          <button
            onClick={() => setActiveTab("AVULSOS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "AVULSOS"
                ? "bg-[#D9BB4C] text-black shadow-md shadow-[#D9BB4C]/20 font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Home className="w-4 h-4" />
            Imóveis Avulsos ({imoveisAvulsos.length})
          </button>
        </div>
      </div>

      {/* 2. Conteúdo da Aba Ativa */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-connect-blue mx-auto mb-3" />
          Carregando catálogo de imóveis...
        </div>
      ) : activeTab === "EMPREENDIMENTOS" ? (
        <EmpreendimentosList
          empreendimentos={empreendimentos}
          onOpenEspelho={(emp) => setSelectedEspelhoProperty(emp)}
          onOpenNewModal={() => setIsNewEmpModalOpen(true)}
          onToggleLandingPage={handleToggleLandingPage}
          loadingToggleId={loadingToggleId}
        />
      ) : (
        <ImoveisAvulsosList
          imoveis={imoveisAvulsos}
          onOpenNewModal={() => setIsNewAvulsoModalOpen(true)}
          onToggleLandingPage={handleToggleLandingPage}
          onDeleteImovel={handleDeleteImovel}
          loadingToggleId={loadingToggleId}
        />
      )}

      {/* 3. Modal de Cadastro de Empreendimento */}
      <NewEmpreendimentoModal
        isOpen={isNewEmpModalOpen}
        onClose={() => setIsNewEmpModalOpen(false)}
        onSuccess={() => {
          loadProperties();
          setActionMessage("Empreendimento cadastrado com sucesso!");
          setTimeout(() => setActionMessage(null), 4000);
        }}
      />

      {/* 4. Modal de Cadastro de Imóvel Avulso */}
      <NewImovelAvulsoModal
        isOpen={isNewAvulsoModalOpen}
        onClose={() => setIsNewAvulsoModalOpen(false)}
        onSuccess={() => {
          loadProperties();
          setActionMessage("Imóvel avulso cadastrado com sucesso!");
          setTimeout(() => setActionMessage(null), 4000);
        }}
      />

      {/* 5. Modal Interativo de Espelho de Vendas */}
      <EspelhoVendasModal
        property={selectedEspelhoProperty}
        onClose={() => setSelectedEspelhoProperty(null)}
      />
    </div>
  );
}
