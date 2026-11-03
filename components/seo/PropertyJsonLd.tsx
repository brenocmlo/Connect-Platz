import React from "react";
import { getBaseUrl, SITE_CONFIG } from "@/lib/seo/siteConfig";

// components/seo/PropertyJsonLd.tsx
// Rich Results para imóveis: Google RealEstateListing, SingleFamilyResidence e Offer.

export interface PropertySeoData {
  nome: string;
  slug: string;
  modalidade: string;
  descricao?: string | null;
  valorVenda?: number | string | null;
  valorDiaria?: number | string | null;
  cidade?: string | null;
  bairro?: string | null;
  estado?: string | null;
  endereco?: string | null;
  cep?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  fotos?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface PropertyJsonLdProps {
  property: PropertySeoData;
}

export function PropertyJsonLd({ property }: PropertyJsonLdProps) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/imoveis/${encodeURIComponent(property.slug)}`;
  const isTemporada =
    property.modalidade === "VERANEIO_TEMPORADA" || property.modalidade === "AMBOS";
  const rawPrice = isTemporada ? property.valorDiaria : property.valorVenda;
  const price = rawPrice ? Number(rawPrice) : undefined;

  const lat = property.latitude ?? SITE_CONFIG.geo.latitude;
  const lng = property.longitude ?? SITE_CONFIG.geo.longitude;

  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    name: property.nome,
    description:
      property.descricao ||
      `${property.nome} em ${property.bairro || ""}, ${property.cidade || "Fortaleza"} - Ceará.`,
    url,
    image: property.fotos && property.fotos.length > 0 ? property.fotos : [`${baseUrl}/icons/icon-512x512.png`],
    datePosted: property.createdAt ? new Date(property.createdAt).toISOString() : undefined,
    dateModified: property.updatedAt ? new Date(property.updatedAt).toISOString() : undefined,
    offers: price
      ? {
          "@type": "Offer",
          price,
          priceCurrency: "BRL",
          availability: "https://schema.org/InStock",
          businessFunction: isTemporada
            ? "https://schema.org/LeaseOut"
            : "https://schema.org/Sell",
          seller: {
            "@type": "RealEstateAgent",
            name: SITE_CONFIG.name,
            url: baseUrl,
          },
        }
      : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.endereco || undefined,
      addressLocality: property.cidade || SITE_CONFIG.address.city,
      addressRegion: property.estado || SITE_CONFIG.address.state,
      postalCode: property.cep || SITE_CONFIG.address.postalCode,
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: lat,
      longitude: lng,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
