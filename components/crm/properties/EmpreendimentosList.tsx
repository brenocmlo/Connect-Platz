"use client";

import React, { useState } from "react";
import { Building2, Globe, MapPin, Layers, Eye, Share2, Plus, Sparkles, Check } from "lucide-react";
import { EmpreendimentoData } from "./EspelhoVendasModal";

interface EmpreendimentosListProps {
  empreendimentos: EmpreendimentoData[];
  onOpenEspelho: (emp: EmpreendimentoData) => void;
  onOpenNewModal: () => void;
  onToggleLandingPage: (id: string, current: boolean) => Promise<void>;
  loadingToggleId: string | null;
}

export function EmpreendimentosList({
  empreendimentos,
  onOpenEspelho,
  onOpenNewModal,
  onToggleLandingPage,
  loadingToggleId,
}: EmpreendimentosListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (emp: EmpreendimentoData) => {
    const url = `${window.location.origin}/espelho/${emp.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(emp.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-connect-blue" />
            Empreendimentos & Lançamentos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerencie condomínios, edifícios, matrizes de andares e links públicos de espelho.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="bg-connect-blue hover:bg-[#0D478F] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-connect-blue/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Novo Empreendimento
        </button>
      </div>

      {empreendimentos.length === 0 ? (
        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-3xl p-12 text-center text-slate-400 space-y-4">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhum empreendimento cadastrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Cadastre seu primeiro edifício ou condomínio com geração automática de unidades e espelho de vendas.
          </p>
          <button
            onClick={onOpenNewModal}
            className="bg-connect-blue text-white text-xs font-bold px-4 py-2.5 rounded-xl"
          >
            Cadastrar Agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {empreendimentos.map((emp) => {
            const units = emp.units || [];
            const totalUnits = units.length;
            const disponiveis = units.filter((u) => u.status === "DISPONIVEL").length;
            const reservadas = units.filter((u) => u.status === "RESERVADA").length;
            const vendidas = units.filter((u) => u.status === "VENDIDA").length;
            const isNaLanding = emp.exibirNaLandingPage !== false;

            return (
              <div
                key={emp.id}
                className="bg-[#0A0E17] border border-[#1C2537] hover:border-connect-blue/50 rounded-2xl overflow-hidden shadow-xl transition-all flex flex-col"
              >
                {/* Imagem com Badges e Toggle da Landing Page */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      emp.fotos?.[0] ||
                      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={emp.nome}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-connect-blue text-white shadow">
                      {emp.estagioObra || "Lançamento"}
                    </span>
                  </div>

                  {/* TOGGLE VISUAL NA LANDING PAGE */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => onToggleLandingPage(emp.id, isNaLanding)}
                      disabled={loadingToggleId === emp.id}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all ${
                        isNaLanding
                          ? "bg-emerald-500/90 text-white border border-emerald-400/50"
                          : "bg-slate-900/90 text-slate-400 border border-slate-700"
                      }`}
                      title="Clique para ativar/desativar este empreendimento na Landing Page"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {loadingToggleId === emp.id
                        ? "Salvando..."
                        : isNaLanding
                        ? "Na Landing Page: ATIVO"
                        : "Oculto na Landing"}
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1 text-xs font-semibold drop-shadow">
                      <MapPin className="w-3.5 h-3.5 text-[#D9BB4C]" />
                      {emp.bairro}, {emp.cidade}
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-white">{emp.nome}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {emp.descricao || "Empreendimento com infraestrutura completa de lazer e segurança."}
                    </p>

                    {/* Ficha Resumida do Espelho */}
                    <div className="grid grid-cols-4 gap-2 bg-[#080C14] border border-[#1C2537] p-2.5 rounded-xl text-center text-xs mt-3">
                      <div>
                        <p className="text-slate-500 font-bold text-[10px]">TOTAL</p>
                        <p className="font-extrabold text-white">{totalUnits}</p>
                      </div>
                      <div>
                        <p className="text-emerald-400 font-bold text-[10px]">DISPONÍVEIS</p>
                        <p className="font-extrabold text-emerald-300">{disponiveis}</p>
                      </div>
                      <div>
                        <p className="text-amber-400 font-bold text-[10px]">RESERVADAS</p>
                        <p className="font-extrabold text-amber-300">{reservadas}</p>
                      </div>
                      <div>
                        <p className="text-red-400 font-bold text-[10px]">VENDIDAS</p>
                        <p className="font-extrabold text-red-300">{vendidas}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ações: Ver Espelho & Compartilhar */}
                  <div className="pt-3 border-t border-[#1C2537] flex items-center gap-2">
                    <button
                      onClick={() => onOpenEspelho(emp)}
                      className="flex-1 bg-connect-blue/20 hover:bg-connect-blue text-blue-300 hover:text-white border border-connect-blue/40 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Layers className="w-4 h-4" />
                      Ver Espelho de Vendas
                    </button>

                    <button
                      onClick={() => handleCopyLink(emp)}
                      className="bg-[#111827] hover:bg-[#1C2537] border border-[#1C2537] text-white p-2.5 rounded-xl transition-all"
                      title="Copiar link público do espelho para o cliente"
                    >
                      {copiedId === emp.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4 text-[#D9BB4C]" />
                      )}
                    </button>

                    <a
                      href={`/espelho/${emp.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#111827] hover:bg-[#1C2537] border border-[#1C2537] text-white p-2.5 rounded-xl transition-all"
                      title="Abrir espelho público"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
