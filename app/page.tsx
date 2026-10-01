"use client";

import React, { useState, useEffect } from "react";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalHero } from "@/components/portal/PortalHero";
import {
  PortalPropertyCard,
  PropertyItem,
} from "@/components/portal/PortalPropertyCard";
import {
  PortalDirectory,
  DirectoryCity,
} from "@/components/portal/PortalDirectory";
import { PortalCreditSimulator } from "@/components/portal/PortalCreditSimulator";
import { PortalContactModal } from "@/components/portal/PortalContactModal";
import { PortalFooter } from "@/components/portal/PortalFooter";

export default function LandingPage() {
  // Dados dinâmicos puxados diretamente do sistema
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [directoryCities, setDirectoryCities] = useState<DirectoryCity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros de busca no estilo RE/MAX Brasil
  const [modalidadeFiltro, setModalidadeFiltro] = useState<
    "TODOS" | "VENDA" | "VERANEIO"
  >("TODOS");
  const [localizacao, setLocalizacao] = useState("");
  const [tipoImovel, setTipoImovel] = useState("TODOS");
  const [quartosMin, setQuartosMin] = useState("TODOS");

  // Estado da Seção de Diretório RE/MAX (COMPRAR vs ALUGAR)
  const [directoryTab, setDirectoryTab] = useState<"COMPRAR" | "ALUGAR">("COMPRAR");
  const [directoryPage, setDirectoryPage] = useState(0);

  // Modal de Detalhes e Contato
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);

  // Carregar dados reais do banco de dados na inicialização
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/properties?portal=true");
        if (res.ok) {
          const data = await res.json();
          setProperties(data.properties || []);
          setDirectoryCities(data.directory || []);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do sistema:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtragem dos imóveis carregados do sistema
  const filteredProperties = properties.filter((p) => {
    if (modalidadeFiltro === "VENDA" && p.modalidade === "VERANEIO_TEMPORADA")
      return false;
    if (modalidadeFiltro === "VERANEIO" && p.modalidade === "VENDA") return false;

    if (tipoImovel !== "TODOS") {
      const nomeLower = (p.nome || "").toLowerCase();
      const descLower = (p.descricao || "").toLowerCase();
      if (
        !nomeLower.includes(tipoImovel.toLowerCase()) &&
        !descLower.includes(tipoImovel.toLowerCase())
      ) {
        return false;
      }
    }

    if (quartosMin !== "TODOS") {
      const qts = p.caracteristicas?.quartos || 0;
      if (qts < parseInt(quartosMin, 10)) return false;
    }

    if (localizacao) {
      const termo = localizacao.toLowerCase();
      const matchLocal =
        (p.bairro || "").toLowerCase().includes(termo) ||
        (p.cidade || "").toLowerCase().includes(termo) ||
        (p.nome || "").toLowerCase().includes(termo);
      if (!matchLocal) return false;
    }

    return true;
  });

  // Helper para formatar valores
  const formatPrice = (prop: PropertyItem) => {
    if (prop.modalidade === "VERANEIO_TEMPORADA" && prop.valorDiaria) {
      return `R$ ${Number(prop.valorDiaria).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })} / noite`;
    }
    if (prop.valorVenda) {
      return `R$ ${Number(prop.valorVenda).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`;
    }
    return "Consulte";
  };

  const handleDirectoryFilter = (
    cidade: string,
    modalidade: "VENDA" | "VERANEIO"
  ) => {
    setLocalizacao(cidade);
    setModalidadeFiltro(modalidade);
    document.getElementById("vitrine")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 selection:bg-connect-blue selection:text-white">
      {/* 1. Header do Portal */}
      <PortalHeader />

      {/* 2. Hero com Barra de Busca e Filtros */}
      <PortalHero
        modalidadeFiltro={modalidadeFiltro}
        setModalidadeFiltro={setModalidadeFiltro}
        localizacao={localizacao}
        setLocalizacao={setLocalizacao}
        tipoImovel={tipoImovel}
        setTipoImovel={setTipoImovel}
        quartosMin={quartosMin}
        setQuartosMin={setQuartosMin}
        totalEncontrados={filteredProperties.length}
      />

      {/* 3. Vitrine de Imóveis */}
      <section id="vitrine" className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-[#D9BB4C] uppercase tracking-wider">
              Portfólio em Tempo Real
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Imóveis Selecionados do Sistema
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setModalidadeFiltro("TODOS")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                modalidadeFiltro === "TODOS"
                  ? "bg-[#1266C7] text-white"
                  : "bg-[#111827] text-slate-400 hover:text-white"
              }`}
            >
              Todos ({properties.length})
            </button>
            <button
              onClick={() => setModalidadeFiltro("VENDA")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                modalidadeFiltro === "VENDA"
                  ? "bg-[#1266C7] text-white"
                  : "bg-[#111827] text-slate-400 hover:text-white"
              }`}
            >
              Vendas
            </button>
            <button
              onClick={() => setModalidadeFiltro("VERANEIO")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                modalidadeFiltro === "VERANEIO"
                  ? "bg-[#D9BB4C] text-black"
                  : "bg-[#111827] text-[#F8DA56] hover:text-white"
              }`}
            >
              Veraneio & Temporada
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-connect-blue mx-auto mb-3" />
            Carregando imóveis atualizados do sistema...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => (
              <PortalPropertyCard
                key={prop.id}
                property={prop}
                onSelect={(p) => setSelectedProperty(p)}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Diretório de Cidades e Bairros */}
      <PortalDirectory
        directoryCities={directoryCities}
        directoryTab={directoryTab}
        setDirectoryTab={setDirectoryTab}
        directoryPage={directoryPage}
        setDirectoryPage={setDirectoryPage}
        onFilterClick={handleDirectoryFilter}
      />

      {/* 5. Diferenciais e Simulador de Crédito */}
      <PortalCreditSimulator />

      {/* 6. Modal de Detalhes e Ingestão de Leads */}
      <PortalContactModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        formatPrice={formatPrice}
      />

      {/* 7. Footer Oficial */}
      <PortalFooter
        onNavigateVitrine={(modalidade) => {
          setModalidadeFiltro(modalidade);
          document.getElementById("vitrine")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </div>
  );
}
