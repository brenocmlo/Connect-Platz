import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { getBaseUrl } from "@/lib/seo/siteConfig";

// app/sitemap.ts
// Mapa do site dinâmico gerado em tempo de execução para indexação instantânea de imóveis no Googlebot.

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidação a cada 1 hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  // Rotas fixas do portal
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#vitrine`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#simulador`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#diretorio`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#sobre`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    const properties = await prisma.property.findMany({
      where: {
        isActive: true,
        exibirNaLandingPage: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
      url: `${baseUrl}/imoveis/${encodeURIComponent(p.slug)}`,
      lastModified: p.updatedAt || now,
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    return [...staticRoutes, ...propertyRoutes];
  } catch (error) {
    console.error("Falha ao consultar imóveis no sitemap:", error);
    return staticRoutes;
  }
}
