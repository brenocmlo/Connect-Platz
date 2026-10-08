"use client";

import React from "react";
import { Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, ShieldCheck, Youtube } from "lucide-react";
import { PortalLogo } from "./PortalUI";
import { scrollToId, waLink } from "./portalUtils";

interface PortalFooterProps {
  onNavigateVitrine: (modalidade: "VENDA" | "VERANEIO") => void;
}

const SOCIAL = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
];

const linkClass = "text-left text-sm text-white/75 transition-colors hover:text-white";

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

export function PortalFooter({ onNavigateVitrine }: PortalFooterProps) {
  return (
    <footer>
      <div className="border-t border-white/5 bg-portal-navy text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr_auto]">
          <div>
            <PortalLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              Intermediação imobiliária, vendas de alto padrão e gestão de locação por temporada no Ceará.
            </p>
            <p className="mt-4 text-xs text-white/50">CNPJ 53.758.699/0001-10 | CRECI 023456-J</p>
          </div>

          <FooterColumn title="Imóveis">
            <button type="button" onClick={() => onNavigateVitrine("VENDA")} className={linkClass}>
              Imóveis à venda
            </button>
            <button type="button" onClick={() => onNavigateVitrine("VERANEIO")} className={linkClass}>
              Aluguel por temporada
            </button>
            <button type="button" onClick={() => scrollToId("simulador")} className={linkClass}>
              Simular financiamento
            </button>
          </FooterColumn>

          <FooterColumn title="Connect Platz">
            <button type="button" onClick={() => scrollToId("sobre")} className={linkClass}>
              Sobre nós
            </button>
            <button type="button" onClick={() => scrollToId("diretorio")} className={linkClass}>
              Guia de bairros
            </button>
            <a href="/login" className={linkClass}>
              Área do corretor
            </a>
          </FooterColumn>

          <FooterColumn title="Atendimento">
            <span className="flex items-start gap-2 text-sm text-white/75">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-platz-gold" />
              Fortaleza e Aquiraz, Ceará
              <br />
              Seg. a sáb., das 8h às 20h
            </span>
            <a href="mailto:contato@connectplatz.com.br" className={`${linkClass} flex items-center gap-2`}>
              <Mail className="h-4 w-4 text-platz-gold" />
              contato@connectplatz.com.br
            </a>
            <a
              href={waLink("Olá! Gostaria de falar com a Connect Platz.")}
              target="_blank"
              rel="noreferrer"
              className={`${linkClass} flex items-center gap-2`}
            >
              <MessageCircle className="h-4 w-4 text-platz-gold" />
              WhatsApp
            </a>
          </FooterColumn>

          <FooterColumn title="Siga a Connect Platz">
            <div className="flex gap-2">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:scale-105 hover:bg-connect-blue"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </FooterColumn>
        </div>
      </div>

      <div className="bg-portal-mist">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-sm text-portal-slate sm:flex-row sm:px-6 sm:text-left">
          <p>© {new Date().getFullYear()} Connect Platz Imobiliária. Todos os direitos reservados.</p>
          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            Site seguro e adequado à LGPD
          </span>
        </div>
      </div>
    </footer>
  );
}
