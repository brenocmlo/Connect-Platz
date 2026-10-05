"use client";

import React, { useState } from "react";
import {
  Calendar,
  ShieldCheck,
  X,
  Palmtree,
  CreditCard,
  Building,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { TrendBadge } from "@/components/crm/primitives/TrendBadge";

interface BookingItem {
  id: string;
  imovelNome: string;
  locatarioNome: string;
  checkIn: string;
  checkOut: string;
  diarias: number;
  valorDiaria: number;
  taxaLimpeza: number;
  valorTotal: number;
  meioPagamento: "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "BOLETO" | "TED";
  status: "CONFIRMADA" | "PENDENTE" | "CONCLUIDA";
}

const mockBookings: BookingItem[] = [
  {
    id: "bk-1",
    imovelNome: "Villa Platz Beach • Bangalô Coral Frente Mar",
    locatarioNome: "Família Dr. Rodrigo Fontes",
    checkIn: "2026-10-10",
    checkOut: "2026-10-15",
    diarias: 5,
    valorDiaria: 1200,
    taxaLimpeza: 250,
    valorTotal: 6250,
    meioPagamento: "PIX",
    status: "CONFIRMADA",
  },
  {
    id: "bk-2",
    imovelNome: "Solarium Porto das Dunas • Cobertura",
    locatarioNome: "Carla Mendes",
    checkIn: "2026-10-18",
    checkOut: "2026-10-22",
    diarias: 4,
    valorDiaria: 950,
    taxaLimpeza: 200,
    valorTotal: 4000,
    meioPagamento: "CARTAO_CREDITO",
    status: "CONFIRMADA",
  },
];

export default function TemporadaVeraneioPage() {
  const { setActionMessage, hideValues } = useCrm();
  const [bookings, setBookings] = useState<BookingItem[]>(mockBookings);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [imovel, setImovel] = useState("Villa Platz Beach • Bangalô Coral Frente Mar");
  const [cliente, setCliente] = useState("");
  const [checkIn, setCheckIn] = useState("2026-11-01");
  const [checkOut, setCheckOut] = useState("2026-11-05");
  const [valorDiaria, setValorDiaria] = useState(1200);
  const [taxaLimpeza, setTaxaLimpeza] = useState(250);
  const [meioPagamento, setMeioPagamento] = useState<"PIX" | "CARTAO_CREDITO" | "BOLETO">("PIX");

  const diffTime = Math.abs(new Date(checkOut).getTime() - new Date(checkIn).getTime());
  const calculatedNights = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
  const totalCalculado = calculatedNights * valorDiaria + taxaLimpeza;

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking: BookingItem = {
      id: `bk-${Date.now()}`,
      imovelNome: imovel,
      locatarioNome: cliente || "Hóspede Cadastrado",
      checkIn,
      checkOut,
      diarias: calculatedNights,
      valorDiaria,
      taxaLimpeza,
      valorTotal: totalCalculado,
      meioPagamento,
      status: "CONFIRMADA",
    };
    setBookings([newBooking, ...bookings]);
    setIsModalOpen(false);
    setActionMessage(
      `Reserva confirmada de ${checkIn} a ${checkOut}! O calendário foi bloqueado e o lançamento efetuado no ERP.`
    );
    setTimeout(() => setActionMessage(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. CABEÇALHO PADRÃO SEÇÃO 5.2 */}
      <PageHeader
        title="Temporada & Veraneio"
        subtitle="Gestão de diárias, bloqueio estrito de calendário sem conflitos e conciliação automática no ERP."
        actionLabel="Nova Reserva"
        onActionClick={() => setIsModalOpen(true)}
        showPeriodSelector={true}
        showExportButton={true}
      />

      {/* 2. STATCARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-platz-gold/15 text-platz-gold">
              <Palmtree className="w-4 h-4" />
            </div>
            <TrendBadge value="+24%" isPositive={true} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Faturamento em Diárias
            </span>
            <span className="text-2xl font-black text-amber-700 dark:text-[#F8DA56] mt-1 block">
              {hideValues ? "••••••" : <CountUpNumber value={10250} prefix="R$ " decimals={2} />}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-connect-blue/10 text-connect-blue">
              <Calendar className="w-4 h-4" />
            </div>
            <TrendBadge value="+5 noites" isPositive={true} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Diárias Reservadas no Mês
            </span>
            <span className="text-2xl font-black text-foreground mt-1 block">
              <CountUpNumber value={9} suffix=" Noites" />
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
              Ativo
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Prevenção de Overbooking
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              100% Protegido
            </span>
          </div>
        </div>
      </div>

      {/* 3. LISTAGEM DE RESERVAS ATIVAS */}
      <div className="space-y-3">
        <SectionTitle>Reservas Confirmadas & Calendário Bloqueado</SectionTitle>

        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-connect-blue/30 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{b.imovelNome}</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Hóspede: <strong className="text-foreground">{b.locatarioNome}</strong>
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono pt-1">
                  <span className="flex items-center gap-1 text-amber-700 dark:text-platz-gold">
                    <Calendar className="w-3.5 h-3.5" />
                    {b.checkIn} até {b.checkOut} ({b.diarias} diárias)
                  </span>
                  <span>• Taxa Limpeza: R$ {b.taxaLimpeza}</span>
                  <span className="text-connect-blue font-semibold">• Meio: {b.meioPagamento}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-base font-black text-amber-700 dark:text-[#F8DA56]">
                  {hideValues ? "••••••" : b.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                  Conciliado no Caixa
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MODAL NOVA RESERVA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Nova Reserva com Bloqueio de Calendário</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Imóvel de Veraneio</label>
                <input
                  type="text"
                  value={imovel}
                  onChange={(e) => setImovel(e.target.value)}
                  className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Nome do Hóspede / Lead</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Família Dr. Marcelo"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Data Check-in</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Data Check-out</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Valor da Diária (R$)</label>
                  <input
                    type="number"
                    value={valorDiaria}
                    onChange={(e) => setValorDiaria(Number(e.target.value))}
                    className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-connect-blue"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Taxa Limpeza (R$)</label>
                  <input
                    type="number"
                    value={taxaLimpeza}
                    onChange={(e) => setTaxaLimpeza(Number(e.target.value))}
                    className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-connect-blue"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Meio de Pagamento</label>
                  <select
                    value={meioPagamento}
                    onChange={(e) => setMeioPagamento(e.target.value as any)}
                    className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue"
                  >
                    <option value="PIX">PIX</option>
                    <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                    <option value="BOLETO">Boleto</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-muted/70 border border-border rounded-xl flex items-center justify-between font-bold">
                <span className="text-muted-foreground">Total ({calculatedNights} noites + Limpeza):</span>
                <span className="text-amber-700 dark:text-[#F8DA56] text-sm">
                  {totalCalculado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white font-extrabold shadow-sm transition-all"
                >
                  Confirmar Reserva & Bloquear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
