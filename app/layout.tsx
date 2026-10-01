import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Robson Carvalho CRM CONNECT PLATZ — Vendas & Veraneio",
  description: "Plataforma Integrada de CRM e ERP Imobiliário com Roleta de Leads, Análise de Crédito e Bloqueio de Reservas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-[#080C14] text-slate-100 antialiased selection:bg-connect-blue selection:text-white">
        {children}
      </body>
    </html>
  );
}
