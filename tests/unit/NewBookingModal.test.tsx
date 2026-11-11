import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NewBookingModal } from "@/components/crm/temporada/NewBookingModal";

const mockProps = [
  { id: "prop-1", nome: "Villa Platz Beach", cidade: "Aquiraz", modalidade: "VERANEIO_TEMPORADA", valorDiaria: 1200, taxaLimpeza: 250 },
];
const mockLeads = [
  { id: "lead-1", nome: "Ana Hóspede", telefone: "(85) 99999-1111", email: "ana@teste.com" },
];

vi.mock("@/components/crm/agenda/useCrmLookups", () => ({
  useCrmLookups: () => ({
    properties: mockProps,
    leads: mockLeads,
    members: [],
    loading: false,
  }),
}));

describe("NewBookingModal — Bloqueio de Overbooking e Persistência Real", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exibe alerta visível e mantém modal aberto quando POST /api/bookings retorna 409 Overbooking", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        error: "Choque de disponibilidade (Overbooking): O imóvel já possui reserva confirmada para este período.",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(<NewBookingModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "lead-1" } });

    fireEvent.click(screen.getByRole("button", { name: /Confirmar Reserva/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/Overbooking/i);
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("chama onSubmit com o ID real do servidor e fecha o modal quando POST /api/bookings retorna 201", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        booking: {
          id: "real-uuid-booking-123",
          checkInDate: "2026-12-01T00:00:00.000Z",
          checkOutDate: "2026-12-05T00:00:00.000Z",
          totalNights: 4,
          taxaLimpeza: 250,
          valorTotal: 5050,
          status: "CONFIRMADA",
          property: { nome: "Villa Platz Beach" },
          lead: { nome: "Ana Hóspede", telefone: "85999991111" },
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(<NewBookingModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "lead-1" } });
    fireEvent.click(screen.getByRole("button", { name: /Confirmar Reserva/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      id: "real-uuid-booking-123",
      imovelNome: "Villa Platz Beach",
      locatarioNome: "Ana Hóspede",
      diarias: 4,
      valorTotal: 5050,
      status: "CONFIRMADA",
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
