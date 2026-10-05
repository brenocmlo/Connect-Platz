"use client";

import React, { useState } from "react";
import { Clock, Layers, AlertCircle, Save, ShieldCheck } from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { useCrm } from "@/components/crm/CrmContext";

interface StageConfig {
  id: string;
  nome: string;
  slaMinutes: number;
  acaoExpiracao: "bolsao" | "notificar";
}

export function SlaEngineTab() {
  const { setActionMessage } = useCrm();

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
    setActionMessage("Parâmetros do motor de SLA e Bolsão salvos com sucesso!");
    setTimeout(() => setActionMessage(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. JANELA OPERACIONAL & TOLERÂNCIA DE TRANSBORDO */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <SectionTitle title="Janela Operacional & Tolerância de Transbordo" />
        <p className="text-xs text-muted-foreground">
          Controle de horários comerciais e limite máximo de resposta antes que o lead transborde para o Bolsão.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">
              Tempo Limite para 1º Contato
            </label>
            <div className="relative">
              <input
                type="number"
                value={bolsaoTimeout}
                onChange={(e) => setBolsaoTimeout(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground text-[11px]">minutos</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">Padrão contratual: 20 min</span>
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">
              Início da Janela Operacional
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
              />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">Leads anteriores aguardam fila</span>
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">
              Fim da Janela Operacional
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
              />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">Após as 22h retém na fila noturna</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <label className="flex items-center justify-between p-3.5 bg-muted/40 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Bolsão de Oportunidades Automático Ativo
              </span>
              <span className="text-[11px] text-muted-foreground">
                Redistribui leads estourados para corretores com status &quot;Disponível&quot;
              </span>
            </div>
            <input
              type="checkbox"
              checked={bolsaoEnabled}
              onChange={(e) => setBolsaoEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-connect-blue focus:ring-connect-blue"
            />
          </label>
        </div>
      </div>

      {/* 2. CONFIGURAÇÃO DE SLAS POR ETAPA */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <SectionTitle title="Configuração de SLAs por Etapa do Funil" />
        <p className="text-xs text-muted-foreground">
          Prazos determinísticos de permanência máxima por etapa e ação de expiração programada.
        </p>

        <div className="space-y-3 pt-2">
          {stages.map((st, idx) => (
            <div
              key={st.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-muted/40 border border-border rounded-xl text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-connect-blue/10 text-connect-blue font-bold flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                <span className="font-bold text-foreground text-xs">{st.nome}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">SLA Máximo:</span>
                  <input
                    type="number"
                    value={st.slaMinutes}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStages((prev) =>
                        prev.map((s) => (s.id === st.id ? { ...s, slaMinutes: val } : s))
                      );
                    }}
                    className="w-20 bg-background border border-border rounded-lg p-1.5 text-foreground text-center font-mono font-bold"
                  />
                  <span className="text-muted-foreground">min</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Ao estourar:</span>
                  <select
                    value={st.acaoExpiracao}
                    onChange={(e) => {
                      const val = e.target.value as "bolsao" | "notificar";
                      setStages((prev) =>
                        prev.map((s) => (s.id === st.id ? { ...s, acaoExpiracao: val } : s))
                      );
                    }}
                    className="bg-background border border-border rounded-lg p-1.5 text-foreground text-xs"
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

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-connect-blue hover:bg-connect-blue/90 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-md shadow-connect-blue/20 transition-all hover:scale-[1.02] flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Regras de SLA
        </button>
      </div>
    </form>
  );
}
