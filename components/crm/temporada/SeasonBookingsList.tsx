"use client";

import React from "react";
import { Calendar, Pencil } from "lucide-react";
import { BookingItem } from "./types";

interface SeasonBookingsListProps {
  bookings: BookingItem[];
  hideValues?: boolean;
  canManageRental?: boolean;
  onEditBooking?: (booking: BookingItem) => void;
}

export function SeasonBookingsList({
  bookings,
  hideValues,
  canManageRental,
  onEditBooking,
}: SeasonBookingsListProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center text-xs text-muted-foreground">
        Nenhuma reserva confirmada no período. Clique em "Nova Reserva" para lançar diárias.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div
          key={b.id}
          className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-connect-blue/30 transition-all"
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
              {b.locatarioTelefone ? ` • Tel: ${b.locatarioTelefone}` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono pt-1">
              <span className="flex items-center gap-1 text-amber-700 dark:text-platz-gold font-bold">
                <Calendar className="w-3.5 h-3.5" />
                {b.checkIn} até {b.checkOut} ({b.diarias} diárias)
              </span>
              <span>• Taxa Limpeza: R$ {b.taxaLimpeza}</span>
              <span className="text-connect-blue font-semibold">• Meio: {b.meioPagamento}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-left sm:text-right">
              <span className="text-base font-black text-amber-700 dark:text-[#F8DA56] block">
                {hideValues ? "••••••" : b.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                Conciliado no Caixa
              </span>
            </div>
            {canManageRental && onEditBooking && (
              <button
                onClick={() => onEditBooking(b)}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Editar check-in / diárias"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
