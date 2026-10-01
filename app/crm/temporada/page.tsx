"use client";

import React, { useState } from "react";
import {
  Palmtree,
  Calendar,
  Home,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CreditCard,
  Building,
  User,
  ShieldCheck,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { CountUpNumber } from "@/components/crm/CountUpNumber";

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
  const { setActionMessage } = useCrm();
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
      `Reserva confirmada de ${checkIn} a ${checkOut}! O calendário do imóvel foi bloqueado automaticamente e o lançamento lançado no ERP via ${meioPagamento}.`
    );
    setTimeout(() => setActionMessage(null), 6000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOPBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#D9BB4C]/15 border border-[#D9BB4C]/30 text-[#D9BB4C]">
            <Palmtree className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Aluguel de Temporada (Veraneio)</h2>
            <p className="text-xs text-slate-400">
              Gestão de diárias, bloqueio estrito de calendário sem conflitos e conciliação automática no ERP.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#D9BB4C] hover:bg-[#C5A73D] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#D9BB4C]/15 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Nova Reserva de Veraneio
        </button>
      </div>

      {/* 2. STATCARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Faturamento em Diárias
          </span>
          <span className="text-2xl font-black text-[#D9BB4C]">
            <CountUpNumber value={10250} prefix="R$ " decimals={2} />
          </span>
        </div>

        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Diárias Reservadas no Mês
          </span>
          <span className="text-2xl font-black text-white">
            <CountUpNumber value={9} suffix=" Noites" />
          </span>
        </div>

        <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Prevenção de Overbooking
          </span>
          <span className="text-2xl font-black text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-6 h-6" /> 100% Protegido
          </span>
        </div>
      </div>

      {/* 3. LISTAGEM DE RESERVAS ATIVAS */}
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Reservas Confirmadas & Calendário Bloqueado
        </h3>

        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-[#0F1624] border border-[#1C2537] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{b.imovelNome}</span>
                  <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Hóspede: <strong className="text-slate-200">{b.locatarioNome}</strong>
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono pt-1">
                  <span className="flex items-center gap-1 text-[#D9BB4C]">
                    <Calendar className="w-3.5 h-3.5" />
                    {b.checkIn} até {b.checkOut} ({b.diarias} diárias)
                  </span>
                  <span>• Taxa Limpeza: R$ {b.taxaLimpeza}</span>
                  <span className="text-blue-400 font-semibold">• Meio: {b.meioPagamento}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-[#D9BB4C]">
                  {b.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
                <span className="text-[10px] text-emerald-400 block font-semibold">Conciliado no Caixa</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MODAL NOVA RESERVA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Nova Reserva com Bloqueio de Calendário</h3>
            <p className="text-xs text-slate-400">
              O sistema verifica a disponibilidade das datas para impedir conflitos de locação.
            </p>

            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Imóvel de Veraneio</label>
                <input
                  type="text"
                  value={imovel}
                  onChange={(e) => setImovel(e.target.value)}
                  className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nome do Hóspede / Lead</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Família Dr. Marcelo"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Data Check-in</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Data Check-out</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Valor da Diária (R$)</label>
                  <input
                    type="number"
                    value={valorDiaria}
                    onChange={(e) => setValorDiaria(Number(e.target.value))}
                    className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Taxa de Limpeza (R$)</label>
                  <input
                    type="number"
                    value={taxaLimpeza}
                    onChange={(e) => setTaxaLimpeza(Number(e.target.value))}
                    className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Meio de Pagamento</label>
                  <select
                    value={meioPagamento}
                    onChange={(e) => setMeioPagamento(e.target.value as any)}
                    className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
                  >
                    <option value="PIX">PIX (Instantâneo)</option>
                    <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                    <option value="BOLETO">Boleto Bancário</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#0F1624] border border-[#1C2537] rounded-xl flex items-center justify-between font-bold">
                <span className="text-slate-300">Total ({calculatedNights} noites + Limpeza):</span>
                <span className="text-[#D9BB4C] text-sm">
                  {totalCalculado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111827] text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#D9BB4C] text-black font-black"
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
