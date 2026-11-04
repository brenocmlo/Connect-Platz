import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG, getBaseUrl } from "@/lib/seo/siteConfig";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { PublicTrackingScripts } from "@/components/tracking/PublicTrackingScripts";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const viewport: Viewport = {
  themeColor: "#1266C7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Connect Platz Imobiliária | Imóveis de Alto Padrão e Temporada em Fortaleza e Ceará",
    template: "%s | Connect Platz",
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.founder, url: baseUrl }],
  generator: "Next.js",
  keywords: [
    "imobiliária fortaleza",
    "imóveis à venda fortaleza",
    "casas em condomínio eusébio",
    "aluguel temporada porto das dunas",
    "apartamentos meireles aldeota",
    "imóveis de alto padrão ceará",
    "robson carvalho corretor",
    "connect platz imobiliária",
    "beach park imóveis aquiraz",
  ],
  manifest: "/manifest.json",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    siteName: SITE_CONFIG.name,
    title: "Connect Platz Imobiliária | Imóveis de Alto Padrão e Temporada em Fortaleza",
    description: SITE_CONFIG.description,
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Connect Platz Imobiliária — Alto Padrão & Temporada",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Connect Platz Imobiliária | Imóveis de Alto Padrão no Ceará",
    description: SITE_CONFIG.description,
    images: ["/icons/icon-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Connect Platz CRM",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  other: {
    "geo.region": SITE_CONFIG.geo.region,
    "geo.placename": SITE_CONFIG.geo.placename,
    "geo.position": `${SITE_CONFIG.geo.latitude};${SITE_CONFIG.geo.longitude}`,
    ICBM: SITE_CONFIG.geo.icbm,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`dark font-sans ${dmSans.className} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* Aplica tema e tamanho de fonte de acessibilidade salvos antes da primeira pintura */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{
              if(localStorage.getItem('connect_platz_theme')==='light')document.documentElement.classList.remove('dark');
              var f=localStorage.getItem('connect_platz_font_size');
              if(f)document.documentElement.setAttribute('data-font-size',f);
            }catch(e){}`,
          }}
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <OrganizationJsonLd />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-connect-blue selection:text-white">
        <PublicTrackingScripts />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
