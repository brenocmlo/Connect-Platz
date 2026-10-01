"use client";

import React, { useState, useEffect } from "react";
import {
  Kanban as KanbanIcon,
  List,
  Search,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { LeadDrawer, LeadDetail } from "@/components/crm/LeadDrawer";
import { KanbanBoard, FunnelColumn } from "@/components/crm/leads/KanbanBoard";
import { LeadsTable } from "@/components/crm/leads/LeadsTable";
import { BolsaoSection } from "@/components/crm/leads/BolsaoSection";
import { NewLeadModal } from "@/components/crm/leads/NewLeadModal";

const defaultStages: FunnelColumn[] = [
  { id: "stage-1", nome: "Novo Lead", posicao: 1, cor: "#1266C7", slaMinutes: 20 },
  { id: "stage-2", nome: "Primeiro Contato", posicao: 2, cor: "#0D478F", slaMinutes: 120 },
  { id: "stage-3", nome: "Visita Agendada", posicao: 3, cor: "#D9BB4C", slaMinutes: 2880 },
  { id: "stage-4", nome: "Proposta Enviada", posicao: 4, cor: "#F59E0B", slaMinutes: 1440 },
  { id: "stage-5", nome: "Análise de Crédito", posicao: 5, cor: "#8B5CF6", slaMinutes: 4320 },
  { id: "stage-6", nome: "Fechado / Ganho", posicao: 6, cor: "#10B981", slaMinutes: null },
  { id: "stage-7", nome: "Encerrado", posicao: 7, cor: "#64748B", slaMinutes: null },
];

export default function LeadsPage() {
  const { token } = useCrm();
  const [viewMode, setViewMode] = useState<"kanban" | "table" | "bolsao">("kanban");
  const [selectedFunnel, setSelectedFunnel] = useState("Lançamentos de Médio & Alto Padrão");
  const [searchQuery, setSearchQuery] = useState("");
  const [temperatureFilter, setTemperatureFilter] = useState<string>("TODAS");

  const [leads, setLeads] = useState<LeadDetail[]>([]);
  const [stages] = useState<FunnelColumn[]>(defaultStages);
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  useEffect(() => {
    if (token) fetchLeads(token);
  }, [token]);

  const fetchLeads = async (authToken: string) => {
    try {
      const res = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error("Erro ao buscar leads:", err);
    }
  };

  const handleDropLead = async (leadId: string, targetStageId: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stageId: targetStageId } : l))
    );

    if (token) {
      try {
        await fetch(`/api/leads/${leadId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stageId: targetStageId }),
        });
      } catch (err) {
        console.error("Erro ao mover lead:", err);
      }
    }
  };

  const handleCreateManualLead = async (leadData: { nome: string; telefone: string; email?: string }) => {
    if (!token) return;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...leadData, source: "MANUAL_CORRETOR", stageId: "stage-1" }),
      });
      if (res.ok) fetchLeads(token);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.telefone.includes(searchQuery);
    const matchesTemp =
      temperatureFilter === "TODAS" || lead.temperatura === temperatureFilter;
    const matchesBolsao = viewMode === "bolsao" ? lead.isBolsao : !lead.isBolsao;
    return matchesSearch && matchesTemp && matchesBolsao;
  });

  const bolsaoCount = leads.filter((l) => l.isBolsao).length;

  return (
    <div className="space-y-4 max-w-full">
      {/* 1. BARRA SUPERIOR DE FILTROS & AÇÕES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedFunnel}
            onChange={(e) => setSelectedFunnel(e.target.value)}
            className="bg-[#111827] border border-[#1F2937] hover:border-connect-blue/50 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option>Lançamentos de Médio & Alto Padrão</option>
            <option>Imóveis Prontos & Avulsos</option>
            <option>Aluguel de Temporada (Veraneio)</option>
            <option>Programa Minha Casa Minha Vida</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#080C14] border border-[#1F2937] text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-connect-blue w-64"
            />
          </div>

          <select
            value={temperatureFilter}
            onChange={(e) => setTemperatureFilter(e.target.value)}
            className="bg-[#111827] border border-[#1F2937] text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="TODAS">Todas Temperaturas</option>
            <option value="QUENTE">🔥 Quente</option>
            <option value="MORNO">☕ Morno</option>
            <option value="FRIO">🧊 Frio</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#080C14] border border-[#1F2937] rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "kanban" ? "bg-connect-blue text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "table" ? "bg-connect-blue text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tabela
            </button>
            <button
              onClick={() => setViewMode("bolsao")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "bolsao" ? "bg-amber-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Bolsão ({bolsaoCount})
            </button>
          </div>

          <button
            onClick={() => setIsNewLeadModalOpen(true)}
            className="bg-[#D9BB4C] hover:bg-[#C5A73D] text-black font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#D9BB4C]/15 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Novo Lead
          </button>
        </div>
      </div>

      {/* 2. CONTEÚDO DAS VISÕES MODULARIZADAS */}
      {viewMode === "kanban" && (
        <KanbanBoard
          stages={stages}
          leads={filteredLeads}
          onSelectLead={setSelectedLead}
          onDropLead={handleDropLead}
        />
      )}

      {viewMode === "table" && (
        <LeadsTable
          leads={filteredLeads}
          stages={stages}
          onSelectLead={setSelectedLead}
        />
      )}

      {viewMode === "bolsao" && (
        <BolsaoSection
          leads={leads}
          onTakeover={(leadId) => {
            alert("Lead assumido com sucesso! O temporizador de SLA de 20 minutos foi iniciado.");
            setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, isBolsao: false } : l)));
          }}
        />
      )}

      {/* 3. MODAIS E DRAWER */}
      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSubmit={handleCreateManualLead}
      />

      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onTakeoverBolsao={(leadId) => {
          setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, isBolsao: false } : l)));
        }}
      />
    </div>
  );
}
