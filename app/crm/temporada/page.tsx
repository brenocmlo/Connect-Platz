"use client";

import React, { useState } from "react";
import {
  Calendar,
  ShieldCheck,
  Palmtree,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { TrendBadge } from "@/components/crm/primitives/TrendBadge";
import { BookingItem } from "@/components/crm/temporada/types";
import { NewBookingModal } from "@/components/crm/temporada/NewBookingModal";

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
  const { user, setActionMessage, hideValues } = useCrm();
  const canManageRental =
    user?.role === "ADMINISTRADOR" ||
    user?.role === "FINANCEIRO_ALUGUEL" ||
    user?.role === "CORRETOR_ALUGUEL";
  const [bookings, setBookings] = useState<BookingItem[]>(mockBookings);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookingCreated = (newBooking: BookingItem) => {
    setBookings([newBooking, ...bookings]);
    setActionMessage(
      `Reserva confirmada de ${newBooking.checkIn} a ${newBooking.checkOut}! O calendário foi bloqueado e o lançamento efetuado no ERP.`
    );
    setTimeout(() => setActionMessage(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. CABEÇALHO PADRÃO SEÇÃO 5.2 */}
      <PageHeader
        title="Temporada & Veraneio"
        subtitle="Gestão de diárias, bloqueio estrito de calendário sem conflitos e conciliação automática no ERP."
        actionLabel={canManageRental ? "Nova Reserva" : undefined}
        onActionClick={canManageRental ? () => setIsModalOpen(true) : undefined}
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

      {/* 4. MODAL NOVA RESERVA COM SELETORES DINÂMICOS */}
      <NewBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBookingCreated}
      />
    </div>
  );
}
