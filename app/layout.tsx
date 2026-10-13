import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#1266C7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Robson Carvalho CRM CONNECT PLATZ — Vendas & Veraneio",
  description:
    "Plataforma Integrada de CRM e ERP Imobiliário com Roleta de Leads, Análise de Crédito e Bloqueio de Reservas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Connect Platz CRM",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark font-sans" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
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
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-connect-blue selection:text-white">
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
