"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Building2,
  Home,
  Globe,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { PropertyProductCard, PropertyCardData } from "./PropertyProductCard";
import { EmptyState } from "@/components/crm/primitives/EmptyState";
import { useCrm } from "@/components/crm/CrmContext";
import { useDebounce } from "@/hooks/useDebounce";
import { resolveRoleModalityGroup, canDeletePropertyForRole } from "@/lib/domain/properties/modalityScope";

interface PropertyListSectionProps {
  properties: PropertyCardData[];
  onOpenDetails: (prop: PropertyCardData) => void;
  onOpenPublishModal: (prop: PropertyCardData) => void;
  onOpenMaterials?: (prop: PropertyCardData) => void;
  onOpenEditImage?: (prop: PropertyCardData) => void;
  /** Ausentes para perfis sem permissão de cadastro (corretor). */
  onOpenNewEmpModal?: () => void;
  onOpenNewAvulsoModal?: () => void;
  onToggleLandingPage: (id: string, current: boolean) => Promise<void>;
  onDeleteProperty?: (id: string) => Promise<void> | void;
  onPermanentDeleteProperty?: (id: string) => Promise<void> | void;
}

export function PropertyListSection({
  properties,
  onOpenDetails,
  onOpenPublishModal,
  onOpenMaterials,
  onOpenEditImage,
  onOpenNewEmpModal,
  onOpenNewAvulsoModal,
  onToggleLandingPage,
  onDeleteProperty,
  onPermanentDeleteProperty,
}: PropertyListSectionProps) {
  const { user } = useCrm();
  const modalityGroup = resolveRoleModalityGroup(user?.role);
  const isVendaOnly = modalityGroup === "VENDA";
  const isAluguelOnly = modalityGroup === "ALUGUEL";

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [selectedFilter, setSelectedFilter] = useState<
    "TODOS" | "TEMPORADA" | "LOCACAO" | "VENDA" | "REPASSE" | "EMPREENDIMENTO" | "AVULSO" | "LANDING" | "LANCAMENTO" | "PRONTO"
  >("TODOS");

  const baseProperties = useMemo(() => {
    return properties.filter((p) => {
      if (isVendaOnly) {
        return (
          p.modalidade === "VENDA" ||
          p.modalidade === "AMBOS" ||
          p.modalidade === "REPASSE" ||
          (!p.modalidade && Boolean(p.valorVenda))
        );
      }
      if (isAluguelOnly) {
        return (
          p.modalidade === "VERANEIO_TEMPORADA" ||
          p.modalidade === "LOCACAO_ANUAL" ||
          p.modalidade === "AMBOS" ||
          p.modalidade === "VERANEIO" ||
          Boolean(p.valorDiaria) ||
          Boolean((p as any).valorAluguel)
        );
      }
      return true;
    });
  }, [properties, isVendaOnly, isAluguelOnly]);

  const filteredProperties = useMemo(() => {
    return baseProperties.filter((p) => {
      // 1. Filtro por tipo/status/modalidade
      if (selectedFilter === "TEMPORADA") {
        const isVeraneio =
          p.modalidade === "VERANEIO_TEMPORADA" ||
          p.modalidade === "VERANEIO" ||
          Boolean(p.valorDiaria);
        if (!isVeraneio) return false;
      }
      if (selectedFilter === "LOCACAO") {
        const isLocacao =
          p.modalidade === "LOCACAO_ANUAL" ||
          p.modalidade === "AMBOS" ||
          Boolean((p as any).valorAluguel);
        if (!isLocacao) return false;
      }
      if (selectedFilter === "REPASSE") {
        const isRep =
          p.modalidade === "REPASSE" ||
          Boolean((p as any).valorRepasse);
        if (!isRep) return false;
      }
      if (selectedFilter === "VENDA") {
        const isVenda =
          p.modalidade === "VENDA" ||
          p.modalidade === "AMBOS" ||
          (!p.modalidade && Boolean(p.valorVenda));
        if (!isVenda) return false;
      }
      if (selectedFilter === "EMPREENDIMENTO" && p.tipoCadastro === "AVULSO")
        return false;
      if (selectedFilter === "AVULSO" && p.tipoCadastro !== "AVULSO")
        return false;
      if (selectedFilter === "LANDING" && p.exibirNaLandingPage === false)
        return false;
      if (
        selectedFilter === "LANCAMENTO" &&
        !(p.estagioObra || "").toLowerCase().includes("lançamento")
      )
        return false;
      if (
        selectedFilter === "PRONTO" &&
        !(p.estagioObra || "").toLowerCase().includes("pronto")
      )
        return false;

      // 2. Busca por texto
      if (debouncedSearch) {
        const term = debouncedSearch.toLowerCase();
        const matchName = (p.nome || "").toLowerCase().includes(term);
        const matchBairro = (p.bairro || "").toLowerCase().includes(term);
        const matchCidade = (p.cidade || "").toLowerCase().includes(term);
        const matchConstrutora = (p.construtora || "").toLowerCase().includes(term);
        if (!matchName && !matchBairro && !matchCidade && !matchConstrutora)
          return false;
      }

      return true;
    });
  }, [baseProperties, selectedFilter, debouncedSearch]);

  return (
    <div className="space-y-5">
      {/* 1. Barra de Busca e Filtros Rápidos (Seção 5.6) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Input de Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por empreendimento, construtora, bairro ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none transition-all shadow-sm"
          />
        </div>

        {/* Botões de Ação para Cadastrar (somente administradores) */}
        {onOpenNewEmpModal && onOpenNewAvulsoModal && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewAvulsoModal}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all flex items-center gap-1.5"
          >
            <Home className="w-4 h-4 text-platz-gold" />
            <span>Imóvel Avulso</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewEmpModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-connect-blue hover:bg-connect-deep-blue text-white shadow-md shadow-connect-blue/20 transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Empreendimento</span>
          </button>
        </div>
        )}
      </div>

      {/* 2. Filtros em Pílula (Segmented Style) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: "TODOS", label: `Todos (${baseProperties.length})` },
          ...(!isAluguelOnly
            ? [
                {
                  id: "VENDA",
                  label: `🏢 Vendas (${
                    baseProperties.filter(
                      (p) =>
                        p.modalidade === "VENDA" ||
                        p.modalidade === "AMBOS" ||
                        (!p.modalidade && Boolean(p.valorVenda))
                    ).length
                  })`,
                },
                {
                  id: "REPASSE",
                  label: `🔄 Repasses (${
                    baseProperties.filter((p) => p.modalidade === "REPASSE" || Boolean((p as any).valorRepasse)).length
                  })`,
                },
              ]
            : []),
          ...(!isVendaOnly
            ? [
                {
                  id: "LOCACAO",
                  label: `🔑 Locação (${
                    baseProperties.filter(
                      (p) =>
                        p.modalidade === "LOCACAO_ANUAL" ||
                        p.modalidade === "AMBOS" ||
                        Boolean((p as any).valorAluguel)
                    ).length
                  })`,
                },
                {
                  id: "TEMPORADA",
                  label: `🏖️ Temporada (${
                    baseProperties.filter(
                      (p) =>
                        p.modalidade === "VERANEIO_TEMPORADA" ||
                        p.modalidade === "VERANEIO" ||
                        Boolean(p.valorDiaria)
                    ).length
                  })`,
                },
              ]
            : []),
          {
            id: "EMPREENDIMENTO",
            label: `Empreendimentos (${
              baseProperties.filter((p) => p.tipoCadastro !== "AVULSO").length
            })`,
          },
          {
            id: "AVULSO",
            label: `Avulsos (${
              baseProperties.filter((p) => p.tipoCadastro === "AVULSO").length
            })`,
          },
          {
            id: "LANDING",
            label: `Na Landing Page (${
              baseProperties.filter((p) => p.exibirNaLandingPage !== false).length
            })`,
          },
          { id: "LANCAMENTO", label: "Lançamentos" },
          { id: "PRONTO", label: "Prontos para Morar" },
        ].map((filter) => {
          const isActive = selectedFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedFilter(filter.id as any)}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-connect-blue text-white shadow-sm"
                  : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* 3. Grid 3 Colunas de Cards de Produto (Seção 5.6) */}
      {filteredProperties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhum imóvel encontrado"
          description="Tente ajustar os filtros de busca ou cadastre um novo empreendimento para enriquecer seu catálogo."
          actionLabel={onOpenNewEmpModal ? "Cadastrar Empreendimento" : undefined}
          onActionClick={onOpenNewEmpModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const allowDelete = canDeletePropertyForRole(property.modalidade, user?.role);
            return (
              <PropertyProductCard
                key={property.id}
                property={property}
                onOpenDetails={onOpenDetails}
                onOpenPublishModal={onOpenPublishModal}
                onOpenMaterials={onOpenMaterials}
                onOpenEditImage={onOpenEditImage}
                onToggleLandingPage={onToggleLandingPage}
                onDelete={allowDelete ? onDeleteProperty : undefined}
                onPermanentDelete={allowDelete ? onPermanentDeleteProperty : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
