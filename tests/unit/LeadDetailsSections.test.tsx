import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LeadDetailsSections } from "@/components/crm/lead-drawer/LeadDetailsSections";
import { LeadDetail } from "@/components/crm/LeadDrawer";

vi.mock("@/components/crm/CrmContext", () => ({
  useCrm: () => ({
    hideValues: false,
    formatMoney: (val: number) => `R$ ${Number(val || 0).toLocaleString("pt-BR")}`,
  }),
}));
// Subseções com comportamento próprio (fetch/estado) isoladas deste teste
vi.mock("@/components/crm/lead-drawer/LeadAbordagemSection", () => ({
  LeadAbordagemSection: () => null,
}));
vi.mock("@/components/crm/lead-drawer/LeadAttachmentsSection", () => ({
  LeadAttachmentsSection: () => null,
}));
vi.mock("@/components/crm/lead-drawer/LeadSaleSection", () => ({
  LeadSaleSection: () => null,
}));

const mockLead: LeadDetail = {
  id: "lead-42",
  stageId: "stage-1",
  nome: "Cliente Agenda",
  telefone: "11977776666",
  email: "agenda@teste.com",
  temperatura: "QUENTE",
  source: "META_ADS",
  createdAt: new Date().toISOString(),
} as LeadDetail;

describe("LeadDetailsSections — Compromissos do lead", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("TC-UNIT-06: busca /api/agenda?leadId=<id> e renderiza título, data/hora e tipo", async () => {
    const inicio = "2026-11-05T14:30:00";
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        appointments: [
          { id: "a1", titulo: "Visita ao Reserva Imperial", tipo: "VISITA", status: "AGENDADO", dataInicio: inicio },
          { id: "a2", titulo: "Ligar para confirmar", tipo: "LEMBRETE", status: "AGENDADO", dataInicio: "2026-11-06T09:00:00" },
        ],
      }),
    });

    render(<LeadDetailsSections lead={mockLead} />);

    expect(await screen.findByText("Visita ao Reserva Imperial")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/agenda?leadId=lead-42");

    const d = new Date(inicio);
    const data = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    expect(screen.getByText(`${data} às ${hora}`)).toBeInTheDocument();

    // Badge: VISITA é exibido como "Visita"; demais tipos aparecem crus
    expect(screen.getByText("Visita")).toBeInTheDocument();
    expect(screen.getByText("LEMBRETE")).toBeInTheDocument();
    expect(screen.getByText("Ligar para confirmar")).toBeInTheDocument();
  });

  it("exibe estado vazio quando a API não retorna compromissos", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ appointments: [] }) });
    render(<LeadDetailsSections lead={mockLead} />);
    await waitFor(() =>
      expect(screen.getByText(/nenhum compromisso agendado/i)).toBeInTheDocument()
    );
  });
});
