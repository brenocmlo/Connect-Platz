"use client";

import React, { useCallback, useState } from "react";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalHero } from "@/components/portal/PortalHero";
import { PortalCategories } from "@/components/portal/PortalCategories";
import { PortalListings } from "@/components/portal/PortalListings";
import { PortalWhyUs } from "@/components/portal/PortalWhyUs";
import { PortalCreditSimulator } from "@/components/portal/PortalCreditSimulator";
import { PortalDirectory } from "@/components/portal/PortalDirectory";
import { PortalContactModal } from "@/components/portal/PortalContactModal";
import { PortalFooter } from "@/components/portal/PortalFooter";
import { PortalFloatingWhatsApp } from "@/components/portal/PortalFloatingWhatsApp";
import { usePortalProperties } from "@/components/portal/usePortalProperties";
import { cityLabel, inferPropertyType, isTemporada, scrollToId } from "@/components/portal/portalUtils";
import type { PortalFilters, PropertyItem } from "@/components/portal/types";

// Portal público inspirado na estrutura do remax.com.br, com a identidade Connect Platz.
export default function LandingPage() {
  const portal = usePortalProperties();
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const closeModal = useCallback(() => setSelectedProperty(null), []);

  const showResults = (partial: Partial<PortalFilters>) => {
    portal.applyFilters(partial);
    scrollToId("vitrine");
  };

  const navigateTo = (modalidade: "VENDA" | "VERANEIO", cidade?: string) =>
    showResults({ modalidade, localizacao: cidade ?? "" });

  return (
    <div className="min-h-[100dvh] bg-portal-mist text-portal-ink [color-scheme:light] dark:[color-scheme:dark]">
      <PortalHeader cities={portal.directoryCities} onNavigate={navigateTo} />

      <main>
        <PortalHero onSearch={showResults} />

        <PortalCategories onPick={showResults} />

        <PortalListings
          properties={portal.filtered}
          totalCount={portal.properties.length}
          loading={portal.loading}
          error={portal.error}
          filters={portal.filters}
          onModalidade={(m) => portal.updateFilter("modalidade", m)}
          onReset={portal.resetFilters}
          onSelect={setSelectedProperty}
        />

        <PortalWhyUs
          totalImoveis={portal.properties.length}
          totalCidades={new Set(portal.properties.map((p) => p.cidade).filter(Boolean)).size}
          totalTemporada={portal.properties.filter((p) => isTemporada(p) || p.modalidade === "AMBOS").length}
          loading={portal.loading}
        />

        <PortalCreditSimulator />

        <PortalDirectory
          directoryCities={portal.directoryCities}
          onFilterClick={(cidade, modalidade, item) =>
            showResults({ modalidade, localizacao: cityLabel(cidade), tipoImovel: inferPropertyType(item) })
          }
        />
      </main>

      <PortalFooter onNavigateVitrine={(modalidade) => navigateTo(modalidade)} />

      <PortalFloatingWhatsApp />

      <PortalContactModal property={selectedProperty} onClose={closeModal} />
    </div>
  );
}
