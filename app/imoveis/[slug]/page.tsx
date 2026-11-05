import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getBaseUrl, SITE_CONFIG } from "@/lib/seo/siteConfig";
import { PropertyJsonLd } from "@/components/seo/PropertyJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import {
  PropertyGallery,
  PropertySidebar,
  PropertySpecs,
} from "@/components/portal/PropertyDetailView";
import { getGoogleMapsNavigationUrl, getWazeNavigationUrl, REGIONAL_POIS } from "@/lib/services/location";

export const revalidate = 3600; // ISR: revalidação a cada 1 hora

interface PropertyPageProps {
  params: { slug: string };
}

async function getPropertyBySlug(slug: string) {
  return prisma.property.findFirst({
    where: {
      slug,
      isActive: true,
      exibirNaLandingPage: true,
    },
  });
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const property = await getPropertyBySlug(params.slug);
  if (!property) {
    return {
      title: "Imóvel não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = getBaseUrl();
  const isTemporada =
    property.modalidade === "VERANEIO_TEMPORADA" || property.modalidade === "AMBOS";
  const preco = isTemporada
    ? property.valorDiaria
      ? `R$ ${Number(property.valorDiaria).toLocaleString("pt-BR")}/diária`
      : "Consulte valor"
    : property.valorVenda
      ? `R$ ${Number(property.valorVenda).toLocaleString("pt-BR")}`
      : "Consulte valor";

  const local = [property.bairro, property.cidade, property.estado].filter(Boolean).join(", ");
  const title = `${property.nome} em ${property.bairro || property.cidade || "Fortaleza"} | Connect Platz`;
  const description = `${property.nome} em ${local}. ${isTemporada ? "Aluguel de temporada" : "À venda"} por ${preco}. ${property.descricao ? property.descricao.slice(0, 160) : "Entre em contato para agendar uma visita exclusiva."}`;
  const fotoCapa = property.fotos?.[0] || `${baseUrl}/icons/icon-512x512.png`;
  const canonicalUrl = `${baseUrl}/imoveis/${encodeURIComponent(property.slug)}`;

  const lat = property.latitude ?? SITE_CONFIG.geo.latitude;
  const lng = property.longitude ?? SITE_CONFIG.geo.longitude;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: canonicalUrl,
      title,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: fotoCapa,
          width: 1200,
          height: 630,
          alt: `${property.nome} - Imóvel em ${property.cidade || "Fortaleza"}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fotoCapa],
    },
    other: {
      "geo.region": SITE_CONFIG.geo.region,
      "geo.placename": local || SITE_CONFIG.geo.placename,
      "geo.position": `${lat};${lng}`,
      ICBM: `${lat}, ${lng}`,
    },
  };
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) notFound();

  const baseUrl = getBaseUrl();
  const isTemporada =
    property.modalidade === "VERANEIO_TEMPORADA" || property.modalidade === "AMBOS";
  const valorFormatado = isTemporada
    ? property.valorDiaria
      ? `R$ ${Number(property.valorDiaria).toLocaleString("pt-BR")}`
      : null
    : property.valorVenda
      ? `R$ ${Number(property.valorVenda).toLocaleString("pt-BR")}`
      : null;

  const lat = property.latitude ?? undefined;
  const lng = property.longitude ?? undefined;
  const enderecoCompleto = [property.endereco, property.bairro, property.cidade, property.estado]
    .filter(Boolean)
    .join(", ");

  const gmapsUrl = getGoogleMapsNavigationUrl({ latitude: lat, longitude: lng, address: enderecoCompleto });
  const wazeUrl = getWazeNavigationUrl({ latitude: lat, longitude: lng, address: enderecoCompleto });

  const customPois = (property.caracteristicas as any)?.pontosDeInteresse as Array<{ nome: string; distancia: string }> | undefined;
  const regionalPois = property.bairro ? REGIONAL_POIS[property.bairro] : undefined;
  const pois = customPois
    ? customPois.map((p) => ({ label: `${p.nome} (${p.distancia})` }))
    : regionalPois || [];

  const waMensagem = encodeURIComponent(
    `Olá! Gostaria de mais informações sobre o imóvel: ${property.nome} (${property.cidade || "Fortaleza"}). Link: ${baseUrl}/imoveis/${property.slug}`
  );
  const waUrl = `https://wa.me/5585999999999?text=${waMensagem}`;

  const breadcrumbs = [
    { name: "Início", url: baseUrl },
    { name: "Imóveis", url: `${baseUrl}/#vitrine` },
    { name: property.cidade || "Ceará", url: `${baseUrl}/#vitrine` },
    { name: property.nome, url: `${baseUrl}/imoveis/${property.slug}` },
  ];

  return (
    <div className="min-h-screen bg-portal-mist text-portal-ink">
      <PropertyJsonLd
        property={{
          nome: property.nome,
          slug: property.slug,
          modalidade: property.modalidade,
          descricao: property.descricao,
          valorVenda: property.valorVenda ? Number(property.valorVenda) : null,
          valorDiaria: property.valorDiaria ? Number(property.valorDiaria) : null,
          cidade: property.cidade,
          bairro: property.bairro,
          estado: property.estado,
          endereco: property.endereco,
          cep: property.cep,
          latitude: property.latitude,
          longitude: property.longitude,
          fotos: property.fotos,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
        }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <header className="border-b border-border/40 bg-card/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/#vitrine"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a vitrine</span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Corretor</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Trilha de Navegação visual */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:underline">Início</Link>
          <span>/</span>
          <Link href="/#vitrine" className="hover:underline">Imóveis</Link>
          <span>/</span>
          <span className="text-foreground/80 font-medium">{property.cidade || "Ceará"}</span>
          <span>/</span>
          <span className="text-foreground font-semibold truncate max-w-xs">{property.nome}</span>
        </nav>

        {/* Título & Valor */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-connect-blue/15 text-connect-blue border border-connect-blue/20">
                {isTemporada ? "🏖️ ALUGUEL TEMPORADA" : "🔑 VENDA"}
              </span>
              {property.estagioObra && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                  {property.estagioObra.replace(/_/g, " ")}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {property.nome}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="w-4 h-4 text-connect-blue shrink-0" />
              <span>{[property.endereco, property.bairro, property.cidade, property.estado].filter(Boolean).join(", ")}</span>
            </p>
          </div>

          <div className="lg:text-right bg-card/60 p-4 rounded-xl border border-border/50">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">
              {isTemporada ? "Valor da Diária" : "Valor de Venda"}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-connect-blue">
              {valorFormatado || "Sob Consulta"}
            </span>
            {isTemporada && <span className="text-xs text-muted-foreground block">Mínimo de diárias sob consulta</span>}
          </div>
        </div>

        {/* Galeria de Fotos */}
        <PropertyGallery nome={property.nome} fotos={property.fotos} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal: Ficha Técnica & Descrição */}
          <div className="lg:col-span-2 space-y-6">
            <PropertySpecs
              caracteristicas={property.caracteristicas as any}
              diferenciais={property.diferenciais}
              descricao={property.descricao}
            />
          </div>

          {/* Coluna Lateral: Localização & Ações */}
          <PropertySidebar
            enderecoCompleto={enderecoCompleto}
            gmapsUrl={gmapsUrl}
            wazeUrl={wazeUrl}
            waUrl={waUrl}
            pois={pois}
          />
        </div>
      </main>

      <footer className="border-t border-border mt-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. {SITE_CONFIG.address.formatted}.</p>
        </div>
      </footer>
    </div>
  );
}
