import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewSaleModal } from "@/components/crm/vendas/NewSaleModal";

vi.mock("@/components/crm/CrmContext", () => ({
  useCrm: () => ({
    user: { id: "admin-1", nome: "Robson Administrador", role: "ADMINISTRADOR" },
    formatMoney: (val: number) => `R$ ${Number(val || 0).toLocaleString("pt-BR")}`,
  }),
}));

const mockLeads = [
  { id: "lead-vip", nome: "Cliente VIP Ganho", telefone: "11988889999", email: "vip@teste.com" },
];
const mockProperties = [
  { id: "prop-1", nome: "Reserva das Flores", valorVenda: 650000, cidade: "São Paulo", construtora: "Platz" },
];
const mockMembers = [
  { id: "broker-1", nome: "Lucas Corretor", role: "CORRETOR" },
];

vi.mock("@/components/crm/agenda/useCrmLookups", () => ({
  useCrmLookups: () => ({
    leads: mockLeads,
    properties: mockProperties,
    members: mockMembers,
    loading: false,
  }),
}));

describe("NewSaleModal — Pré-preenchimento ao vir de Lead Ganho", () => {
  it("TC-UNIT-07: Pré-preenche o comprador e seleciona automaticamente o imóvel de interesse", () => {
    render(
      <NewSaleModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        preselectedLead={{
          id: "lead-vip",
          nome: "Cliente VIP Ganho",
          telefone: "11988889999",
          email: "vip@teste.com",
          empreendimentoInteresse: "Reserva das Flores",
          corretorId: "broker-1",
        }}
      />
    );

    expect(screen.getByText(/Nova Venda & Split de Comissões/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Cliente VIP Ganho")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Reserva das Flores")).toBeInTheDocument();
  });
});
