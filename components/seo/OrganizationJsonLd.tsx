import React from "react";
import { SITE_CONFIG, getBaseUrl } from "@/lib/seo/siteConfig";

// components/seo/OrganizationJsonLd.tsx
// Dados estruturados Schema.org para Google Local Pack, Maps e Rich Results.

export function OrganizationJsonLd() {
  const baseUrl = getBaseUrl();

  const schema = {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    "@id": `${baseUrl}/#organization`,
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    alternateName: SITE_CONFIG.tradeName,
    url: baseUrl,
    logo: `${baseUrl}/icons/icon-512x512.png`,
    image: `${baseUrl}/icons/icon-512x512.png`,
    description: SITE_CONFIG.description,
    telephone: SITE_CONFIG.telephone,
    email: SITE_CONFIG.email,
    founder: {
      "@type": "Person",
      name: SITE_CONFIG.founder,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address.street,
      addressLocality: SITE_CONFIG.address.city,
      addressRegion: SITE_CONFIG.address.state,
      postalCode: SITE_CONFIG.address.postalCode,
      addressCountry: SITE_CONFIG.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE_CONFIG.geo.latitude,
      longitude: SITE_CONFIG.geo.longitude,
    },
    areaServed: SITE_CONFIG.areaServed.map((item) => ({
      "@type": "City",
      name: item.name,
    })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "08:00",
        closes: "20:00",
      },
    ],
    priceRange: "$$$$",
    sameAs: [
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.linkedin,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
