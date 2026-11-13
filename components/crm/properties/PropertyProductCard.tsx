"use client";

import React from "react";
import {
  Building2,
  MapPin,
  Maximize,
  Bed,
  Bath,
  Car,
  Eye,
  Globe,
  MessageSquare,
  FileText,
  Camera,
  Trash2,
} from "lucide-react";
import { PropertyMenu } from "./PropertyMenu";
import { formatCardPriceLabel, getModalityBadgeMeta, getStageBadgeClass } from "./propertyFicha";

export interface PropertyCardData {
  id: string;
  nome: string;
  slug?: string;
  tipoCadastro?: "EMPREENDIMENTO" | "AVULSO" | string;
  modalidade?: "VENDA" | "VERANEIO_TEMPORADA" | "LOCACAO_ANUAL" | "AMBOS" | "REPASSE" | string;
  estagioObra?: string | null;
  valorVenda?: number | null;
  valorDiaria?: number | null;
  valorAluguel?: number | null;
  valorRepasse?: number | null;
  saldoDevedor?: number | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
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
  cep?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
  _count?: { materials?: number; sales?: number };
}

interface PropertyProductCardProps {
  property: PropertyCardData;
  onOpenDetails: (prop: PropertyCardData) => void;
  onOpenPublishModal: (prop: PropertyCardData) => void;
  onOpenMaterials?: (prop: PropertyCardData) => void;
  onOpenEditImage?: (prop: PropertyCardData) => void;
  onToggleLandingPage: (id: string, current: boolean) => Promise<void>;
  onDelete?: (id: string) => Promise<void> | void;
  onPermanentDelete?: (id: string) => Promise<void> | void;
}

export function PropertyProductCard({
  property,
  onOpenDetails,
  onOpenPublishModal,
  onOpenMaterials,
  onOpenEditImage,
  onDelete,
  onPermanentDelete,
}: PropertyProductCardProps) {
  const isEmpreendimento = property.tipoCadastro !== "AVULSO";
  const isNaLanding = property.exibirNaLandingPage !== false;
  const coverPhoto = property.fotos && property.fotos.length > 0 && property.fotos[0] ? property.fotos[0] : null;
  const priceLabel = formatCardPriceLabel(property);
  const rendaIdeal = property.valorVenda
    ? `R$ ${Math.round(property.valorVenda * 0.01).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês`
    : "R$ 4.500,00/mês";

  const construtora = property.construtora || "Platz Incorporadora";
  const refCode = property.codigoRef || `REF-${property.id.slice(0, 6).toUpperCase()}`;
  const estagio = property.estagioObra || (isEmpreendimento ? "Lançamento" : "Pronto para Morar");
  const modalityBadge = getModalityBadgeMeta(property.modalidade);
  const canDeleteCard = Boolean(onDelete || onPermanentDelete);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Olá! Ficha do empreendimento "${property.nome}" (${priceLabel}) em ${property.bairro || ""}, ${property.cidade || ""}.`
  )}`;

  return (
    <div className="relative bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-connect-blue/40 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* 1. Imagem de capa ~16:9 — overflow-hidden isolado na mídia para não cortar o dropdown de ações */}
        <div className="relative aspect-[16/9] w-full">
          <div className="absolute inset-0 overflow-hidden rounded-t-xl bg-gradient-to-br from-connect-blue/10 via-muted to-muted/80">
            {coverPhoto ? (
              <img
                src={coverPhoto}
                alt={property.nome}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60">
                <Building2 className="w-10 h-10 mb-1 text-connect-blue/40" />
                <span className="text-[11px] font-semibold">Sem foto cadastrada</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium pointer-events-none">
              <span className="flex items-center gap-1 drop-shadow-md truncate">
                <MapPin className="w-3.5 h-3.5 text-platz-gold shrink-0" />
                <span className="truncate">
                  {property.bairro || "Centro"}, {property.cidade || "Fortaleza"}
                </span>
              </span>
              <span className="text-[11px] font-mono text-white/90 drop-shadow shrink-0 ml-2">{refCode}</span>
            </div>
          </div>

          {/* Botão '⋮' e edição de imagem fora do overflow-hidden para o menu nunca ser recortado */}
          <div className="absolute top-2.5 left-2.5 z-30 flex items-center gap-1.5">
            <PropertyMenu
              propertyId={property.id}
              propertyName={property.nome}
              isNaLanding={isNaLanding}
              onOpenDetails={() => onOpenDetails(property)}
              onOpenPublishModal={() => onOpenPublishModal(property)}
              onOpenMaterials={onOpenMaterials ? () => onOpenMaterials(property) : undefined}
              onOpenEditImage={onOpenEditImage ? () => onOpenEditImage(property) : undefined}
              onDelete={onDelete ? () => onDelete(property.id) : undefined}
              onPermanentDelete={onPermanentDelete ? () => onPermanentDelete(property.id) : undefined}
            />

            {onOpenEditImage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditImage(property);
                }}
                aria-label="Alterar foto de capa"
                title="Alterar imagem do imóvel"
                className="w-8 h-8 rounded-lg bg-black/60 hover:bg-connect-blue text-white backdrop-blur-md shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Pílulas de status no canto superior direito */}
          <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1.5 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow border ${getStageBadgeClass(
                  estagio
                )}`}
              >
                {estagio}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow ${modalityBadge.className}`}
              >
                {modalityBadge.label}
              </span>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow backdrop-blur-md flex items-center gap-1 border transition-colors ${
                isNaLanding
                  ? "bg-emerald-600/90 text-white border-emerald-400/50"
                  : "bg-black/60 text-white/80 border-white/20"
              }`}
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              {isNaLanding ? "Na Landing Page" : "Oculto no Site"}
            </span>
          </div>
        </div>

        {/* 2. Corpo do Card */}
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-0.5">
              <span className="font-semibold uppercase tracking-wider truncate max-w-[170px]">{construtora}</span>
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

          <div className="bg-muted/30 border border-border/60 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Valor</span>
              <span className="text-base font-black text-connect-blue">{priceLabel}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Renda Ideal</span>
              <span className="text-xs font-bold text-foreground">{rendaIdeal}</span>
            </div>
          </div>

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

      {/* 3. Rodapé com Ações */}
      <div className="px-4 pb-4 pt-1 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenDetails(property)}
          className="flex-1 bg-connect-blue/10 hover:bg-connect-blue text-connect-blue hover:text-white border border-connect-blue/30 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ver Detalhes</span>
        </button>

        {onOpenMaterials && (
          <button
            type="button"
            onClick={() => onOpenMaterials(property)}
            className="p-2 rounded-xl border border-connect-blue/30 bg-connect-blue/5 hover:bg-connect-blue/15 text-connect-blue transition-all shadow-sm"
            title="Materiais & Anexos (PDF)"
            aria-label={`Materiais de ${property.nome}`}
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => onOpenPublishModal(property)}
          className={`p-2 rounded-xl border text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${
            isNaLanding
              ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
              : "bg-muted hover:bg-muted/80 text-muted-foreground border-border"
          }`}
          title={isNaLanding ? "Publicado na Landing Page" : "Oculto na Landing Page"}
          aria-label={isNaLanding ? `Ocultar ${property.nome} do site` : `Publicar ${property.nome} no site`}
        >
          <Globe className="w-3.5 h-3.5" />
        </button>

        {canDeleteCard && (
          <button
            type="button"
            onClick={() => (onDelete ? onDelete(property.id) : onPermanentDelete?.(property.id))}
            className="p-2 rounded-xl border border-red-500/25 bg-red-500/5 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white transition-all shadow-sm"
            title="Remover ou apagar imóvel"
            aria-label={`Excluir ${property.nome}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="bg-[#16A34A] hover:bg-[#15803D] text-white p-2 rounded-xl transition-all shadow-sm hover:scale-105"
          title="Compartilhar no WhatsApp"
          aria-label={`Compartilhar ${property.nome} no WhatsApp`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
