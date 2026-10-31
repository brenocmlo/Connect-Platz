"use client";

import React, { useState, useMemo, useEffect } from "react";
import { X, Building2, User, ChevronDown, Calendar, CreditCard, AlertCircle } from "lucide-react";
import { BookingItem } from "./types";
import { useCrmLookups } from "@/components/crm/agenda/useCrmLookups";
import { NumericInput } from "@/components/crm/primitives/NumericInput";
import { LeadDetail } from "@/components/crm/LeadDrawer";

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: BookingItem) => void;
  preselectedLead?: LeadDetail | null;
}

export function NewBookingModal({ isOpen, onClose, onSubmit, preselectedLead }: NewBookingModalProps) {
  const { properties, leads, loading } = useCrmLookups({
    enabled: isOpen,
    properties: true,
    leads: true,
  });

  // Imóveis disponíveis para locação / temporada
  const rentalProperties = useMemo(() => {
    const filtered = properties.filter(
      (p) => !p.modalidade || p.modalidade === "VERANEIO_TEMPORADA" || p.modalidade === "LOCACAO_ANUAL"
    );
    return filtered.length > 0 ? filtered : properties;
  }, [properties]);

  // Form State
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [imovelCustomNome, setImovelCustomNome] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [locatarioNome, setLocatarioNome] = useState("");
  const [checkIn, setCheckIn] = useState("2026-11-01");
  const [checkOut, setCheckOut] = useState("2026-11-05");
  const [valorDiaria, setValorDiaria] = useState(1200);
  const [taxaLimpeza, setTaxaLimpeza] = useState(250);
  const [meioPagamento, setMeioPagamento] = useState<BookingItem["meioPagamento"]>("PIX");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset e inicialização ao abrir
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (preselectedLead) {
        setSelectedLeadId(preselectedLead.id);
        setLocatarioNome(preselectedLead.nome);
        if (preselectedLead.empreendimentoInteresse) {
          const matched = rentalProperties.find((p) =>
            p.nome.toLowerCase().includes(preselectedLead.empreendimentoInteresse!.toLowerCase())
          );
          if (matched) {
            setSelectedPropertyId(matched.id);
            setImovelCustomNome(matched.nome);
            if (matched.valorDiaria) setValorDiaria(matched.valorDiaria);
            if (matched.taxaLimpeza) setTaxaLimpeza(matched.taxaLimpeza);
          }
        }
      } else if (rentalProperties.length > 0 && !selectedPropertyId) {
        const first = rentalProperties[0];
        setSelectedPropertyId(first.id);
        setImovelCustomNome(first.nome);
        if (first.valorDiaria) setValorDiaria(first.valorDiaria);
        if (first.taxaLimpeza) setTaxaLimpeza(first.taxaLimpeza);
      }
    }
  }, [isOpen, rentalProperties, selectedPropertyId, preselectedLead]);

  // Ao selecionar imóvel no dropdown
  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    const prop = rentalProperties.find((p) => p.id === propertyId);
    if (prop) {
      setImovelCustomNome(prop.nome);
      if (prop.valorDiaria) setValorDiaria(prop.valorDiaria);
      if (prop.taxaLimpeza) setTaxaLimpeza(prop.taxaLimpeza);
    }
  };

  // Ao selecionar lead do Kanban no dropdown
  const handleLeadChange = (leadId: string) => {
    setSelectedLeadId(leadId);
    if (leadId === "MANUAL") {
      setLocatarioNome("");
      return;
    }
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setLocatarioNome(lead.nome);
      // Se o lead tiver empreendimento de interesse compatível, selecionar imóvel
      if (lead.empreendimentoInteresse) {
        const matched = rentalProperties.find((p) =>
          p.nome.toLowerCase().includes(lead.empreendimentoInteresse!.toLowerCase())
        );
        if (matched) {
          handlePropertyChange(matched.id);
        }
      }
    }
  };

  const diffTime = Math.abs(new Date(checkOut).getTime() - new Date(checkIn).getTime());
  const calculatedNights = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
  const totalCalculado = calculatedNights * valorDiaria + taxaLimpeza;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const finalImovelNome =
      rentalProperties.find((p) => p.id === selectedPropertyId)?.nome ||
      imovelCustomNome ||
      "Imóvel de Temporada";

    const newBooking: BookingItem = {
      id: `bk-${Date.now()}`,
      imovelNome: finalImovelNome,
      locatarioNome: locatarioNome.trim() || "Hóspede Cadastrado",
      checkIn,
      checkOut,
      diarias: calculatedNights,
      valorDiaria,
      taxaLimpeza,
      valorTotal: totalCalculado,
      meioPagamento,
      status: "CONFIRMADA",
    };

    try {
      if (selectedPropertyId && selectedLeadId && selectedLeadId !== "MANUAL") {
        await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId: selectedPropertyId,
            leadId: selectedLeadId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            valorDiarias: valorDiaria * calculatedNights,
            taxaLimpeza,
            meioPagamento,
            observacoes: "Reserva de temporada confirmada pelo Corretor de Aluguel.",
          }),
        });
      }
      onSubmit(newBooking);
      onClose();
    } catch {
      onSubmit(newBooking);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground">Nova Reserva com Bloqueio de Calendário</h3>
            <p className="text-xs text-muted-foreground">Vincule um lead do Kanban e bloqueie o calendário sem conflitos.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* 1. SELETOR DE IMÓVEL DE LOCAÇÃO COM SETA */}
          <div>
            <label className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
              <Building2 className="w-3.5 h-3.5 text-connect-blue" />
              Imóvel Disponível para Locação *
            </label>
            <div className="relative">
              <select
                value={selectedPropertyId}
                onChange={(e) => handlePropertyChange(e.target.value)}
                required
                className="w-full bg-muted/60 border border-border rounded-xl p-2.5 pr-8 text-foreground font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-connect-blue cursor-pointer"
              >
                <option value="">Selecione o imóvel de veraneio...</option>
                {rentalProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} {p.cidade ? `• ${p.cidade}` : ""} {p.valorDiaria ? `(Diária: R$ ${p.valorDiaria})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 2. SELETOR DE HÓSPEDE / LEAD DO KANBAN COM SETA */}
          <div>
            <label className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
              <User className="w-3.5 h-3.5 text-connect-blue" />
              Hóspede / Lead do Kanban de Aluguel *
            </label>
            <div className="relative mb-2">
              <select
                value={selectedLeadId}
                onChange={(e) => handleLeadChange(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl p-2.5 pr-8 text-foreground font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-connect-blue cursor-pointer"
              >
                <option value="">Selecione um lead vindo do Kanban...</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome} {l.telefone ? `• ${l.telefone}` : ""} {l.corretorNome ? `(Corretor: ${l.corretorNome})` : ""}
                  </option>
                ))}
                <option value="MANUAL">+ Inserir Hóspede Avulso (Não cadastrado no CRM)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Nome do Hóspede (confirmado ou editável) */}
            <input
              type="text"
              required
              placeholder="Nome completo do hóspede..."
              value={locatarioNome}
              onChange={(e) => setLocatarioNome(e.target.value)}
              className="w-full bg-muted/40 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
            />
          </div>

          {/* 3. DATAS CHECK-IN E CHECK-OUT */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-muted-foreground font-semibold mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-platz-gold" />
                Data Check-in *
              </label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-muted-foreground font-semibold mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-platz-gold" />
                Data Check-out *
              </label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
          </div>

          {/* 4. VALORES & PAGAMENTO */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Valor da Diária (R$)</label>
              <NumericInput
                value={valorDiaria}
                onChange={setValorDiaria}
                placeholder="0,00"
                className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Taxa Limpeza (R$)</label>
              <NumericInput
                value={taxaLimpeza}
                onChange={setTaxaLimpeza}
                placeholder="0,00"
                className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Meio Pagamento</label>
              <select
                value={meioPagamento}
                onChange={(e) => setMeioPagamento(e.target.value as any)}
                className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
              >
                <option value="PIX">PIX</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                <option value="BOLETO">Boleto</option>
                <option value="TED">TED</option>
              </select>
            </div>
          </div>

          {/* 5. RESUMO DE CÁLCULO */}
          <div className="p-3 bg-muted/70 border border-border rounded-xl flex items-center justify-between font-bold">
            <span className="text-muted-foreground">Total ({calculatedNights} noites + Limpeza):</span>
            <span className="text-amber-700 dark:text-[#F8DA56] text-sm">
              {totalCalculado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>

          {/* 6. BOTÕES DE AÇÃO */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white font-extrabold shadow-sm transition-all hover:scale-[1.02] disabled:opacity-60"
            >
              {submitting ? "Processando Reserva..." : "Confirmar Reserva & Bloquear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
