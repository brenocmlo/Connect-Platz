"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, CreditCard, AlertCircle, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { BookingItem } from "./types";
import { NumericInput } from "@/components/crm/primitives/NumericInput";

interface EditBookingModalProps {
  isOpen: boolean;
  booking: BookingItem | null;
  onClose: () => void;
  onUpdated: (booking: BookingItem) => void;
}

export function EditBookingModal({ isOpen, booking, onClose, onUpdated }: EditBookingModalProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [valorDiaria, setValorDiaria] = useState(0);
  const [taxaLimpeza, setTaxaLimpeza] = useState(0);
  const [meioPagamento, setMeioPagamento] = useState("PIX");
  const [status, setStatus] = useState<"CONFIRMADA" | "CANCELADA">("CONFIRMADA");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!booking) return;
    setCheckIn(booking.checkIn);
    setCheckOut(booking.checkOut);
    setValorDiaria(booking.valorDiaria);
    setTaxaLimpeza(booking.taxaLimpeza);
    setMeioPagamento(booking.meioPagamento);
    setStatus(booking.status === "CANCELADA" ? "CANCELADA" : "CONFIRMADA");
    setError(null);
  }, [booking]);

  if (!isOpen || !booking) return null;

  const totalNights = Math.max(
    1,
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
  );
  const valorTotal = valorDiaria * totalNights + taxaLimpeza;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError("A data de check-out deve ser posterior ao check-in.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkInDate: checkIn,
          checkOutDate: checkOut,
          valorDiarias: valorDiaria * totalNights,
          taxaLimpeza,
          meioPagamento,
          status,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Erro ao atualizar reserva.");
        return;
      }

      onUpdated({
        ...booking,
        checkIn,
        checkOut,
        diarias: totalNights,
        valorDiaria,
        taxaLimpeza,
        valorTotal,
        meioPagamento: meioPagamento as any,
        status,
      });
      onClose();
    } catch {
      setError("Falha de conexão ao atualizar reserva.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">Editar Reserva de Temporada</h3>
            <p className="text-xs text-muted-foreground truncate max-w-xs">
              {booking.imovelNome} • {booking.locatarioNome}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Status da Reserva */}
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Status da Reserva</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("CONFIRMADA")}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  status === "CONFIRMADA"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirmada
              </button>
              <button
                type="button"
                onClick={() => setStatus("CANCELADA")}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  status === "CANCELADA"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Cancelada
              </button>
            </div>
            {status === "CANCELADA" && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-1">
                *O cancelamento libera as datas no calendário imediatamente e evita overbooking.
              </span>
            )}
          </div>

          {/* Check-in e Check-out */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-connect-blue" /> Check-in
              </label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-connect-blue" /> Check-out
              </label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
          </div>

          {/* Valores */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Diária (R$)</label>
              <NumericInput
                value={valorDiaria}
                onChange={setValorDiaria}
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Taxa Limpeza (R$)</label>
              <NumericInput
                value={taxaLimpeza}
                onChange={setTaxaLimpeza}
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-connect-blue"
              />
            </div>
          </div>

          {/* Meio de Pagamento */}
          <div>
            <label className="block font-semibold text-muted-foreground mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-connect-blue" /> Meio de Pagamento
            </label>
            <select
              value={meioPagamento}
              onChange={(e) => setMeioPagamento(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-connect-blue"
            >
              <option value="PIX">PIX</option>
              <option value="CARTAO_CREDITO">Cartão de Crédito</option>
              <option value="CARTAO_DEBITO">Cartão de Débito</option>
              <option value="BOLETO">Boleto Bancário</option>
              <option value="TED">Transferência TED</option>
            </select>
          </div>

          {/* Resumo */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">
              {totalNights} {totalNights === 1 ? "noite" : "noites"} • Total:
            </span>
            <span className="text-sm font-extrabold text-amber-700 dark:text-[#F8DA56]">
              {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-connect-blue hover:bg-connect-deep-blue text-white font-bold flex items-center gap-1.5 shadow-md shadow-connect-blue/20 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
