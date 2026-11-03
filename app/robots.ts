import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo/siteConfig";

// app/robots.ts
// Diretrizes de rastreamento para Googlebot, Bingbot e crawlers de busca.
// Libera páginas públicas do portal e veta o rastreamento do painel administrativo, APIs e área de login.

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/imoveis",
          "/imoveis/*",
          "/espelho/*",
          "/icons/*",
          "/manifest.json",
        ],
        disallow: [
          "/crm",
          "/crm/*",
          "/api",
          "/api/*",
          "/login",
          "/_next/*",
        ],
      },
      // Regra específica para o Googlebot-Image
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/uploads/*", "/icons/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
