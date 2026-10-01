"use client";

import React from "react";
import { MapPin, Maximize, Bed, Bath, Car, MessageSquare } from "lucide-react";

export interface PropertyItem {
  id: string;
  nome: string;
  slug: string;
  modalidade: "VENDA" | "VERANEIO_TEMPORADA" | "AMBOS";
  faixaPreco?: string;
  valorVenda?: number | null;
  valorDiaria?: number | null;
  cidade: string;
  estado: string;
  bairro: string;
  endereco?: string | null;
  descricao?: string | null;
  caracteristicas?: {
    area_m2?: number;
    quartos?: number;
    suites?: number;
    vagas?: number;
    [key: string]: any;
  };
  diferenciais?: string[];
  fotos?: string[];
}

interface PortalPropertyCardProps {
  property: PropertyItem;
  onSelect: (prop: PropertyItem) => void;
  formatPrice: (prop: PropertyItem) => string;
}

export function PortalPropertyCard({
  property,
  onSelect,
  formatPrice,
}: PortalPropertyCardProps) {
  const isTemporada = property.modalidade === "VERANEIO_TEMPORADA";

  return (
    <div className="bg-[#111827] border border-[#1F2937] hover:border-connect-blue/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group">
      {/* Imagem do Imóvel com Tags */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={
            property.fotos?.[0] ||
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
          }
          alt={property.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow ${
              isTemporada
                ? "bg-[#D9BB4C] text-black font-extrabold"
                : "bg-[#1266C7] text-white"
            }`}
          >
            {isTemporada ? "Temporada / Diária" : "Venda"}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-1 text-xs font-semibold drop-shadow">
            <MapPin className="w-3.5 h-3.5 text-[#D9BB4C]" />
            {property.bairro}, {property.cidade}
          </div>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-extrabold text-white mt-1 group-hover:text-connect-blue transition-colors">
            {property.nome}
          </h3>

          {/* Preço */}
          <p className="text-xl font-black text-[#D9BB4C] mt-2">
            {formatPrice(property)}
          </p>

          {/* Metadados Técnicos */}
          <div className="grid grid-cols-4 gap-2 border-y border-[#1F2937] py-3 mt-4 text-slate-300 text-xs">
            <div className="flex flex-col items-center">
              <Maximize className="w-3.5 h-3.5 text-slate-400 mb-1" />
              <span>{property.caracteristicas?.area_m2 || 120} m²</span>
            </div>
            <div className="flex flex-col items-center">
              <Bed className="w-3.5 h-3.5 text-slate-400 mb-1" />
              <span>{property.caracteristicas?.quartos || 3} Qts</span>
            </div>
            <div className="flex flex-col items-center">
              <Bath className="w-3.5 h-3.5 text-slate-400 mb-1" />
              <span>{property.caracteristicas?.suites || 2} Suítes</span>
            </div>
            <div className="flex flex-col items-center">
              <Car className="w-3.5 h-3.5 text-slate-400 mb-1" />
              <span>{property.caracteristicas?.vagas || 2} Vagas</span>
            </div>
          </div>

          {/* Diferenciais */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(property.diferenciais || []).slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-[#080C14] text-slate-400 px-2 py-0.5 rounded border border-[#1F2937]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Botões de Ação Direta */}
        <div className="mt-5 pt-3 border-t border-[#1F2937] flex items-center gap-2">
          <button
            onClick={() => onSelect(property)}
            className="flex-1 bg-[#111827] hover:bg-[#1F2937] border border-[#1F2937] text-white text-xs font-bold py-2.5 rounded-xl transition-colors text-center"
          >
            Ver Detalhes
          </button>

          <a
            href={`https://wa.me/5585999990001?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20im%C3%B3vel%20"${encodeURIComponent(
              property.nome
            )}" (${formatPrice(property)})`}
            target="_blank"
            rel="noreferrer"
            className="bg-[#16A34A] hover:bg-[#15803D] text-white p-2.5 rounded-xl transition-colors shadow-md"
            title="Chamar no WhatsApp Web"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
