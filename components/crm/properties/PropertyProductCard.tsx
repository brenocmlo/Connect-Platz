"use client";

import React from "react";
import {
  Building2,
  Home,
  MapPin,
  Maximize,
  Bed,
  Bath,
  Car,
  Eye,
  Globe,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { PropertyMenu } from "./PropertyMenu";

export interface PropertyCardData {
  id: string;
  nome: string;
  slug?: string;
  tipoCadastro?: "EMPREENDIMENTO" | "AVULSO" | string;
  modalidade?: "VENDA" | "VERANEIO_TEMPORADA" | "AMBOS" | string;
  estagioObra?: string | null;
  valorVenda?: number | null;
  valorDiaria?: number | null;
  bairro?: string | null;
  cidade?: string | null;
  descricao?: string | null;
  fotos?: string[];
  caracteristicas?: {
    area_m2?: number;
    quartos?: number;
    suites?: number;
    vagas?: number;
    [key: string]: any;
  };
  diferenciais?: string[];
  exibirNaLandingPage?: boolean;
  units?: any[];
  construtora?: string | null;
  codigoRef?: string | null;
}

interface PropertyProductCardProps {
  property: PropertyCardData;
  onOpenDetails: (prop: PropertyCardData) => void;
  onOpenPublishModal: (prop: PropertyCardData) => void;
  onToggleLandingPage: (id: string, current: boolean) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function PropertyProductCard({
  property,
  onOpenDetails,
  onOpenPublishModal,
  onToggleLandingPage,
  onDelete,
}: PropertyProductCardProps) {
  const isEmpreendimento = property.tipoCadastro !== "AVULSO";
  const isTemporada = property.modalidade === "VERANEIO_TEMPORADA";
  const isNaLanding = property.exibirNaLandingPage !== false;

  // Foto de capa ou fallback
  const coverPhoto =
    property.fotos && property.fotos.length > 0 && property.fotos[0]
      ? property.fotos[0]
      : null;

  // Preço formatado
  const formatPrice = () => {
    if (isTemporada && property.valorDiaria) {
      return `R$ ${Number(property.valorDiaria).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })} / diária`;
    }
    if (property.valorVenda) {
      const prefix = isEmpreendimento ? "A partir de " : "";
      return `${prefix}R$ ${Number(property.valorVenda).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`;
    }
    return "A consultar";
  };

  // Renda ideal calculada determinística (aprox 1% do valor do imóvel como renda mensal familiar sugerida)
  const rendaIdeal = property.valorVenda
    ? `R$ ${Math.round(property.valorVenda * 0.01).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}/mês`
    : "R$ 4.500,00/mês";

  // Construtora e Código de Referência
  const construtora = property.construtora || "Platz Incorporadora";
  const refCode = property.codigoRef || `REF-${property.id.slice(0, 6).toUpperCase()}`;

  // Status da Obra / Lançamento
  const estagio = property.estagioObra || (isEmpreendimento ? "Lançamento" : "Pronto para Morar");

  const getStatusBadgeStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("lançamento"))
      return "bg-emerald-600 text-white border-emerald-500/40";
    if (s.includes("obra") || s.includes("construção"))
      return "bg-amber-600 text-white border-amber-500/40";
    if (s.includes("pronto"))
      return "bg-sky-600 text-white border-sky-500/40";
    if (s.includes("vendido"))
      return "bg-orange-600 text-white border-orange-500/40";
    return "bg-connect-blue text-white border-connect-blue/40";
  };

  // WhatsApp wa.me direct link
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Olá! Ficha do empreendimento "${property.nome}" (${formatPrice()}) em ${
      property.bairro || ""
    }, ${property.cidade || ""}.`
  )}`;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-connect-blue/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* 1. Imagem de capa ~16:9 (Seção 5.6) */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-connect-blue/10 via-muted to-muted/80">
          {coverPhoto ? (
            <img
              src={coverPhoto}
              alt={property.nome}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60">
              <Building2 className="w-10 h-10 mb-1 text-connect-blue/40" />
              <span className="text-[11px] font-semibold">Sem foto cadastrada</span>
            </div>
          )}

          {/* Gradiente escuro para legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

          {/* Botão quadrado primário '⋮' no canto superior esquerdo (Seção 5.6) */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <PropertyMenu
              propertyId={property.id}
              propertyName={property.nome}
              isNaLanding={isNaLanding}
              onOpenDetails={() => onOpenDetails(property)}
              onOpenPublishModal={() => onOpenPublishModal(property)}
              onDelete={onDelete ? () => onDelete(property.id) : undefined}
            />
          </div>

          {/* Pílulas de status sobre a imagem no canto superior direito (Seção 5.6) */}
          <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow border ${getStatusBadgeStyle(
                  estagio
                )}`}
              >
                {estagio}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-connect-blue text-white shadow">
                Ativo
              </span>
            </div>

            {/* Pílula de publicação na Landing Page */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow backdrop-blur-md flex items-center gap-1 border transition-colors ${
                isNaLanding
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50"
                  : "bg-black/60 text-slate-400 border-slate-700/60"
              }`}
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              {isNaLanding ? "Na Landing Page" : "Oculto no Site"}
            </span>
          </div>

          {/* Cidade e Bairro na base da imagem */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
            <span className="flex items-center gap-1 drop-shadow-md">
              <MapPin className="w-3.5 h-3.5 text-platz-gold" />
              {property.bairro || "Centro"}, {property.cidade || "Fortaleza"}
            </span>
            <span className="text-[11px] font-mono text-slate-200/90 drop-shadow">
              {refCode}
            </span>
          </div>
        </div>

        {/* 2. Corpo do Card (Seção 5.6) */}
        <div className="p-4 space-y-3">
          {/* Nome, Construtora e Tipo */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-0.5">
              <span className="font-semibold uppercase tracking-wider truncate max-w-[170px]">
                {construtora}
              </span>
              <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-bold">
                {isEmpreendimento ? "Empreendimento" : "Imóvel Avulso"}
              </span>
            </div>
            <h3
              onClick={() => onOpenDetails(property)}
              className="text-base font-bold text-foreground hover:text-connect-blue transition-colors cursor-pointer line-clamp-1"
              title={property.nome}
            >
              {property.nome}
            </h3>
          </div>

          {/* Preço em cor primária + Renda ideal */}
          <div className="bg-muted/30 border border-border/60 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                Valor
              </span>
              <span className="text-base font-black text-connect-blue">
                {formatPrice()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                Renda Ideal
              </span>
              <span className="text-xs font-bold text-foreground">
                {rendaIdeal}
              </span>
            </div>
          </div>

          {/* Ícones de quartos, banheiros, vagas, área */}
          <div className="grid grid-cols-4 gap-1 border-t border-b border-border/70 py-2 text-center text-xs text-muted-foreground">
            <div>
              <Maximize className="w-3.5 h-3.5 mx-auto mb-0.5 text-connect-blue" />
              <span className="font-semibold text-foreground text-[11px]">
                {property.caracteristicas?.area_m2 || 95} m²
              </span>
            </div>
            <div>
              <Bed className="w-3.5 h-3.5 mx-auto mb-0.5 text-connect-blue" />
              <span className="font-semibold text-foreground text-[11px]">
                {property.caracteristicas?.quartos || 3} Qts
              </span>
            </div>
            <div>
              <Bath className="w-3.5 h-3.5 mx-auto mb-0.5 text-connect-blue" />
              <span className="font-semibold text-foreground text-[11px]">
                {property.caracteristicas?.suites || 2} Stes
              </span>
            </div>
            <div>
              <Car className="w-3.5 h-3.5 mx-auto mb-0.5 text-connect-blue" />
              <span className="font-semibold text-foreground text-[11px]">
                {property.caracteristicas?.vagas || 2} Vgs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Rodapé com Ações (Seção 5.6 + instruções de Landing Page) */}
      <div className="px-4 pb-4 pt-1 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenDetails(property)}
          className="flex-1 bg-connect-blue/10 hover:bg-connect-blue text-connect-blue hover:text-white border border-connect-blue/30 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ver Detalhes</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenPublishModal(property)}
          className={`p-2 rounded-xl border text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${
            isNaLanding
              ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
              : "bg-muted hover:bg-muted/80 text-muted-foreground border-border"
          }`}
          title={isNaLanding ? "Publicado na Landing Page" : "Oculto na Landing Page"}
        >
          <Globe className="w-3.5 h-3.5" />
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="bg-[#16A34A] hover:bg-[#15803D] text-white p-2 rounded-xl transition-all shadow-sm hover:scale-105"
          title="Compartilhar no WhatsApp"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
