"use client";

import React, { useState, useEffect } from "react";
import { X, User, FileText, Plus } from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { LeadDocumentUploadSlots } from "./LeadDocumentUploadSlots";

interface EditLeadModalProps {
  isOpen: boolean;
  lead: LeadDetail | null;
  stages?: { id: string; nome: string }[];
  onClose: () => void;
  onSave: (updated: LeadDetail) => void;
}

export function EditLeadModal({ isOpen, lead, stages, onClose, onSave }: EditLeadModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "docs">("info");
  const [formData, setFormData] = useState<Partial<LeadDetail>>({});
  const [selectedFunnel, setSelectedFunnel] = useState("Lançamentos de Médio & Alto Padrão");

  useEffect(() => {
    if (lead) {
      setFormData({ ...lead });
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...lead, ...formData } as LeadDetail);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay escurecido bg-black/60 */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
      />

      {/* Modal Central ~450px */}
      <div className="relative w-full max-w-[480px] bg-card border border-border rounded-xl shadow-2xl flex flex-col max-h-[90vh] z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 1. TOPO: Título, Seletor de Funil e ✕ Circular */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-muted/20">
          <div>
            <h3 className="text-sm font-bold text-foreground">Editar Lead</h3>
            <span className="text-[11px] text-muted-foreground font-mono">ID: {lead.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedFunnel}
              onChange={(e) => setSelectedFunnel(e.target.value)}
              className="bg-background border border-border text-[11px] font-semibold rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
            >
              <option>Lançamentos de Médio & Alto Padrão</option>
              <option>Imóveis Prontos & Avulsos</option>
              <option>Aluguel de Temporada</option>
            </select>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Fechar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. BLOCO DE RESPONSÁVEL & STATUS / ETAPA */}
        <div className="p-3.5 bg-muted/40 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-connect-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {lead.corretor?.nome ? lead.corretor.nome[0] : "R"}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                Corretor Responsável
              </span>
              <span className="text-xs font-bold text-foreground truncate block">
                {lead.corretor?.nome || "Sem corretor (Bolsão)"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[11px] font-semibold text-muted-foreground">Etapa *:</span>
            <select
              value={formData.stageId || lead.stageId}
              onChange={(e) => setFormData({ ...formData, stageId: e.target.value })}
              className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-connect-blue"
            >
              {stages && stages.length > 0 ? (
                stages.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.nome}
                  </option>
                ))
              ) : (
                <>
                  <option value="stage-1">Novo Lead</option>
                  <option value="stage-2">Primeiro Contato</option>
                  <option value="stage-3">Visita Agendada</option>
                  <option value="stage-4">Proposta Enviada</option>
                  <option value="stage-5">Análise de Crédito</option>
                  <option value="stage-6">Fechado / Ganho</option>
                  <option value="stage-7">Encerrado</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* 3. TABS: Informações do Lead | Documentos */}
        <div className="flex border-b border-border bg-muted/20 px-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "info"
                ? "border-connect-blue text-connect-blue"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Informações do Lead
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("docs")}
            className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "docs"
                ? "border-connect-blue text-connect-blue"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Documentos
          </button>
        </div>

        {/* 4. CONTEÚDO COM SCROLL INTERNO */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {activeTab === "info" ? (
            <div className="space-y-3">
              {/* Grid 2 colunas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome || ""}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.telefone || ""}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf || ""}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    RG
                  </label>
                  <input
                    type="text"
                    placeholder="0.000.000"
                    value={formData.rg || ""}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Estado Civil
                  </label>
                  <select
                    value={formData.estadoCivil || "SOLTEIRO"}
                    onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
                  >
                    <option value="SOLTEIRO">Solteiro(a)</option>
                    <option value="CASADO">Casado(a)</option>
                    <option value="UNIAO_ESTAVEL">União Estável</option>
                    <option value="DIVORCIADO">Divorciado(a)</option>
                    <option value="VIUVO">Viúvo(a)</option>
                  </select>
                </div>
              </div>

              {/* Renda declarada & Origem */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Renda Declarada (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.rendaDeclarada || ""}
                    onChange={(e) => setFormData({ ...formData, rendaDeclarada: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Origem
                  </label>
                  <select
                    value={formData.source || "Meta Ads"}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue"
                  >
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="Catálogo">Catálogo</option>
                    <option value="Orgânico">Orgânico</option>
                    <option value="MANUAL_CORRETOR">Manual Corretor</option>
                  </select>
                </div>
              </div>

              {/* Observações */}
              <div className="pt-2 border-t border-border">
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Observações do Lead
                </label>
                <textarea
                  rows={3}
                  placeholder="Informações adicionais sobre perfil, condições de pagamento ou preferências..."
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-connect-blue resize-none"
                />
              </div>
            </div>
          ) : (
            <LeadDocumentUploadSlots />
          )}

          {/* 5. RODAPÉ FIXO: Cancelar (ghost) + Salvar Alterações (primário) */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2 bg-card">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-connect-blue hover:bg-connect-deep-blue text-white shadow-sm shadow-connect-blue/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
