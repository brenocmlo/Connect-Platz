"use client";

import React, { useState } from "react";
import { X, User, Phone, Mail, Building, DollarSign, Tag, MapPin, Loader2 } from "lucide-react";
import { CepInput, CpfInput } from "@/components/crm/primitives";
import { LocationData } from "@/lib/services/location";

export interface NewLeadFormData {
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
  cep?: string;
  bairro?: string;
  cidade?: string;
  empreendimentoInteresse?: string;
  temperatura?: "FRIO" | "MORNO" | "QUENTE";
  origem?: string;
  rendaDeclarada?: number;
  stageId?: string;
  funil?: string;
  observacoes?: string;
}

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Deve resolver `true` quando o lead foi gravado; em falha o modal permanece aberto. */
  onSubmit: (leadData: NewLeadFormData) => Promise<boolean> | boolean | void;
  availableStages?: { id: string; nome: string }[];
}

export function NewLeadModal({
  isOpen,
  onClose,
  onSubmit,
  availableStages = [],
}: NewLeadModalProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [empreendimento, setEmpreendimento] = useState("");
  const [origem, setOrigem] = useState("Manual / Corretor");
  const [renda, setRenda] = useState("");
  const [stageId, setStageId] = useState(availableStages[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [observacoes, setObservacoes] = useState("");

  // Etapas chegam da API depois da montagem: garante uma etapa válida selecionada
  React.useEffect(() => {
    if (!availableStages.some((s) => s.id === stageId)) setStageId(availableStages[0]?.id || "");
  }, [availableStages, stageId]);

  if (!isOpen) return null;

  const handleAddressFound = (addr: LocationData) => {
    setBairro(addr.bairro);
    setCidade(`${addr.cidade} - ${addr.uf}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const ok = await onSubmit({
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email.trim() || undefined,
      cpf: cpf.trim() || undefined,
      cep: cep.trim() || undefined,
      bairro: bairro.trim() || undefined,
      cidade: cidade.trim() || undefined,
      empreendimentoInteresse: empreendimento.trim() || undefined,
      origem,
      rendaDeclarada: renda ? Number(renda.replace(/\D/g, "")) : undefined,
      stageId: stageId || undefined,
      observacoes: observacoes.trim() || undefined,
    });
    setIsSubmitting(false);
    if (ok === false) return; // erro já exibido em toast; mantém os dados digitados

    // Reset
    setNome("");
    setTelefone("");
    setEmail("");
    setCpf("");
    setCep("");
    setBairro("");
    setCidade("");
    setEmpreendimento("");
    setRenda("");
    setObservacoes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-connect-blue/15 text-connect-blue flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Novo Lead Manual</h3>
              <p className="text-[11px] text-muted-foreground">
                Cadastre um cliente diretamente na esteira de atendimento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário com Scroll Interno */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Nome e Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-foreground font-semibold mb-1">
                Nome do Lead <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1">
                Telefone / WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="tel"
                  required
                  placeholder="85999887766"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                />
              </div>
            </div>
          </div>

          {/* E-mail e Empreendimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-foreground font-semibold mb-1">E-mail (Opcional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="carlos@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1">
                Empreendimento de Interesse
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Ex: Reserva Imperial"
                  value={empreendimento}
                  onChange={(e) => setEmpreendimento(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                />
              </div>
            </div>
          </div>

          {/* CPF e CEP com Autocompletar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-foreground font-semibold mb-1">CPF (Opcional)</label>
              <CpfInput value={cpf} onChange={(val) => setCpf(val)} />
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1">CEP de Residência (Opcional)</label>
              <CepInput
                value={cep}
                onChange={setCep}
                onAddressFound={handleAddressFound}
              />
              {bairro && cidade && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {bairro}, {cidade}
                </p>
              )}
            </div>
          </div>

          {/* Renda e Etapa Inicial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-foreground font-semibold mb-1">Renda Declarada (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Ex: 15000"
                  value={renda}
                  onChange={(e) => setRenda(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                />
              </div>
            </div>

            {availableStages.length > 0 && (
              <div>
                <label className="block text-foreground font-semibold mb-1">Etapa Inicial</label>
                <select
                  value={stageId}
                  onChange={(e) => setStageId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                >
                  {availableStages.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Canal de Origem (o score/temperatura é calculado automaticamente pelo servidor) */}
          <div>
            <label className="block text-foreground font-semibold mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" /> Canal de Origem
            </label>
            <select
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
            >
              <option value="Manual / Corretor">Manual / Corretor</option>
              <option value="Meta Ads">Meta Ads (Instagram / Facebook)</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Catálogo Site">Catálogo do Site</option>
              <option value="Indicação">Indicação</option>
              <option value="WhatsApp">WhatsApp Direto</option>
              <option value="Portal Imobiliário">Portal Imobiliário (Zap/OLX)</option>
            </select>
          </div>

          {/* Observações / Anotações Iniciais */}
          <div>
            <label className="block text-foreground font-semibold mb-1">
              Observações Iniciais do Lead
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Descreva perfil, interesse ou notas sobre a captação..."
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue resize-none"
            />
          </div>

          {/* Rodapé Fixo */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white font-bold shadow-md shadow-connect-blue/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100 flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Cadastrar Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
