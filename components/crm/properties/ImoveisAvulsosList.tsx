"use client";

import React from "react";
import { Home, Globe, MapPin, Maximize, Bed, Bath, Car, MessageSquare, Plus, Trash2 } from "lucide-react";

export interface ImovelAvulsoData {
  id: string;
  nome: string;
  slug: string;
  modalidade: "VENDA" | "VERANEIO_TEMPORADA" | "AMBOS";
  valorVenda?: number | any;
  valorDiaria?: number | any;
  bairro?: string | null;
  cidade?: string | null;
  descricao?: string | null;
  fotos?: string[];
  caracteristicas?: any;
  diferenciais?: string[];
  exibirNaLandingPage?: boolean;
}

interface ImoveisAvulsosListProps {
  imoveis: ImovelAvulsoData[];
  onOpenNewModal: () => void;
  onToggleLandingPage: (id: string, current: boolean) => Promise<void>;
  onDeleteImovel: (id: string) => Promise<void>;
  loadingToggleId: string | null;
}

export function ImoveisAvulsosList({
  imoveis,
  onOpenNewModal,
  onToggleLandingPage,
  onDeleteImovel,
  loadingToggleId,
}: ImoveisAvulsosListProps) {
  const formatPrice = (imovel: ImovelAvulsoData) => {
    if (imovel.modalidade === "VERANEIO_TEMPORADA" && imovel.valorDiaria) {
      return `R$ ${Number(imovel.valorDiaria).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / diária`;
    }
    if (imovel.valorVenda) {
      return `R$ ${Number(imovel.valorVenda).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    }
    return "Consulte";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-[#D9BB4C]" />
            Imóveis Avulsos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Casas, apartamentos prontos, coberturas e locações de temporada individuais.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="bg-[#D9BB4C] hover:bg-[#C4A73D] text-black text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#D9BB4C]/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Novo Imóvel Avulso
        </button>
      </div>

      {imoveis.length === 0 ? (
        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-3xl p-12 text-center text-slate-400 space-y-4">
          <Home className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhum imóvel avulso cadastrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Cadastre imóveis prontos para venda ou temporada e selecione para exibir diretamente no site público.
          </p>
          <button
            onClick={onOpenNewModal}
            className="bg-[#D9BB4C] text-black text-xs font-extrabold px-4 py-2.5 rounded-xl"
          >
            Cadastrar Imóvel Avulso
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imoveis.map((imovel) => {
            const isTemporada = imovel.modalidade === "VERANEIO_TEMPORADA";
            const isNaLanding = imovel.exibirNaLandingPage !== false;

            return (
              <div
                key={imovel.id}
                className="bg-[#0A0E17] border border-[#1C2537] hover:border-connect-blue/50 rounded-2xl overflow-hidden shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Foto com Tags e Toggle */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        imovel.fotos?.[0] ||
                        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
                      }
                      alt={imovel.nome}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />

                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow ${
                          isTemporada
                            ? "bg-[#D9BB4C] text-black font-extrabold"
                            : "bg-connect-blue text-white"
                        }`}
                      >
                        {isTemporada ? "Temporada" : "Venda"}
                      </span>
                    </div>

                    {/* TOGGLE VISUAL NA LANDING PAGE */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => onToggleLandingPage(imovel.id, isNaLanding)}
                        disabled={loadingToggleId === imovel.id}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all ${
                          isNaLanding
                            ? "bg-emerald-500/90 text-white border border-emerald-400/50"
                            : "bg-slate-900/90 text-slate-400 border border-slate-700"
                        }`}
                        title="Clique para ativar/desativar este imóvel na Landing Page"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {loadingToggleId === imovel.id
                          ? "Salvando..."
                          : isNaLanding
                          ? "Na Landing: ATIVO"
                          : "Oculto na Landing"}
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 flex items-center text-white">
                      <div className="flex items-center gap-1 text-xs font-semibold drop-shadow">
                        <MapPin className="w-3.5 h-3.5 text-[#D9BB4C]" />
                        {imovel.bairro}, {imovel.cidade}
                      </div>
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-black text-white">{imovel.nome}</h3>
                      <p className="text-lg font-black text-[#D9BB4C] mt-1">{formatPrice(imovel)}</p>
                    </div>

                    {/* Ficha Técnica */}
                    <div className="grid grid-cols-4 gap-2 border-y border-[#1C2537] py-2.5 text-slate-300 text-xs text-center">
                      <div>
                        <Maximize className="w-3 h-3 text-slate-500 mx-auto mb-1" />
                        <span>{imovel.caracteristicas?.area_m2 || 95} m²</span>
                      </div>
                      <div>
                        <Bed className="w-3 h-3 text-slate-500 mx-auto mb-1" />
                        <span>{imovel.caracteristicas?.quartos || 3} Qts</span>
                      </div>
                      <div>
                        <Bath className="w-3 h-3 text-slate-500 mx-auto mb-1" />
                        <span>{imovel.caracteristicas?.suites || 2} Stes</span>
                      </div>
                      <div>
                        <Car className="w-3 h-3 text-slate-500 mx-auto mb-1" />
                        <span>{imovel.caracteristicas?.vagas || 2} Vgs</span>
                      </div>
                    </div>

                    {/* Diferenciais */}
                    <div className="flex flex-wrap gap-1">
                      {(imovel.diferenciais || []).slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-[#080C14] text-slate-400 px-2 py-0.5 rounded border border-[#1C2537]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <a
                    href={`https://wa.me/5585999990001?text=Ol%C3%A1!%20Ficha%20do%20im%C3%B3vel%20"${encodeURIComponent(
                      imovel.nome
                    )}"%20(${formatPrice(imovel)})`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-[#111827] hover:bg-[#1C2537] border border-[#1C2537] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Enviar no WhatsApp
                  </a>

                  <button
                    onClick={() => onDeleteImovel(imovel.id)}
                    className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 transition-all"
                    title="Excluir imóvel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
