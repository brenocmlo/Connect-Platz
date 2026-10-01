"use client";

import React, { useState } from "react";
import {
  Settings,
  Building,
  Clock,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sliders,
  Palette,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";

interface StageConfig {
  id: string;
  nome: string;
  slaMinutes: number;
  acaoExpiracao: "bolsao" | "notificar";
}

export default function ConfiguracoesWhiteLabelPage() {
  const { setActionMessage } = useCrm();

  // Dados da Organização
  const [nomeImobiliaria, setNomeImobiliaria] = useState("Connect Platz Imobiliária");
  const [cnpj, setCnpj] = useState("00.000.000/0001-00");
  const [creci, setCreci] = useState("12345-J");
  const [primaryColor, setPrimaryColor] = useState("#1266C7");
  const [secondaryColor, setSecondaryColor] = useState("#D9BB4C");

  // Regras de Roleta e Bolsão
  const [bolsaoEnabled, setBolsaoEnabled] = useState(true);
  const [bolsaoTimeout, setBolsaoTimeout] = useState(20);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("22:00");

  // Etapas de SLA
  const [stages, setStages] = useState<StageConfig[]>([
    { id: "s-1", nome: "Novo Lead", slaMinutes: 20, acaoExpiracao: "bolsao" },
    { id: "s-2", nome: "Primeiro Contato", slaMinutes: 120, acaoExpiracao: "bolsao" },
    { id: "s-3", nome: "Visita Agendada", slaMinutes: 2880, acaoExpiracao: "notificar" },
    { id: "s-4", nome: "Proposta Enviada", slaMinutes: 1440, acaoExpiracao: "notificar" },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage("Configurações do sistema e regras de SLA salvas com sucesso!");
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. TOPBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#D9BB4C]/15 border border-[#D9BB4C]/30 text-[#D9BB4C]">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Configurações White-Label & Motor de SLA</h2>
            <p className="text-xs text-slate-400">
              Personalização da marca, identidade visual, parametrização do Bolsão e prazos da roleta.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-[#D9BB4C] hover:bg-[#C5A73D] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#D9BB4C]/15 transition-all hover:scale-105"
        >
          <Save className="w-4 h-4" />
          Salvar Alterações
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 2. IDENTIDADE VISUAL WHITE-LABEL */}
        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-[#1C2537] pb-3">
            <Palette className="w-4 h-4 text-connect-blue" />
            Identidade Visual & Dados Institucionais
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={nomeImobiliaria}
                onChange={(e) => setNomeImobiliaria(e.target.value)}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">CRECI Jurídico</label>
              <input
                type="text"
                value={creci}
                onChange={(e) => setCreci(e.target.value)}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Cor Primária (Connect Blue)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-[#1F2937]"
                />
                <span className="font-mono text-white text-xs">{primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Cor Secundária (Platz Gold)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-[#1F2937]"
                />
                <span className="font-mono text-white text-xs">{secondaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PARÂMETROS DA ROLETA & BOLSÃO */}
        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-[#1C2537] pb-3">
            <Clock className="w-4 h-4 text-[#D9BB4C]" />
            Janela Operacional & Tolerância de Transbordo
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Tempo Limite para 1º Contato (Minutos)
              </label>
              <input
                type="number"
                value={bolsaoTimeout}
                onChange={(e) => setBolsaoTimeout(Number(e.target.value))}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Padrão contratual: 20 min</span>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Início da Janela Operacional</label>
              <input
                type="text"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Leads antes deste horário vão para fila</span>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Fim da Janela Operacional</label>
              <input
                type="text"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Após 22:00 retém na fila noturna</span>
            </div>
          </div>
        </div>

        {/* 4. CONFIGURAÇÃO DE SLAS POR ETAPA */}
        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-[#1C2537] pb-3">
            <Layers className="w-4 h-4 text-purple-400" />
            Configuração de SLAs por Etapa do Funil
          </div>

          <div className="space-y-3">
            {stages.map((st, idx) => (
              <div
                key={st.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#0F1624] border border-[#1C2537] rounded-xl text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-white">{st.nome}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">SLA:</span>
                    <input
                      type="number"
                      value={st.slaMinutes}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setStages((prev) =>
                          prev.map((s) => (s.id === st.id ? { ...s, slaMinutes: val } : s))
                        );
                      }}
                      className="w-20 bg-[#080C14] border border-[#1F2937] rounded-lg p-1.5 text-white text-center font-mono"
                    />
                    <span className="text-slate-400">min</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Ao estourar:</span>
                    <select
                      value={st.acaoExpiracao}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setStages((prev) =>
                          prev.map((s) => (s.id === st.id ? { ...s, acaoExpiracao: val } : s))
                        );
                      }}
                      className="bg-[#080C14] border border-[#1F2937] rounded-lg p-1.5 text-white"
                    >
                      <option value="bolsao">Mover para Bolsão</option>
                      <option value="notificar">Apenas Notificar Gestor</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
