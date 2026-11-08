"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  ShieldCheck,
  Palmtree,
  Loader2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { BookingItem } from "@/components/crm/temporada/types";
import { NewBookingModal } from "@/components/crm/temporada/NewBookingModal";
import { EditBookingModal } from "@/components/crm/temporada/EditBookingModal";
import { NewRentalContractModal } from "@/components/crm/temporada/NewRentalContractModal";
import { SeasonBookingsList } from "@/components/crm/temporada/SeasonBookingsList";
import { RentalContractsList, RentalContractItem } from "@/components/crm/temporada/RentalContractsList";

export default function TemporadaVeraneioPage() {
  const { user, setActionMessage, hideValues } = useCrm();
  const canApproveRental =
    user?.role === "ADMINISTRADOR" ||
    user?.role === "ADMINISTRADOR_ALUGUEL" ||
    user?.role === "FINANCEIRO_ALUGUEL";
  const canManageRental = canApproveRental || user?.role === "CORRETOR_ALUGUEL";

  const [activeTab, setActiveTab] = useState<"temporada" | "anual" | "overbooking">("temporada");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [rentals, setRentals] = useState<RentalContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isNewRentalModalOpen, setIsNewRentalModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingItem | null>(null);

  const notify = useCallback(
    (msg: string) => {
      setActionMessage(msg);
      setTimeout(() => setActionMessage(null), 5000);
    },
    [setActionMessage]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resBookings, resRentals] = await Promise.all([
        fetch("/api/bookings", { cache: "no-store" }),
        fetch("/api/rentals", { cache: "no-store" }),
      ]);

      const dataBookings = await resBookings.json().catch(() => ({}));
      const dataRentals = await resRentals.json().catch(() => ({}));

      if (!resBookings.ok) {
        setError(dataBookings?.error || "Erro ao carregar reservas de temporada.");
        return;
      }

      setBookings(dataBookings.bookings || []);
      if (resRentals.ok) {
        setRentals(dataRentals.contracts || []);
      }
    } catch {
      setError("Falha de conexão ao carregar dados de locação.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== "CANCELADA"),
    [bookings]
  );

  const cancelledBookings = useMemo(
    () => bookings.filter((b) => b.status === "CANCELADA"),
    [bookings]
  );

  const activeRentals = useMemo(
    () => rentals.filter((r) => r.status !== "CANCELADO"),
    [rentals]
  );

  const cancelledRentals = useMemo(
    () => rentals.filter((r) => r.status === "CANCELADO"),
    [rentals]
  );

  const totals = useMemo(() => {
    const faturamento = activeBookings.reduce((acc, b) => acc + b.valorTotal, 0);
    const noites = activeBookings.reduce((acc, b) => acc + b.diarias, 0);
    return { faturamento, noites };
  }, [activeBookings]);

  const handleBookingCreated = (newBooking: BookingItem) => {
    setBookings((prev) => [newBooking, ...prev]);
    notify(`Reserva confirmada de ${newBooking.checkIn} a ${newBooking.checkOut}! Calendário bloqueado.`);
  };

  const handleBookingUpdated = (updated: BookingItem) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    notify(
      updated.status === "CANCELADA"
        ? `Reserva de ${updated.locatarioNome} cancelada. Datas liberadas no calendário!`
        : `Reserva de ${updated.locatarioNome} atualizada com sucesso!`
    );
  };

  const handleRentalStatusUpdate = async (id: string, status: "ATIVO" | "CANCELADO") => {
    try {
      const res = await fetch("/api/rentals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(data?.error || "Erro ao atualizar contrato.");
        return;
      }
      setRentals((prev) => prev.map((r) => (r.id === id ? data.contract : r)));
      notify(
        status === "CANCELADO"
          ? `Contrato ${data.contract.codigoContrato} cancelado e movido para o Histórico de Cancelamentos!`
          : `Contrato ${data.contract.codigoContrato} validado e ativado com sucesso!`
      );
    } catch {
      notify("Falha de conexão ao atualizar contrato.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in-up">
      <PageHeader
        title="Gestão de Aluguel & Temporada"
        subtitle="Controle de diárias, locação anual, bloqueio determinístico de calendário e prevenção de overbooking."
        actionLabel={
          canManageRental
            ? activeTab === "temporada"
              ? "Nova Reserva"
              : activeTab === "anual"
              ? "Novo Contrato de Aluguel"
              : undefined
            : undefined
        }
        onActionClick={
          canManageRental
            ? activeTab === "temporada"
              ? () => setIsNewBookingModalOpen(true)
              : activeTab === "anual"
              ? () => setIsNewRentalModalOpen(true)
              : undefined
            : undefined
        }
        showPeriodSelector={true}
        showExportButton={true}
      />

      {/* STATCARDS VIVOS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-platz-gold/15 text-platz-gold">
              <Palmtree className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Confirmado
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Faturamento em Diárias
            </span>
            <span className="text-2xl font-black text-amber-700 dark:text-[#F8DA56] mt-1 block">
              {hideValues ? "••••••" : <CountUpNumber value={totals.faturamento} prefix="R$ " decimals={2} />}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-connect-blue/10 text-connect-blue">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue">
              {activeBookings.length} reservas
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Diárias Reservadas
            </span>
            <span className="text-2xl font-black text-foreground mt-1 block">
              <CountUpNumber value={totals.noites} suffix=" Noites" />
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
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

      {/* TABS DE SELEÇÃO */}
      <div className="flex bg-muted p-1 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveTab("temporada")}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "temporada"
              ? "bg-card text-connect-blue dark:text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Temporada & Veraneio ({activeBookings.length})
        </button>
        <button
          onClick={() => setActiveTab("anual")}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "anual"
              ? "bg-card text-connect-blue dark:text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Locação Anual / Comum ({activeRentals.length})
        </button>
        <button
          onClick={() => setActiveTab("overbooking")}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "overbooking"
              ? "bg-card text-connect-blue dark:text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Histórico Overbooking & Canceladas ({cancelledBookings.length + cancelledRentals.length})
        </button>
      </div>

      {/* CORPO DE CONTEÚDO */}
      {loading ? (
        <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-connect-blue" />
          <span className="text-xs">Carregando reservas e locações...</span>
        </div>
      ) : error ? (
        <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="text-sm font-semibold text-foreground">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-lg bg-connect-blue text-white text-xs font-bold hover:scale-[1.02] transition-all"
          >
            Tentar novamente
          </button>
        </div>
      ) : activeTab === "temporada" ? (
        <div className="space-y-3">
          <SectionTitle>Reservas Confirmadas & Calendário Bloqueado</SectionTitle>
          <SeasonBookingsList
            bookings={activeBookings}
            hideValues={hideValues}
            canManageRental={canManageRental}
            onEditBooking={(b) => setEditingBooking(b)}
          />
        </div>
      ) : activeTab === "anual" ? (
        <div className="space-y-3">
          <SectionTitle>Contratos de Locação Anual / Comum</SectionTitle>
          <RentalContractsList
            rentals={activeRentals}
            hideValues={hideValues}
            canManageRental={canManageRental}
            canApproveRental={canApproveRental}
            onNewContract={() => setIsNewRentalModalOpen(true)}
            onUpdateStatus={handleRentalStatusUpdate}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <SectionTitle>Prevenção de Overbooking & Reservas Canceladas</SectionTitle>
          <div className="p-3.5 rounded-xl bg-connect-blue/10 border border-connect-blue/20 text-xs text-connect-blue space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-platz-gold" />
              Gestão Ativa de Disponibilidade
            </span>
            <p className="text-[11px] opacity-90">
              Quando uma reserva ou locação é cancelada, o calendário é imediatamente liberado para permitir novas locações sem conflitos. Todos os cancelamentos ficam documentados aqui para fins de auditoria e controle de overbooking.
            </p>
          </div>

          {cancelledBookings.length === 0 && cancelledRentals.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-xs text-muted-foreground">
              Nenhuma reserva cancelada ou registro de overbooking.
            </div>
          ) : (
            <div className="space-y-3">
              {cancelledBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-card border border-red-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground line-through opacity-75">{b.imovelNome}</span>
                      <span className="text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 border border-red-300 dark:border-red-800 px-2 py-0.5 rounded-full">
                        Reserva Cancelada
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Hóspede: <strong className="text-foreground">{b.locatarioNome}</strong>
                    </p>
                    <span className="text-[11px] text-muted-foreground font-mono block">
                      Período liberado: {b.checkIn} até {b.checkOut} ({b.diarias} noites liberadas)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ Calendário liberado
                    </span>
                    {canManageRental && (
                      <button
                        onClick={() => setEditingBooking(b)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        Reativar / Editar
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {cancelledRentals.length > 0 && (
                <RentalContractsList
                  rentals={cancelledRentals}
                  hideValues={hideValues}
                  canManageRental={canManageRental}
                  canApproveRental={canApproveRental}
                  onUpdateStatus={handleRentalStatusUpdate}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAIS */}
      <NewBookingModal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        onSubmit={handleBookingCreated}
      />

      <NewRentalContractModal
        isOpen={isNewRentalModalOpen}
        onClose={() => setIsNewRentalModalOpen(false)}
        onCreated={(contract) => {
          setRentals((prev) => [contract, ...prev]);
          notify(`Contrato ${contract.codigoContrato} firmado com sucesso para ${contract.locatarioNome}!`);
        }}
      />

      <EditBookingModal
        isOpen={Boolean(editingBooking)}
        booking={editingBooking}
        onClose={() => setEditingBooking(null)}
        onUpdated={handleBookingUpdated}
      />
    </div>
  );
}
